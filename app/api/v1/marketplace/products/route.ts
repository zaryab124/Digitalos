import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const citySlug = searchParams.get("city") || "jampur";
    const categorySlug = searchParams.get("category");
    const q = searchParams.get("q");
    const inStockOnly = searchParams.get("inStock") === "true";
    const deliveryOnly = searchParams.get("delivery") === "true";

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
      business: {
        cityId: city.id,
        status: "APPROVED", // Strict check: only products from approved shops
      },
      isAvailable: true,
    };

    if (categorySlug) {
      where.business.category = { slug: categorySlug };
    }

    if (inStockOnly) {
      where.stockQuantity = { gt: 0 };
    }

    if (deliveryOnly) {
      where.isDeliveryAvailable = true;
    }

    if (q && q.trim() !== "") {
      const term = q.trim();
      where.OR = [
        { name: { contains: term } },
        { nameUr: { contains: term } },
        { description: { contains: term } },
        { business: { name: { contains: term } } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            nameUr: true,
            slug: true,
            phone: true,
            whatsapp: true,
            isVerified: true,
            ratingAverage: true,
            locations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          nameUr: p.nameUr,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          unit: p.unit,
          stockQuantity: p.stockQuantity,
          isAvailable: p.isAvailable,
          isDeliveryAvailable: p.isDeliveryAvailable,
          discountPercentage: p.discountPercentage,
          imageUrl: p.imageUrl,
          business: {
            id: p.business.id,
            name: p.business.name,
            nameUr: p.business.nameUr,
            slug: p.business.slug,
            isVerified: p.business.isVerified,
            ratingAverage: p.business.ratingAverage,
            area: p.business.locations[0]?.area || "City Center",
            address: p.business.locations[0]?.addressLine || "",
          },
        })),
        meta: {
          city: city.name,
          total: products.length,
        },
      },
    });
  } catch (error) {
    console.error("Marketplace products search error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to search products." } },
      { status: 500 }
    );
  }
}
