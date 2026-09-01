import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { orderReviewSchema } from "@/lib/validation";

export async function POST(
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
    const { id: orderId } = await params;
    const body = await req.json();
    const validated = orderReviewSchema.safeParse({ ...body, orderId });

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid review data",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { rating, comment, riderRating } = validated.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { review: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found." } },
        { status: 404 }
      );
    }

    if (order.customerId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only the customer who ordered can review." } },
        { status: 403 }
      );
    }

    if (order.status !== "DELIVERED" && order.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_DELIVERED", message: "You can only review delivered orders." } },
        { status: 400 }
      );
    }

    if (order.review) {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_REVIEWED", message: "You have already reviewed this order." } },
        { status: 409 }
      );
    }

    const review = await prisma.orderReview.create({
      data: {
        orderId,
        customerId: user.id,
        businessId: order.businessId,
        riderId: order.riderId || null,
        rating,
        comment,
        riderRating: riderRating || null,
      },
    });

    // Update order status to COMPLETED
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your order review has been recorded.",
        data: { review },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order review error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to submit review." } },
      { status: 500 }
    );
  }
}
