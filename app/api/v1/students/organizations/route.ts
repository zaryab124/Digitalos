import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const citySlug = searchParams.get("city") || "jampur";

  try {
    const city = await prisma.city.findFirst({
      where: { slug: citySlug, isActive: true },
    });

    if (!city) {
      return NextResponse.json(
        { success: false, error: { code: "CITY_NOT_FOUND", message: "City not found." } },
        { status: 404 }
      );
    }

    const organizations = await prisma.educationalOrganization.findMany({
      where: {
        OR: [
          { cityId: city.id },
          { isVerified: true }, // Show regional verified universities as well
        ],
      },
      include: {
        opportunities: {
          where: { status: "APPROVED" },
          select: { id: true, title: true, type: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        city: city.name,
        organizations,
      },
    });
  } catch (error) {
    console.error("Organizations error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch educational organizations." } },
      { status: 500 }
    );
  }
}
