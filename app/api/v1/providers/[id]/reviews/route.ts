import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { providerReviewSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Please log in to submit a review." } },
      { status: 401 }
    );
  }

  try {
    const { id: providerId } = await params;
    const body = await req.json();
    const validated = providerReviewSchema.safeParse(body);

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

    const { requestId, rating, comment } = validated.data;

    // Verify service request exists and is completed
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { review: true },
    });

    if (!serviceRequest) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Service request not found." } },
        { status: 404 }
      );
    }

    if (serviceRequest.customerId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only the customer can review this service." } },
        { status: 403 }
      );
    }

    if (serviceRequest.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_COMPLETED", message: "You can only review a completed service." } },
        { status: 400 }
      );
    }

    if (serviceRequest.review) {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_REVIEWED", message: "You have already reviewed this service job." } },
        { status: 409 }
      );
    }

    // Create review
    const review = await prisma.providerReview.create({
      data: {
        requestId,
        providerId,
        customerId: user.id,
        rating,
        comment,
      },
    });

    // Recalculate provider rating
    const aggregate = await prisma.providerReview.aggregate({
      where: { providerId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.serviceProvider.update({
      where: { id: providerId },
      data: {
        ratingAverage: Number((aggregate._avg.rating || 0).toFixed(1)),
        reviewCount: aggregate._count.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your review for the technician has been published.",
        data: { review },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Provider review error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to submit review." } },
      { status: 500 }
    );
  }
}
