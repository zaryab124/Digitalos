import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { productSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required." },
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const business = await prisma.business.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!business) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Business not found." },
        },
        { status: 404 }
      );
    }

    const isOwner = user.id === business.ownerId;
    const isAdministrator = isAdmin(user.roles);

    if (!isOwner && !isAdministrator) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "You are not authorized to add products for this business." },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = productSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid product data",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = validated.data;
    const product = await prisma.product.create({
      data: {
        businessId: business.id,
        name: data.name,
        nameUr: data.nameUr,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        unit: data.unit || "piece",
        isAvailable: data.isAvailable,
        imageUrl: data.imageUrl,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product added to catalog successfully.",
        data: { product },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product add error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to add product." },
      },
      { status: 500 }
    );
  }
}
