import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");

    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(categorySlug && {
          category: { slug: categorySlug },
        }),
      },
      include: {
        category: true,
        _count: {
          select: { requests: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          nameUr: s.nameUr,
          slug: s.slug,
          description: s.description,
          basePriceEstimate: s.basePriceEstimate,
          icon: s.icon,
          category: {
            id: s.category.id,
            name: s.category.name,
            nameUr: s.category.nameUr,
            slug: s.category.slug,
          },
          requestsCount: s._count.requests,
        })),
      },
    });
  } catch (error) {
    console.error("Services fetch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch services." } },
      { status: 500 }
    );
  }
}
