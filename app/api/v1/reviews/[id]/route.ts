import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required." },
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Review not found." },
        },
        { status: 404 }
      );
    }

    const isAuthor = user.id === review.userId;
    const isAdministrator = isAdmin(user.roles);

    if (!isAuthor && !isAdministrator) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "You can only delete your own reviews." },
        },
        { status: 403 }
      );
    }

    const businessId = review.businessId;

    await prisma.review.delete({
      where: { id },
    });

    // Recalculate average rating & count
    const aggregate = await prisma.review.aggregate({
      where: {
        businessId,
        isFlagged: false,
      },
      _avg: { rating: true },
      _count: { id: true },
    });

    const newAvg = Number((aggregate._avg.rating || 0).toFixed(1));
    const newCount = aggregate._count.id;

    await prisma.business.update({
      where: { id: businessId },
      data: {
        ratingAverage: newAvg,
        reviewCount: newCount,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully.",
      data: {
        updatedRatingAverage: newAvg,
        updatedReviewCount: newCount,
      },
    });
  } catch (error) {
    console.error("Review delete error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to delete review." },
      },
      { status: 500 }
    );
  }
}
