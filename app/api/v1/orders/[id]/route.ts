import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";

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
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        business: {
          include: {
            locations: true,
            owner: { select: { fullName: true, phoneNumber: true } },
          },
        },
        customer: {
          select: { id: true, fullName: true, phoneNumber: true },
        },
        rider: {
          include: {
            user: { select: { fullName: true, phoneNumber: true, avatarUrl: true } },
          },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
          },
        },
        payment: true,
        review: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error("Order detail error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch order." } },
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
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        business: true,
        rider: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found." } },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { status, riderId, deliveryPin } = body;

    const isCustomer = user.id === order.customerId;
    const isMerchant = user.id === order.business.ownerId;
    const isAssignedRider = order.rider && order.rider.userId === user.id;
    const isAdministrator = isAdmin(user.roles);

    if (!isCustomer && !isMerchant && !isAssignedRider && !isAdministrator) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Unauthorized to update order status." } },
        { status: 403 }
      );
    }

    // Validation for DELIVERED state (Proof of delivery PIN)
    if (status === "DELIVERED") {
      if (deliveryPin && deliveryPin !== order.deliveryPin) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_DELIVERY_PIN",
              message: "Incorrect 4-digit Delivery PIN. Please ask the customer for the correct PIN code.",
            },
          },
          { status: 400 }
        );
      }
    }

    // Update order
    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(riderId && { riderId }),
          ...(status === "DELIVERED" && { paymentStatus: "PAID" }),
        },
        include: {
          business: true,
          customer: true,
          rider: { include: { user: true } },
        },
      });

      // Update payment status if paid on delivery
      if (status === "DELIVERED") {
        await tx.payment.update({
          where: { orderId: id },
          data: { status: "PAID" },
        });

        // Increment rider stats
        if (order.riderId) {
          await tx.deliveryRider.update({
            where: { id: order.riderId },
            data: {
              deliveriesCompleted: { increment: 1 },
              totalEarnings: { increment: order.deliveryFee },
            },
          });
        }
      }

      // If READY_FOR_PICKUP, broadcast notification to available riders
      if (status === "READY_FOR_PICKUP") {
        const availableRiders = await tx.deliveryRider.findMany({
          where: { cityId: order.cityId, status: "APPROVED", isAvailable: true },
          select: { userId: true },
        });

        for (const r of availableRiders) {
          await tx.notification.create({
            data: {
              userId: r.userId,
              title: `Order Ready For Pickup (${ord.business.name})`,
              titleUr: "آرڈر پک اپ کیلئے تیار ہے",
              message: `Order #${ord.orderNumber} is ready at ${ord.business.name}. Delivery Fee: PKR ${ord.deliveryFee}. Tap to claim.`,
              messageUr: `آرڈر #${ord.orderNumber} تیار ہے۔ ڈلیوری معاوضہ: ${ord.deliveryFee} روپے`,
              type: "ORDER_STATUS",
              link: `/rider/dashboard`,
            },
          });
        }
      }

      // Notify customer of order status change
      await tx.notification.create({
        data: {
          userId: ord.customerId,
          title: `Order #${ord.orderNumber} Update: ${status}`,
          titleUr: "آرڈر کی صورتحال اپ ڈیٹ",
          message: `Your order status changed to ${status}.`,
          type: "ORDER_STATUS",
          link: `/orders/${ord.id}`,
        },
      });

      return ord;
    });

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: { order: updated },
    });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update order." } },
      { status: 500 }
    );
  }
}
