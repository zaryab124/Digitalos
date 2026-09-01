import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  try {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.id },
      include: {
        city: true,
        quotes: {
          include: {
            request: {
              include: {
                customer: { select: { fullName: true, phoneNumber: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        assignedJobs: {
          include: {
            customer: { select: { fullName: true, phoneNumber: true } },
            review: true,
          },
          orderBy: { updatedAt: "desc" },
        },
        reviews: {
          include: {
            customer: { select: { fullName: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_A_PROVIDER", message: "No provider profile found for this account." } },
        { status: 404 }
      );
    }

    // Also fetch available open leads in their category and city
    const availableLeads = await prisma.serviceRequest.findMany({
      where: {
        cityId: provider.cityId,
        categorySlug: provider.categorySlug,
        status: { in: ["OPEN", "QUOTED"] },
        // Don't include requests this provider has already quoted
        quotes: {
          none: {
            providerId: provider.id,
          },
        },
      },
      include: {
        customer: { select: { fullName: true } },
        _count: { select: { quotes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        provider: {
          id: provider.id,
          userId: provider.userId,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          primarySkill: provider.primarySkill,
          primarySkillUr: provider.primarySkillUr,
          secondarySkills: JSON.parse(provider.secondarySkills || "[]"),
          cnicNumber: provider.cnicNumber,
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
          totalEarnings: provider.totalEarnings,
          city: provider.city.name,
          categorySlug: provider.categorySlug,
          quotes: provider.quotes,
          assignedJobs: provider.assignedJobs,
          reviews: provider.reviews,
        },
        availableLeads,
      },
    });
  } catch (error) {
    console.error("Provider private dashboard error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch provider dashboard." } },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  try {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.id },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_A_PROVIDER", message: "No provider profile found." } },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { isAvailable, baseVisitFee, primarySkill, primarySkillUr, secondarySkills, serviceAreas } = body;

    const updated = await prisma.serviceProvider.update({
      where: { id: provider.id },
      data: {
        ...(isAvailable !== undefined && { isAvailable }),
        ...(baseVisitFee !== undefined && { baseVisitFee: parseFloat(baseVisitFee) }),
        ...(primarySkill && { primarySkill }),
        ...(primarySkillUr !== undefined && { primarySkillUr }),
        ...(secondarySkills && { secondarySkills: JSON.stringify(secondarySkills) }),
        ...(serviceAreas && { serviceAreas: JSON.stringify(serviceAreas) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Provider profile updated.",
      data: { provider: updated },
    });
  } catch (error) {
    console.error("Provider update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update profile." } },
      { status: 500 }
    );
  }
}
