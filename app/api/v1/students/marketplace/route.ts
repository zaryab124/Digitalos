import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const citySlug = searchParams.get("city") || "jampur";
  const category = searchParams.get("category");
  const query = searchParams.get("q");

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
      status: "ACTIVE",
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
      ];
    }

    const listings = await prisma.studentListing.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { fullName: true, phoneNumber: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        city: city.name,
        listings: listings.map((l) => ({
          id: l.id,
          title: l.title,
          titleUr: l.titleUr,
          category: l.category,
          price: l.price,
          condition: l.condition,
          description: l.description,
          contactPhone: l.contactPhone || l.student.user.phoneNumber,
          sellerName: l.student.user.fullName,
          institution: l.student.institutionName,
          status: l.status,
          createdAt: l.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Student marketplace error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch student marketplace items." } },
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

  // Find or create student profile
  let student = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!student) {
    student = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        cityId: user.cityId,
        institutionName: "Govt College Jampur",
        educationLevel: "BACHELORS",
      },
    });
  }

  try {
    const body = await req.json();
    const { title, titleUr, category, price, condition, description, contactPhone, imageUrl, cityId } = body;

    if (!title || !category || price === undefined || !description) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_FAILED", message: "Title, category, price, and description are required." } },
        { status: 400 }
      );
    }

    const targetCityId = cityId || user.cityId;

    const listing = await prisma.studentListing.create({
      data: {
        studentId: student.id,
        cityId: targetCityId,
        title,
        titleUr: titleUr || null,
        category,
        price: parseFloat(price),
        condition: condition || "GOOD",
        description,
        contactPhone: contactPhone || user.phoneNumber,
        imageUrl: imageUrl || null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Item listed on Student Marketplace successfully.",
        data: { listing },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create student listing error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create listing." } },
      { status: 500 }
    );
  }
}
