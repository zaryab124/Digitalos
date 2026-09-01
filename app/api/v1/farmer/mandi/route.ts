import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const citySlug = searchParams.get("city") || "jampur";
  const cropQuery = searchParams.get("crop");

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

    const where: any = { cityId: city.id };
    if (cropQuery) {
      where.cropName = { contains: cropQuery };
    }

    const rates = await prisma.mandiRate.findMany({
      where,
      orderBy: [{ reportedDate: "desc" }, { modalPrice: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: {
        city: city.name,
        rates,
        lastUpdated: rates[0]?.reportedDate || new Date(),
      },
    });
  } catch (error) {
    console.error("Mandi rates error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch mandi rates." } },
      { status: 500 }
    );
  }
}
