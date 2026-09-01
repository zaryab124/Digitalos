import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const citySlug = searchParams.get("city") || "jampur";
  const category = searchParams.get("category");

  try {
    const city = await prisma.city.findFirst({
      where: { slug: citySlug, isActive: true },
    });

    if (!city) {
      return NextResponse.json({ success: true, data: { ads: [] } });
    }

    const where: any = {
      cityId: city.id,
      status: "ACTIVE",
      endDate: { gte: new Date() },
    };

    if (category) {
      where.OR = [
        { targetCategory: category },
        { targetCategory: null },
      ];
    }

    const ads = await prisma.adCampaign.findMany({
      where,
      include: {
        business: {
          select: { id: true, name: true, nameUr: true, phone: true, ratingAverage: true },
        },
      },
      take: 5,
    });

    // Increment impressions asynchronously
    if (ads.length > 0) {
      prisma.adCampaign.updateMany({
        where: { id: { in: ads.map((a) => a.id) } },
        data: { impressionsCount: { increment: 1 } },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: {
        ads: ads.map((a) => ({
          id: a.id,
          type: a.type,
          headline: a.headline,
          headlineUr: a.headlineUr,
          bannerUrl: a.bannerUrl,
          businessId: a.business.id,
          businessName: a.business.name,
          businessPhone: a.business.phone,
          isSponsored: true,
          badge: "Sponsored / اشتہار",
        })),
      },
    });
  } catch (error) {
    console.error("Ads query error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch ads." } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const business = await prisma.business.findFirst({
    where: { ownerId: user.id },
  });

  if (!business) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Business not found." } },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const { headline, headlineUr, type = "FEATURED_LISTING", targetCategory, dailyBudget = 150.0, durationDays = 7 } = body;

    if (!headline) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_FAILED", message: "Headline is required." } },
        { status: 400 }
      );
    }

    const campaign = await prisma.adCampaign.create({
      data: {
        businessId: business.id,
        cityId: business.cityId,
        type,
        headline,
        headlineUr: headlineUr || null,
        targetCategory: targetCategory || null,
        dailyBudget: parseFloat(dailyBudget),
        startDate: new Date(),
        endDate: new Date(Date.now() + parseInt(durationDays) * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Advertising campaign launched successfully.",
        data: { campaign },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create ad campaign error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create campaign." } },
      { status: 500 }
    );
  }
}
