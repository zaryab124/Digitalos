import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Not authenticated" },
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { user },
  });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Not authenticated" },
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { fullName, fullNameUr, preferredLanguage, cityId } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(fullName && { fullName }),
        ...(fullNameUr !== undefined && { fullNameUr }),
        ...(preferredLanguage && { preferredLanguage }),
        ...(cityId && { cityId }),
      },
      include: {
        city: true,
        roles: {
          include: { role: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          phoneNumber: updatedUser.phoneNumber,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          fullNameUr: updatedUser.fullNameUr,
          preferredLanguage: updatedUser.preferredLanguage,
          city: updatedUser.city,
          roles: updatedUser.roles.map((r) => r.roleId),
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update profile" },
      },
      { status: 500 }
    );
  }
}
