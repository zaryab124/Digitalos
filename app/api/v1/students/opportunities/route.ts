import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const citySlug = searchParams.get("city") || "jampur";
  const type = searchParams.get("type"); // SCHOLARSHIP, JOB, INTERNSHIP, TRAINING, ALL
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
      status: "APPROVED",
    };

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { organizationName: { contains: query } },
        { description: { contains: query } },
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        organization: true,
        business: true,
        applications: { select: { id: true } },
      },
      orderBy: [{ applicationDeadline: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: {
        city: city.name,
        count: opportunities.length,
        opportunities: opportunities.map((opp) => ({
          id: opp.id,
          title: opp.title,
          titleUr: opp.titleUr,
          type: opp.type,
          organizationName: opp.organizationName,
          description: opp.description,
          eligibilityCriteria: opp.eligibilityCriteria,
          location: opp.location,
          stipendOrSalary: opp.stipendOrSalary,
          applicationDeadline: opp.applicationDeadline,
          source: opp.source,
          isVerified: opp.isVerified,
          applicationCount: opp.applications.length,
          createdAt: opp.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Opportunities query error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch opportunities." } },
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
    const {
      title,
      titleUr,
      type,
      organizationName,
      description,
      eligibilityCriteria,
      location,
      stipendOrSalary,
      applicationDeadline,
      source,
      cityId,
    } = body;

    if (!title || !type || !organizationName || !description) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_FAILED", message: "Title, type, organization name, and description are required." },
        },
        { status: 400 }
      );
    }

    const targetCityId = cityId || user.cityId;

    const opportunity = await prisma.opportunity.create({
      data: {
        cityId: targetCityId,
        title,
        titleUr: titleUr || null,
        type,
        organizationName,
        description,
        eligibilityCriteria: eligibilityCriteria || null,
        location: location || "Jampur",
        stipendOrSalary: stipendOrSalary || null,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        source: source || "User Submitted",
        status: "APPROVED", // Auto-approved for verified seed, or PENDING
        isVerified: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Opportunity posted successfully.",
        data: { opportunity },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Post opportunity error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create opportunity." } },
      { status: 500 }
    );
  }
}
