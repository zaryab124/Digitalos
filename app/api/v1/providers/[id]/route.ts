import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const provider = await prisma.serviceProvider.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            fullNameUr: true,
            phoneNumber: true,
            avatarUrl: true,
          },
        },
        city: true,
        reviews: {
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                fullNameUr: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Service provider not found." } },
        { status: 404 }
      );
    }

    // If not APPROVED, only the provider owner or Admin can view
    if (provider.status !== "APPROVED") {
      const isOwner = user && user.id === provider.userId;
      const isAdministrator = user && isAdmin(user.roles);
      if (!isOwner && !isAdministrator) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "PENDING_APPROVAL",
              message: "This provider profile is currently undergoing verification.",
            },
          },
          { status: 403 }
        );
      }
    }

    // Mask CNIC for security
    const maskedCnic = provider.cnicNumber
      ? `${provider.cnicNumber.slice(0, 5)}-*******-${provider.cnicNumber.slice(-1)}`
      : "Verified";

    return NextResponse.json({
      success: true,
      data: {
        provider: {
          id: provider.id,
          userId: provider.userId,
          fullName: provider.user.fullName,
          fullNameUr: provider.user.fullNameUr,
          phoneNumber: provider.user.phoneNumber,
          avatarUrl: provider.user.avatarUrl,
          primarySkill: provider.primarySkill,
          primarySkillUr: provider.primarySkillUr,
          secondarySkills: JSON.parse(provider.secondarySkills || "[]"),
          experienceYears: provider.experienceYears,
          baseVisitFee: provider.baseVisitFee,
          serviceAreas: JSON.parse(provider.serviceAreas || "[]"),
          portfolioPhotos: JSON.parse(provider.portfolioPhotos || "[]"),
          status: provider.status,
          isVerified: provider.isVerified,
          isAvailable: provider.isAvailable,
          ratingAverage: provider.ratingAverage,
          reviewCount: provider.reviewCount,
          jobsCompleted: provider.jobsCompleted,
          maskedCnic,
          city: provider.city.name,
          categorySlug: provider.categorySlug,
          reviews: provider.reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            customer: r.customer,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Provider profile error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch provider." } },
      { status: 500 }
    );
  }
}
