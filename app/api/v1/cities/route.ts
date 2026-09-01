import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      include: {
        areas: { where: { isActive: true }, orderBy: { name: "asc" } },
        _count: {
          select: {
            businesses: { where: { status: "APPROVED" } },
            serviceProviders: { where: { status: "APPROVED" } },
            orders: true,
          },
        },
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: {
        cities: cities.map((c) => ({
          id: c.id,
          name: c.name,
          nameUr: c.nameUr,
          slug: c.slug,
          country: c.country,
          province: c.province,
          division: c.division,
          district: c.district,
          tehsil: c.tehsil,
          latitude: c.latitude,
          longitude: c.longitude,
          radiusKm: c.radiusKm,
          areas: c.areas,
          activeBusinessesCount: c._count.businesses,
          activeProvidersCount: c._count.serviceProviders,
          ordersCount: c._count.orders,
        })),
      },
    });
  } catch (error) {
    console.error("Cities fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch cities." },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Administrator access required." } },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      name,
      nameUr,
      slug,
      country = "Pakistan",
      province = "Punjab",
      division,
      district,
      tehsil,
      latitude,
      longitude,
      radiusKm = 15.0,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_FAILED", message: "City name and slug are required." } },
        { status: 400 }
      );
    }

    const city = await prisma.city.create({
      data: {
        name,
        nameUr: nameUr || null,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        country,
        province,
        division: division || "D.G. Khan Division",
        district: district || `${name} District`,
        tehsil: tehsil || name,
        latitude: latitude ? parseFloat(latitude) : 29.6433,
        longitude: longitude ? parseFloat(longitude) : 70.5950,
        radiusKm: radiusKm ? parseFloat(radiusKm) : 15.0,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `City ${city.name} added to platform successfully.`,
        data: { city },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create city error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create city." } },
      { status: 500 }
    );
  }
}
