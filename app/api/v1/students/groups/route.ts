import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const citySlug = searchParams.get("city") || "jampur";
  const category = searchParams.get("category");

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

    const where: any = {
      cityId: city.id,
      isActive: true,
    };

    if (category && category !== "ALL") {
      where.topicCategory = category;
    }

    const groups = await prisma.studentGroup.findMany({
      where,
      orderBy: [{ memberCount: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: {
        city: city.name,
        groups,
      },
    });
  } catch (error) {
    console.error("Student groups error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch student groups." } },
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
    const { name, nameUr, topicCategory, description, meetingSchedule, organizerContact, cityId } = body;

    if (!name || !topicCategory || !description) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_FAILED", message: "Name, category, and description are required." } },
        { status: 400 }
      );
    }

    const targetCityId = cityId || user.cityId;

    const group = await prisma.studentGroup.create({
      data: {
        cityId: targetCityId,
        name,
        nameUr: nameUr || null,
        topicCategory,
        description,
        meetingSchedule: meetingSchedule || "Weekly Online / Campus",
        organizerContact: organizerContact || user.phoneNumber,
        memberCount: 1,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Study circle created successfully.",
        data: { group },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create group error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create study circle." } },
      { status: 500 }
    );
  }
}
