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
    const status = searchParams.get("status");

    const riders = await prisma.deliveryRider.findMany({
      where: {
        ...(status && status !== "ALL" ? { status } : {}),
      },
      include: {
        user: { select: { fullName: true, phoneNumber: true, email: true } },
        city: true,
        _count: { select: { assignedOrders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { riders },
    });
  } catch (error) {
    console.error("Admin riders error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch riders." } },
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
    const { riderId, status, isVerified } = body;

    if (!riderId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_FAILED", message: "Rider ID is required." } },
        { status: 400 }
      );
    }

    const updated = await prisma.deliveryRider.update({
      where: { id: riderId },
      data: {
        ...(status && { status }),
        ...(isVerified !== undefined && { isVerified }),
        ...(status === "APPROVED" && { isAvailable: true }),
      },
      include: { user: true },
    });

    // Notify rider
    if (status === "APPROVED") {
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: "🎉 Rider Application Approved!",
          titleUr: "رائڈر رجسٹریشن منظور ہو چکی ہے",
          message: "You can now view available delivery orders and start earning.",
          messageUr: "آپ کی رجسٹریشن منظور کر لی گئی ہے۔ اب آپ ڈلیوری آرڈرز وصول کر سکتے ہیں۔",
          type: "GENERAL",
          link: "/rider/dashboard",
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: `RIDER_${status}`,
        entityType: "RIDER",
        entityId: riderId,
        details: JSON.stringify({ status, isVerified }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Rider status updated to ${status}.`,
      data: { rider: updated },
    });
  } catch (error) {
    console.error("Admin rider update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update rider." } },
      { status: 500 }
    );
  }
}
