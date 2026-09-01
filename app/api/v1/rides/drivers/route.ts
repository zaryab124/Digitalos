import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const citySlug = searchParams.get("city") || "jampur";
    const category = searchParams.get("category"); // BIKE, AUTO_RICKSHAW, LOADER_RICKSHAW, CAR_TAXI
    const serviceType = searchParams.get("serviceType"); // PASSENGER_RIDE, MERCHANT_CARGO, PARCEL_DELIVERY

    const city = await prisma.city.findFirst({
      where: { slug: citySlug, isActive: true },
    });

    if (!city) {
      return NextResponse.json(
        { success: false, error: { code: "CITY_NOT_FOUND", message: "City not found." } },
        { status: 404 }
      );
    }

    const where: any = {
      cityId: city.id,
      status: "APPROVED",
    };

    if (category && category !== "ALL") {
      where.vehicleCategory = category;
    }

    const riders = await prisma.deliveryRider.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            fullNameUr: true,
            phoneNumber: true,
            avatarUrl: true,
          },
        },
        city: { select: { id: true, name: true, nameUr: true } },
      },
      orderBy: [{ isAvailable: "desc" }, { ratingAverage: "desc" }],
    });

    // Filter by serviceType if provided in query
    const filteredRiders = serviceType
      ? riders.filter((r) => {
          try {
            const types: string[] = JSON.parse(r.serviceTypes || "[]");
            return types.includes(serviceType);
          } catch {
            return true;
          }
        })
      : riders;

    return NextResponse.json({
      success: true,
      data: {
        city: city.name,
        totalDrivers: filteredRiders.length,
        drivers: filteredRiders.map((r) => ({
          id: r.id,
          name: r.user.fullName,
          nameUr: r.user.fullNameUr,
          phoneNumber: r.user.phoneNumber,
          avatarUrl: r.user.avatarUrl,
          vehicleCategory: r.vehicleCategory,
          vehicleType: r.vehicleType,
          vehicleMakeModel: r.vehicleMakeModel,
          vehicleNumber: r.vehicleNumber,
          cargoCapacityKg: r.cargoCapacityKg,
          baseFare: r.baseFare,
          perKmRate: r.perKmRate,
          isAvailable: r.isAvailable,
          isVerified: r.isVerified,
          ratingAverage: r.ratingAverage,
          reviewCount: r.reviewCount,
          ridesCompleted: r.ridesCompleted,
          cargoTripsCompleted: r.cargoTripsCompleted,
          deliveriesCompleted: r.deliveriesCompleted,
          serviceTypes: JSON.parse(r.serviceTypes || "[]"),
        })),
      },
    });
  } catch (error) {
    console.error("Fetch drivers error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch drivers." } },
      { status: 500 }
    );
  }
}
