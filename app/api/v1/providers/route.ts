import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { providerRegistrationSchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const citySlug = searchParams.get("city") || "jampur";
    const categorySlug = searchParams.get("category");
    const skill = searchParams.get("skill");
    const availableOnly = searchParams.get("available") === "true";
    const q = searchParams.get("q");

    // Resolve city
    const city = await prisma.city.findFirst({
      where: { slug: citySlug, isActive: true },
    });

    if (!city) {
      return NextResponse.json(
        { success: false, error: { code: "CITY_NOT_FOUND", message: "City not found." } },
        { status: 404 }
      );
    }

    const where: any = {
      cityId: city.id,
      status: "APPROVED", // Strict rule: only approved providers in public directory
    };

    if (categorySlug) {
      where.categorySlug = categorySlug;
    }

    if (availableOnly) {
      where.isAvailable = true;
    }

    if (q && q.trim() !== "") {
      const term = q.trim();
      where.OR = [
        { primarySkill: { contains: term } },
        { primarySkillUr: { contains: term } },
        { user: { fullName: { contains: term } } },
        { secondarySkills: { contains: term } },
        { serviceAreas: { contains: term } },
      ];
    }

    const providers = await prisma.serviceProvider.findMany({
      where,
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
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: [
        { isAvailable: "desc" },
        { ratingAverage: "desc" },
        { jobsCompleted: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: {
        providers: providers.map((p) => ({
          id: p.id,
          userId: p.userId,
          fullName: p.user.fullName,
          fullNameUr: p.user.fullNameUr,
          phoneNumber: p.user.phoneNumber,
          avatarUrl: p.user.avatarUrl,
          primarySkill: p.primarySkill,
          primarySkillUr: p.primarySkillUr,
          secondarySkills: JSON.parse(p.secondarySkills || "[]"),
          experienceYears: p.experienceYears,
          baseVisitFee: p.baseVisitFee,
          serviceAreas: JSON.parse(p.serviceAreas || "[]"),
          portfolioPhotos: JSON.parse(p.portfolioPhotos || "[]"),
          isVerified: p.isVerified,
          isAvailable: p.isAvailable,
          ratingAverage: p.ratingAverage,
          reviewCount: p.reviewCount,
          jobsCompleted: p.jobsCompleted,
          city: p.city.name,
          categorySlug: p.categorySlug,
        })),
        meta: {
          city: city.name,
          total: providers.length,
        },
      },
    });
  } catch (error) {
    console.error("Providers fetch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch providers." } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Please log in to register as a service provider." } },
      { status: 401 }
    );
  }

  try {
    // Check if user already has a provider profile
    const existing = await prisma.serviceProvider.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_REGISTERED", message: "You already have a service provider profile." } },
        { status: 409 }
      );
    }

    const body = await req.json();
    const validated = providerRegistrationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid provider registration data",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Ensure user has SERVICE_PROVIDER role
    if (!user.roles.includes("SERVICE_PROVIDER")) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: "SERVICE_PROVIDER",
        },
      }).catch(() => {});
    }

    // Create Service Provider with PENDING status
    const provider = await prisma.serviceProvider.create({
      data: {
        userId: user.id,
        cityId: data.cityId,
        categorySlug: data.categorySlug,
        primarySkill: data.primarySkill,
        primarySkillUr: data.primarySkillUr,
        secondarySkills: JSON.stringify(data.secondarySkills || []),
        cnicNumber: data.cnicNumber,
        experienceYears: data.experienceYears,
        baseVisitFee: data.baseVisitFee,
        serviceAreas: JSON.stringify(data.serviceAreas || ["All Jampur"]),
        portfolioPhotos: JSON.stringify(data.portfolioPhotos || []),
        status: "PENDING", // Strict rule: initial status is PENDING
        isVerified: false,
        isAvailable: false,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PROVIDER_REGISTERED",
        entityType: "PROVIDER",
        entityId: provider.id,
        details: JSON.stringify({ skill: provider.primarySkill, status: "PENDING" }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Provider profile submitted successfully! Awaiting administrative verification.",
        data: { provider },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Provider registration error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to register provider." } },
      { status: 500 }
    );
  }
}
