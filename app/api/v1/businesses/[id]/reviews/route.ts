import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Please log in to submit a review." },
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const business = await prisma.business.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!business) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Business not found." },
        },
        { status: 404 }
      );
    }

    if (business.status !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_ALLOWED", message: "Cannot review a business that is not approved." },
        },
        { status: 400 }
      );
    }

    // Abuse prevention: Owners cannot review their own businesses
    if (business.ownerId === user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SELF_REVIEW_NOT_ALLOWED",
            message: "You cannot submit a review for your own business.",
          },
        },
        { status: 400 }
      );
    }

    // Abuse prevention: Check if user already reviewed this business
    const existingReview = await prisma.review.findUnique({
      where: {
        businessId_userId: {
          businessId: business.id,
          userId: user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_REVIEW",
            message: "You have already reviewed this business. You can edit or delete your existing review.",
          },
        },
        { status: 409 }
      );
    }

    const body = await req.json();
    const validated = reviewSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid review input",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { rating, comment } = validated.data;

    // Create review
    const review = await prisma.review.create({
      data: {
        businessId: business.id,
        userId: user.id,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            fullNameUr: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Recalculate average rating & review count
    const aggregate = await prisma.review.aggregate({
      where: {
        businessId: business.id,
        isFlagged: false,
      },
      _avg: { rating: true },
      _count: { id: true },
    });

    const newAvg = Number((aggregate._avg.rating || 0).toFixed(1));
    const newCount = aggregate._count.id;

    await prisma.business.update({
      where: { id: business.id },
      data: {
        ratingAverage: newAvg,
        reviewCount: newCount,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully!",
        data: {
          review,
          updatedRatingAverage: newAvg,
          updatedReviewCount: newCount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to submit review." },
      },
      { status: 500 }
    );
  }
}
