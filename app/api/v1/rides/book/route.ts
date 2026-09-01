import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required to book a ride or cargo loader." } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const {
      cityId,
      serviceType = "PASSENGER_RIDE",
      vehicleCategory = "BIKE",
      pickupAddress,
      dropoffAddress,
      pickupArea = "Main Bazaar",
      dropoffArea = "College Road",
      cargoDescription,
      estimatedWeightKg,
      riderId,
      fareAmount,
      paymentMethod = "CASH",
    } = body;

    if (!cityId || !pickupAddress || !dropoffAddress) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_FAILED", message: "Pickup address, dropoff address and city are required." } },
        { status: 400 }
      );
    }

    // Default standard fares if not explicitly computed
    const baseFares: Record<string, number> = {
      BIKE: 70,
      AUTO_RICKSHAW: 150,
      LOADER_RICKSHAW: 400,
      CAR_TAXI: 350,
      PICKUP_TRUCK: 800,
    };

    const finalFare = fareAmount ? parseFloat(fareAmount) : (baseFares[vehicleCategory] || 100);
    const bookingNumber = `RIDE-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`;
    const completionPin = Math.floor(1000 + Math.random() * 9000).toString();

    const booking = await prisma.rideBooking.create({
      data: {
        cityId,
        bookingNumber,
        customerId: user.id,
        riderId: riderId || null,
        serviceType,
        vehicleCategory,
        pickupAddress,
        dropoffAddress,
        pickupArea,
        dropoffArea,
        cargoDescription: cargoDescription || null,
        estimatedWeightKg: estimatedWeightKg ? parseFloat(estimatedWeightKg) : null,
        fareAmount: finalFare,
        paymentMethod,
        completionPin,
        status: riderId ? "REQUESTED" : "REQUESTED",
      },
      include: {
        rider: {
          include: {
            user: { select: { fullName: true, phoneNumber: true } },
          },
        },
        city: true,
      },
    });

    // Notify driver if directly assigned
    if (riderId) {
      const selectedRider = await prisma.deliveryRider.findUnique({ where: { id: riderId } });
      if (selectedRider) {
        await prisma.notification.create({
          data: {
            userId: selectedRider.userId,
            title: serviceType === "MERCHANT_CARGO" ? "🚚 New Merchant Cargo Request!" : "🚖 New Direct Ride Booking!",
            titleUr: serviceType === "MERCHANT_CARGO" ? "نیا مال بردار لوڈر آرڈر" : "نئی سواری بکنگ",
            message: `${user.fullName} requested a ${vehicleCategory} from ${pickupArea} to ${dropoffArea}. Fare: PKR ${finalFare}`,
            messageUr: `نئی بکنگ: ${pickupArea} تا ${dropoffArea}۔ کرایہ: ${finalFare} روپے`,
            type: "GENERAL",
            link: "/rider/dashboard",
          },
        }).catch(() => {});
      }
    } else {
      // Broadcast to available drivers in city
      const availableRiders = await prisma.deliveryRider.findMany({
        where: { cityId, vehicleCategory, status: "APPROVED", isAvailable: true },
        select: { userId: true },
      });

      for (const r of availableRiders) {
        await prisma.notification.create({
          data: {
            userId: r.userId,
            title: serviceType === "MERCHANT_CARGO" ? "🚚 Open Cargo Lead in City" : "🚖 Open Passenger Ride Lead",
            titleUr: "شہر میں نئی سواری یا لوڈر لیڈ",
            message: `New booking available from ${pickupArea} to ${dropoffArea}. Fare: PKR ${finalFare}`,
            type: "GENERAL",
            link: "/rider/dashboard",
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ride request created successfully.",
        data: { booking },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ride booking error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to book ride." } },
      { status: 500 }
    );
  }
}
