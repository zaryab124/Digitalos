import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  try {
    const rider = await prisma.deliveryRider.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });

    if (!rider || rider.status !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAPPROVED_RIDER",
            message: "Only approved and verified delivery riders can claim orders.",
          },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_FAILED", message: "Order ID is required." } },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { business: true, customer: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found." } },
        { status: 404 }
      );
    }

    if (order.status !== "READY_FOR_PICKUP" && order.status !== "ACCEPTED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_READY",
            message: "This order is not ready for pickup.",
          },
        },
        { status: 400 }
      );
    }

    // Atomic claim
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          riderId: rider.id,
          status: "OUT_FOR_DELIVERY",
        },
        include: {
          business: true,
          customer: true,
          rider: { include: { user: true } },
        },
      });

      // Send customer notification
      await tx.notification.create({
        data: {
          userId: order.customerId,
          title: "Order Picked Up by Rider",
          titleUr: "رائڈر نے آرڈر وصول کر لیا ہے",
          message: `${rider.user.fullName} (${rider.user.phoneNumber}) is delivering your order #${ord.orderNumber}. Give PIN: ${ord.deliveryPin} upon delivery.`,
          messageUr: `رائڈر آرڈر لے کر روانہ ہو چکا ہے۔ ڈلیوری کے وقت پن کوڈ ${ord.deliveryPin} بتائیں۔`,
          type: "ORDER_STATUS",
          link: `/orders/${ord.id}`,
        },
      });

      return ord;
    });

    return NextResponse.json({
      success: true,
      message: `You have claimed order #${updatedOrder.orderNumber}! Proceed to ${order.business.name} for pickup.`,
      data: { order: updatedOrder },
    });
  } catch (error) {
    console.error("Order claim error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to claim order." } },
      { status: 500 }
    );
  }
}
