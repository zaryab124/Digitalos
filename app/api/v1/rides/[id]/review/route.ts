import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
    const { id } = await params;
    const booking = await prisma.rideBooking.findUnique({
      where: { id },
      include: { review: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Ride not found." } },
        { status: 404 }
      );
    }

    if (booking.customerId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only the customer can review this ride." } },
        { status: 403 }
      );
    }

    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_STATE", message: "Can only review completed rides." } },
        { status: 400 }
      );
    }

    if (booking.review) {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_REVIEWED", message: "Ride has already been reviewed." } },
        { status: 409 }
      );
    }

    if (!booking.riderId) {
      return NextResponse.json(
        { success: false, error: { code: "NO_RIDER", message: "No driver was assigned to this ride." } },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { rating = 5, comment } = body;
    const numRating = Math.max(1, Math.min(5, parseInt(rating, 10)));

    const review = await prisma.$transaction(async (tx) => {
      const r = await tx.rideReview.create({
        data: {
          rideId: id,
          riderId: booking.riderId!,
          customerId: user.id,
          rating: numRating,
          comment: comment || null,
        },
      });

      // Recalculate driver average rating
      const allReviews = await tx.rideReview.findMany({
        where: { riderId: booking.riderId! },
        select: { rating: true },
      });

      const avg = allReviews.reduce((sum, item) => sum + item.rating, 0) / allReviews.length;

      await tx.deliveryRider.update({
        where: { id: booking.riderId! },
        data: {
          ratingAverage: parseFloat(avg.toFixed(1)),
          reviewCount: allReviews.length,
        },
      });

      return r;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for rating your driver!",
        data: { review },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ride review error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to submit review." } },
      { status: 500 }
    );
  }
}
