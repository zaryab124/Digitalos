import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { riderRegistrationSchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const citySlug = searchParams.get("city") || "jampur";

    const city = await prisma.city.findFirst({
      where: { slug: citySlug, isActive: true },
    });

    if (!city) {
      return NextResponse.json(
        { success: false, error: { code: "CITY_NOT_FOUND", message: "City not found." } },
        { status: 404 }
      );
    }

    const riders = await prisma.deliveryRider.findMany({
      where: {
        cityId: city.id,
        status: "APPROVED",
      },
      include: {
        user: { select: { fullName: true, phoneNumber: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: { riders },
    });
  } catch (error) {
    console.error("Riders fetch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch riders." } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  try {
    const existing = await prisma.deliveryRider.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_REGISTERED", message: "You already have a rider profile." } },
        { status: 409 }
      );
    }

    const body = await req.json();
    const validated = riderRegistrationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid rider registration data",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Ensure user has RIDER role
    if (!user.roles.includes("RIDER")) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: "RIDER" },
      }).catch(() => {});
    }

    // Create Rider with PENDING status
    const rider = await prisma.deliveryRider.create({
      data: {
        userId: user.id,
        cityId: data.cityId,
        vehicleType: data.vehicleType,
        vehicleNumber: data.vehicleNumber,
        cnicNumber: data.cnicNumber,
        status: "PENDING", // Strict check: starts as PENDING
        isVerified: false,
        isAvailable: false,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "RIDER_REGISTERED",
        entityType: "RIDER",
        entityId: rider.id,
        details: JSON.stringify({ vehicle: data.vehicleType, number: data.vehicleNumber }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Rider application submitted! Awaiting administrative verification.",
        data: { rider },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Rider registration error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to register rider." } },
      { status: 500 }
    );
  }
}
