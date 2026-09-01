import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { categorySchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const citySlug = searchParams.get("city");

    let cityId: string | undefined = undefined;
    if (citySlug) {
      const city = await prisma.city.findFirst({ where: { slug: citySlug } });
      if (city) cityId = city.id;
    }

    const categories = await prisma.businessCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            businesses: {
              where: {
                status: "APPROVED",
                ...(cityId && { cityId }),
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          nameUr: cat.nameUr,
          slug: cat.slug,
          icon: cat.icon,
          description: cat.description,
          businessesCount: cat._count.businesses,
        })),
      },
    });
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch categories." },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.roles)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "FORBIDDEN", message: "Admin privileges required." },
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const validated = categorySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid category data",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const category = await prisma.businessCategory.create({
      data: {
        name: validated.data.name,
        nameUr: validated.data.nameUr,
        slug: validated.data.slug.toLowerCase().replace(/\s+/g, "-"),
        icon: validated.data.icon,
        description: validated.data.description,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: { category },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Category creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to create category." },
      },
      { status: 500 }
    );
  }
}
