import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const booking = await prisma.rideBooking.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, fullName: true, phoneNumber: true, avatarUrl: true } },
        rider: {
          include: {
            user: { select: { id: true, fullName: true, phoneNumber: true, avatarUrl: true } },
          },
        },
        city: true,
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Ride booking not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    console.error("Ride detail error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch ride." } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const booking = await prisma.rideBooking.findUnique({
      where: { id },
      include: {
        rider: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Ride booking not found." } },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { status, completionPin } = body;

    const riderProfile = await prisma.deliveryRider.findUnique({
      where: { userId: user.id },
    });

    // Check permissions
    const isCustomer = user.id === booking.customerId;
    const isAssignedDriver = riderProfile && booking.riderId === riderProfile.id;
    const isDriverClaiming = riderProfile && !booking.riderId && status === "ACCEPTED";

    if (!isCustomer && !isAssignedDriver && !isDriverClaiming) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Unauthorized to update this ride." } },
        { status: 403 }
      );
    }

    // Driver claims open ride
    let assignedRiderId = booking.riderId;
    if (isDriverClaiming && riderProfile) {
      assignedRiderId = riderProfile.id;
    }

    // Verification for COMPLETED state (Proof of ride PIN)
    if (status === "COMPLETED") {
      if (completionPin && completionPin !== booking.completionPin) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_RIDE_PIN",
              message: "Incorrect 4-digit ride verification PIN. Ask the customer for their PIN code.",
            },
          },
          { status: 400 }
        );
      }
    }

    // Update in database transaction
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.rideBooking.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(assignedRiderId && { riderId: assignedRiderId }),
          ...(status === "COMPLETED" && { paymentStatus: "PAID" }),
        },
        include: {
          customer: true,
          rider: { include: { user: true } },
        },
      });

      // Update rider earnings & counters if completed
      if (status === "COMPLETED" && b.riderId) {
        await tx.deliveryRider.update({
          where: { id: b.riderId },
          data: {
            ...(b.serviceType === "MERCHANT_CARGO"
              ? { cargoTripsCompleted: { increment: 1 } }
              : { ridesCompleted: { increment: 1 } }),
            totalEarnings: { increment: b.fareAmount },
          },
        });
      }

      // Notify customer
      await tx.notification.create({
        data: {
          userId: b.customerId,
          title: `Ride Update: ${status}`,
          titleUr: `سواری کی اپ ڈیٹ: ${status}`,
          message: `Your booking #${b.bookingNumber} is now ${status}.`,
          type: "GENERAL",
          link: `/rides/my-rides`,
        },
      }).catch(() => {});

      return b;
    });

    return NextResponse.json({
      success: true,
      message: `Ride status updated to ${status}.`,
      data: { booking: updated },
    });
  } catch (error) {
    console.error("Update ride status error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update ride." } },
      { status: 500 }
    );
  }
}
