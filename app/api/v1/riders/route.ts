import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
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
  try {
    let user = await getCurrentUser();
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
    let isNewUser = false;
    let sessionToken = "";

    // If unauthenticated, register the user first
    if (!user) {
      if (!data.phoneNumber || !data.password || !data.fullName) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Please provide Full Name, Phone Number, and Password to register as a Driver.",
            },
          },
          { status: 401 }
        );
      }

      // Check existing phone
      const phoneNorm = data.phoneNumber.startsWith("0")
        ? `+92${data.phoneNumber.slice(1)}`
        : data.phoneNumber;

      const existingPhone = await prisma.user.findUnique({
        where: { phoneNumber: phoneNorm },
      });

      if (existingPhone) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "PHONE_EXISTS",
              message: "An account with this phone number already exists. Please login first.",
            },
          },
          { status: 409 }
        );
      }

      const passwordHash = await hashPassword(data.password);
      const newUser = await prisma.user.create({
        data: {
          cityId: data.cityId,
          phoneNumber: phoneNorm,
          fullName: data.fullName,
          passwordHash,
          isPhoneVerified: true,
          roles: {
            create: [{ roleId: "RIDER" }, { roleId: "CUSTOMER" }],
          },
        },
      });

      user = {
        id: newUser.id,
        phoneNumber: newUser.phoneNumber,
        email: newUser.email,
        cityId: newUser.cityId,
        roles: ["RIDER", "CUSTOMER"],
      } as any;

      isNewUser = true;
      sessionToken = await createSessionToken({
        userId: newUser.id,
        phone: newUser.phoneNumber,
        email: newUser.email,
        roles: ["RIDER", "CUSTOMER"],
        cityId: newUser.cityId,
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User session creation failed." } },
        { status: 401 }
      );
    }

    // Check if rider profile already exists
    const existing = await prisma.deliveryRider.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_REGISTERED", message: "You already have a rider profile." } },
        { status: 409 }
      );
    }

    // Ensure user has RIDER role
    if (!user.roles.includes("RIDER")) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: "RIDER" },
      }).catch(() => {});
    }

    // Default fare rates based on vehicle category
    const fareDefaults: Record<string, { base: number; perKm: number; cap: number; vType: string }> = {
      BIKE: { base: 50, perKm: 20, cap: 20, vType: "MOTORCYCLE" },
      AUTO_RICKSHAW: { base: 80, perKm: 35, cap: 150, vType: "RICKSHAW" },
      LOADER_RICKSHAW: { base: 250, perKm: 50, cap: 800, vType: "LOADER" },
      CAR_TAXI: { base: 200, perKm: 50, cap: 300, vType: "CAR" },
      PICKUP_TRUCK: { base: 500, perKm: 80, cap: 1500, vType: "TRUCK" },
    };

    const categoryConfig = fareDefaults[data.vehicleCategory] || fareDefaults.BIKE;

    // Create Rider
    const rider = await prisma.deliveryRider.create({
      data: {
        userId: user.id,
        cityId: data.cityId,
        vehicleCategory: data.vehicleCategory,
        vehicleType: categoryConfig.vType,
        vehicleMakeModel: data.vehicleMakeModel || null,
        vehicleNumber: data.vehicleNumber,
        cnicNumber: data.cnicNumber,
        licenseNumber: data.licenseNumber || null,
        serviceTypes: JSON.stringify(data.serviceTypes || ["PASSENGER_RIDE"]),
        cargoCapacityKg: data.cargoCapacityKg || categoryConfig.cap,
        baseFare: categoryConfig.base,
        perKmRate: categoryConfig.perKm,
        status: "APPROVED", // Auto-approved for verified beta or municipal roster
        isVerified: true,
        isAvailable: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "RIDER_REGISTERED",
        entityType: "RIDER",
        entityId: rider.id,
        details: JSON.stringify({ category: data.vehicleCategory, number: data.vehicleNumber }),
      },
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Driver application approved! Welcome to the Jampur Fleet.",
        data: { rider },
      },
      { status: 201 }
    );

    if (isNewUser && sessionToken) {
      response.cookies.set(AUTH_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("Rider registration error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to register rider." } },
      { status: 500 }
    );
  }
}
