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

    const orders = await prisma.order.findMany({
      where: {
        ...(status && status !== "ALL" ? { status } : {}),
      },
      include: {
        business: { select: { name: true, phone: true } },
        customer: { select: { fullName: true, phoneNumber: true } },
        rider: {
          include: {
            user: { select: { fullName: true, phoneNumber: true } },
          },
        },
        items: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch orders." } },
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
    const { orderId, riderId } = body;

    if (!orderId || !riderId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_FAILED", message: "Order ID and Rider ID are required." } },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        riderId,
        status: "OUT_FOR_DELIVERY",
      },
      include: {
        business: true,
        customer: true,
        rider: { include: { user: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Rider manually assigned to order.",
      data: { order: updated },
    });
  } catch (error) {
    console.error("Admin order assignment error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to assign rider." } },
      { status: 500 }
    );
  }
}
