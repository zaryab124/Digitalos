import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { offerSchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const citySlug = searchParams.get("city") || "jampur";

    const city = await prisma.city.findFirst({
      where: { slug: citySlug, isActive: true },
    });

    if (!city) {
      return NextResponse.json(
        { success: false, error: { code: "CITY_NOT_FOUND", message: "City not found." } },
        { status: 404 }
      );
    }

    const now = new Date();

    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        endDate: { gte: now },
        business: {
          cityId: city.id,
          status: "APPROVED",
        },
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            nameUr: true,
            slug: true,
            isVerified: true,
          },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: { offers },
    });
  } catch (error) {
    console.error("Offers fetch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch offers." } },
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

  try {
    const body = await req.json();
    const validated = offerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid offer payload",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Verify user owns business
    const business = await prisma.business.findUnique({
      where: { id: data.businessId },
    });

    if (!business || (business.ownerId !== user.id && !user.roles.includes("ADMIN"))) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Unauthorized to create offers for this shop." } },
        { status: 403 }
      );
    }

    const offer = await prisma.offer.create({
      data: {
        businessId: data.businessId,
        title: data.title,
        titleUr: data.titleUr || null,
        description: data.description || null,
        discountPercentage: data.discountPercentage,
        minOrderAmount: data.minOrderAmount,
        bannerUrl: data.bannerUrl || null,
        isFeatured: data.isFeatured,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: new Date(data.endDate),
      },
    });

    return NextResponse.json(
      { success: true, message: "Promotional deal created successfully!", data: { offer } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Offer creation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create offer." } },
      { status: 500 }
    );
  }
}
