import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.roles)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "FORBIDDEN", message: "Admin access required." },
      },
      { status: 403 }
    );
  }

  try {
    const reports = await prisma.reviewReport.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
          },
        },
        review: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            user: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { reports },
    });
  } catch (error) {
    console.error("Admin reports fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch reports." },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.roles)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "FORBIDDEN", message: "Admin access required." },
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { reportId, status, deleteReview } = body;

    if (!reportId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BAD_REQUEST", message: "Report ID and status are required." },
        },
        { status: 400 }
      );
    }

    const report = await prisma.reviewReport.findUnique({
      where: { id: reportId },
      include: { review: true },
    });

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Report not found." },
        },
        { status: 404 }
      );
    }

    await prisma.reviewReport.update({
      where: { id: reportId },
      data: { status },
    });

    if (deleteReview && report.review) {
      const businessId = report.review.businessId;
      await prisma.review.delete({
        where: { id: report.review.id },
      });

      // Recalculate average rating
      const aggregate = await prisma.review.aggregate({
        where: {
          businessId,
          isFlagged: false,
        },
        _avg: { rating: true },
        _count: { id: true },
      });

      await prisma.business.update({
        where: { id: businessId },
        data: {
          ratingAverage: Number((aggregate._avg.rating || 0).toFixed(1)),
          reviewCount: aggregate._count.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Report status updated.",
    });
  } catch (error) {
    console.error("Admin report update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update report." },
      },
      { status: 500 }
    );
  }
}
