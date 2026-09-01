import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const city = await prisma.city.findFirst({
      where: { slug, isActive: true },
      include: {
        _count: {
          select: {
            businesses: { where: { status: "APPROVED" } },
          },
        },
      },
    });

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "City not found." },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        city: {
          id: city.id,
          name: city.name,
          nameUr: city.nameUr,
          slug: city.slug,
          country: city.country,
          province: city.province,
          division: city.division,
          district: city.district,
          latitude: city.latitude,
          longitude: city.longitude,
          radiusKm: city.radiusKm,
          activeBusinessesCount: city._count.businesses,
        },
      },
    });
  } catch (error) {
    console.error("City detail error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch city details." },
      },
      { status: 500 }
    );
  }
}
