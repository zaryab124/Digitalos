import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const city = await prisma.city.findFirst({
      where: { slug, isActive: true },
    });

    if (!city) {
      return NextResponse.json(
        { success: false, error: { code: "CITY_NOT_FOUND", message: "City not found." } },
        { status: 404 }
      );
    }

    const areas = await prisma.area.findMany({
      where: { cityId: city.id, isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        city: city.name,
        areas,
      },
    });
  } catch (error) {
    console.error("Areas fetch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch areas." } },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Administrator access required." } },
      { status: 403 }
    );
  }

  const { slug } = await params;

  try {
    const city = await prisma.city.findFirst({
      where: { slug },
    });

    if (!city) {
      return NextResponse.json(
        { success: false, error: { code: "CITY_NOT_FOUND", message: "City not found." } },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, nameUr, postalCode, latitude, longitude } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_FAILED", message: "Area name is required." } },
        { status: 400 }
      );
    }

    const area = await prisma.area.create({
      data: {
        cityId: city.id,
        name,
        nameUr: nameUr || null,
        postalCode: postalCode || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Area ${area.name} added to ${city.name} successfully.`,
        data: { area },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create area error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create area." } },
      { status: 500 }
    );
  }
}
