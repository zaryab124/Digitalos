import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; productId: string }> }
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
    const { id, productId } = await params;
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
          error: { code: "FORBIDDEN", message: "Unauthorized to delete products." },
        },
        { status: 403 }
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      success: true,
      message: "Product removed from catalog.",
    });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to delete product." },
      },
      { status: 500 }
    );
  }
}
