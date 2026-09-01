import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reviewReportSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Please log in to report a review." },
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

    const body = await req.json();
    const validated = reviewReportSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Reason is required to report this review.",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const report = await prisma.reviewReport.create({
      data: {
        reviewId: review.id,
        reporterId: user.id,
        reason: validated.data.reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you. Your report has been submitted to city moderators for review.",
        data: { report },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Report review error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to submit review report." },
      },
      { status: 500 }
    );
  }
}
