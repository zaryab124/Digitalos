import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { businessRegistrationSchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const citySlug = searchParams.get("city") || "jampur";
    const categorySlug = searchParams.get("category");
    const q = searchParams.get("q");
    const verifiedOnly = searchParams.get("verified") === "true";
    const featuredOnly = searchParams.get("featured") === "true";
    const area = searchParams.get("area");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    // Resolve city
    const city = await prisma.city.findFirst({
      where: { slug: citySlug, isActive: true },
    });

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "CITY_NOT_FOUND", message: "Selected city not found." },
        },
        { status: 404 }
      );
    }

    // Build filter
    const where: any = {
      cityId: city.id,
      status: "APPROVED", // Strict rule: only approved businesses in public discovery!
    };

    if (verifiedOnly) {
      where.isVerified = true;
    }

    if (featuredOnly) {
      where.isFeatured = true;
    }

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    if (area) {
      where.locations = {
        some: {
          area: {
            contains: area,
          },
        },
      };
    }

    if (q && q.trim() !== "") {
      const searchTerm = q.trim();
      where.OR = [
        { name: { contains: searchTerm } },
        { nameUr: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { descriptionUr: { contains: searchTerm } },
        {
          locations: {
            some: {
              OR: [
                { addressLine: { contains: searchTerm } },
                { area: { contains: searchTerm } },
                { landmark: { contains: searchTerm } },
              ],
            },
          },
        },
      ];
    }

    const [totalCount, businesses] = await Promise.all([
      prisma.business.count({ where }),
      prisma.business.findMany({
        where,
        include: {
          category: true,
          locations: true,
          hours: true,
          _count: {
            select: {
              products: { where: { isAvailable: true } },
              reviews: true,
            },
          },
        },
        orderBy: [
          { isFeatured: "desc" },
          { isVerified: "desc" },
          { ratingAverage: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        businesses: businesses.map((b) => ({
          id: b.id,
          name: b.name,
          nameUr: b.nameUr,
          slug: b.slug,
          description: b.description,
          descriptionUr: b.descriptionUr,
          phone: b.phone,
          whatsapp: b.whatsapp,
          logoUrl: b.logoUrl,
          bannerUrl: b.bannerUrl,
          isVerified: b.isVerified,
          isFeatured: b.isFeatured,
          ratingAverage: b.ratingAverage,
          reviewCount: b.reviewCount,
          category: {
            id: b.category.id,
            name: b.category.name,
            nameUr: b.category.nameUr,
            slug: b.category.slug,
            icon: b.category.icon,
          },
          location: b.locations[0] || null,
          hours: b.hours,
          productsCount: b._count.products,
        })),
        meta: {
          cityId: city.id,
          citySlug: city.slug,
          cityName: city.name,
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + businesses.length < totalCount,
        },
      },
    });
  } catch (error) {
    console.error("Businesses discovery error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to search businesses." },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Please log in to register a business." },
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const validated = businessRegistrationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid business registration data",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Generate unique slug
    const baseSlug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    // Ensure user has BUSINESS_OWNER role
    const hasOwnerRole = user.roles.includes("BUSINESS_OWNER");
    if (!hasOwnerRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: "BUSINESS_OWNER",
        },
      }).catch(() => {});
    }

    // Create Business with PENDING status
    const business = await prisma.business.create({
      data: {
        cityId: data.cityId,
        ownerId: user.id,
        categoryId: data.categoryId,
        name: data.name,
        nameUr: data.nameUr,
        slug,
        description: data.description,
        descriptionUr: data.descriptionUr,
        phone: data.phone,
        whatsapp: data.whatsapp || data.phone,
        logoUrl: data.logoUrl || "https://images.unsplash.com/photo-1586015555751-63c25b30bdcf?w=200&h=200&fit=crop",
        bannerUrl: data.bannerUrl || "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=350&fit=crop",
        status: "PENDING", // Strict rule: Newly registered businesses are PENDING
        isVerified: false,
        isFeatured: false,
        locations: {
          create: {
            cityId: data.cityId,
            addressLine: data.addressLine,
            addressLineUr: data.addressLineUr,
            area: data.area || "City Center",
            landmark: data.landmark,
            latitude: data.latitude || 29.6433,
            longitude: data.longitude || 70.5950,
          },
        },
        hours: {
          create:
            data.hours && data.hours.length > 0
              ? data.hours
              : [0, 1, 2, 3, 4, 5, 6].map((day) => ({
                  dayOfWeek: day,
                  openTime: "09:00",
                  closeTime: "21:00",
                  isClosed: day === 5, // Closed Friday by default
                })),
        },
      },
      include: {
        locations: true,
        hours: true,
        category: true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "BUSINESS_REGISTERED",
        entityType: "BUSINESS",
        entityId: business.id,
        details: JSON.stringify({ name: business.name, status: "PENDING" }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Business registered successfully! It is now pending administrative approval.",
        data: { business },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Business registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to register business." },
      },
      { status: 500 }
    );
  }
}
