import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";

export async function GET(req: Request) {
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
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // PENDING, APPROVED, SUSPENDED, REJECTED
    const citySlug = searchParams.get("city");
    const q = searchParams.get("q");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (citySlug) {
      where.city = { slug: citySlug };
    }
    if (q && q.trim() !== "") {
      where.OR = [
        { name: { contains: q.trim() } },
        { phone: { contains: q.trim() } },
        { owner: { fullName: { contains: q.trim() } } },
      ];
    }

    const businesses = await prisma.business.findMany({
      where,
      include: {
        city: true,
        category: true,
        owner: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
        locations: true,
        _count: {
          select: {
            products: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        businesses: businesses.map((b) => ({
          id: b.id,
          name: b.name,
          nameUr: b.nameUr,
          slug: b.slug,
          status: b.status,
          isVerified: b.isVerified,
          isFeatured: b.isFeatured,
          phone: b.phone,
          whatsapp: b.whatsapp,
          createdAt: b.createdAt,
          city: b.city.name,
          category: b.category.name,
          owner: b.owner,
          location: b.locations[0]?.addressLine || "No address",
          area: b.locations[0]?.area || "City Center",
          productsCount: b._count.products,
          reviewsCount: b._count.reviews,
          ratingAverage: b.ratingAverage,
        })),
      },
    });
  } catch (error) {
    console.error("Admin businesses fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch businesses." },
      },
      { status: 500 }
    );
  }
}
