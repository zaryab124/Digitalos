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
    const [
      totalUsers,
      totalBusinesses,
      pendingBusinesses,
      approvedBusinesses,
      totalReviews,
      totalCategories,
      totalCities,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.business.count({ where: { status: "PENDING" } }),
      prisma.business.count({ where: { status: "APPROVED" } }),
      prisma.review.count(),
      prisma.businessCategory.count(),
      prisma.city.count(),
      prisma.reviewReport.count({ where: { status: "PENDING" } }),
    ]);

    // Businesses by category
    const businessesByCategory = await prisma.businessCategory.findMany({
      select: {
        id: true,
        name: true,
        nameUr: true,
        _count: {
          select: { businesses: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalBusinesses,
          pendingBusinesses,
          approvedBusinesses,
          totalReviews,
          totalCategories,
          totalCities,
          pendingReports,
        },
        businessesByCategory: businessesByCategory.map((c) => ({
          name: c.name,
          nameUr: c.nameUr,
          count: c._count.businesses,
        })),
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch admin stats." },
      },
      { status: 500 }
    );
  }
}
