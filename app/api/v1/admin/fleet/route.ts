import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.roles)) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Admin privileges required." } },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get("cityId");
    const vehicleCategory = searchParams.get("category");
    const status = searchParams.get("status");

    const where: any = {};
    if (cityId && cityId !== "ALL") where.cityId = cityId;
    if (vehicleCategory && vehicleCategory !== "ALL") where.vehicleCategory = vehicleCategory;
    if (status && status !== "ALL") where.status = status;

    const drivers = await prisma.deliveryRider.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, fullNameUr: true, phoneNumber: true, email: true, avatarUrl: true } },
        city: true,
        _count: {
          select: {
            assignedOrders: true,
            rideBookings: true,
            rideReviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      totalFleet: drivers.length,
      pendingApproval: drivers.filter((d) => d.status === "PENDING").length,
      activeApproved: drivers.filter((d) => d.status === "APPROVED").length,
      onlineNow: drivers.filter((d) => d.isAvailable && d.status === "APPROVED").length,
      bikes: drivers.filter((d) => d.vehicleCategory === "BIKE").length,
      rickshaws: drivers.filter((d) => d.vehicleCategory === "AUTO_RICKSHAW").length,
      loaders: drivers.filter((d) => d.vehicleCategory === "LOADER_RICKSHAW").length,
      cars: drivers.filter((d) => d.vehicleCategory === "CAR_TAXI").length,
    };

    return NextResponse.json({
      success: true,
      data: { stats, drivers },
    });
  } catch (error) {
    console.error("Admin fleet query error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch fleet." } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.roles)) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Admin privileges required." } },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { driverId, status, isVerified, vehicleCategory, cargoCapacityKg, baseFare, perKmRate } = body;

    if (!driverId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_FAILED", message: "Driver ID is required." } },
        { status: 400 }
      );
    }

    const updated = await prisma.deliveryRider.update({
      where: { id: driverId },
      data: {
        ...(status && { status }),
        ...(isVerified !== undefined && { isVerified }),
        ...(vehicleCategory && { vehicleCategory }),
        ...(cargoCapacityKg !== undefined && { cargoCapacityKg: parseFloat(cargoCapacityKg) }),
        ...(baseFare !== undefined && { baseFare: parseFloat(baseFare) }),
        ...(perKmRate !== undefined && { perKmRate: parseFloat(perKmRate) }),
        ...(status === "APPROVED" && { isAvailable: true }),
      },
      include: { user: true, city: true },
    });

    // Notify driver
    if (status === "APPROVED") {
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: "🎉 Driver Application Approved!",
          titleUr: "ڈرائیور / رائڈر رجسٹریشن منظور ہو چکی ہے",
          message: `Your ${updated.vehicleCategory} has been approved for operations in ${updated.city.name}. You are now ONLINE to receive trips and cargo loading requests.`,
          messageUr: `آپ کی گاڑی منظور ہو چکی ہے۔ اب آپ سواری اور لوڈر آرڈرز وصول کر سکتے ہیں۔`,
          type: "GENERAL",
          link: "/rider/dashboard",
        },
      }).catch(() => {});
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: `FLEET_DRIVER_${status || "UPDATED"}`,
        entityType: "DELIVERY_RIDER",
        entityId: driverId,
        details: JSON.stringify({ status, isVerified, vehicleCategory }),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Driver status successfully updated to ${status || "updated"}.`,
      data: { driver: updated },
    });
  } catch (error) {
    console.error("Admin fleet update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update fleet driver." } },
      { status: 500 }
    );
  }
}
