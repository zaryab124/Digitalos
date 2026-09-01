import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.roles)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "FORBIDDEN", message: "Admin access required." },
      },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        city: true,
        roles: {
          include: { role: true },
        },
        _count: {
          select: {
            businesses: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        users: users.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          fullNameUr: u.fullNameUr,
          phoneNumber: u.phoneNumber,
          email: u.email,
          city: u.city.name,
          preferredLanguage: u.preferredLanguage,
          isActive: u.isActive,
          isPhoneVerified: u.isPhoneVerified,
          createdAt: u.createdAt,
          roles: u.roles.map((r) => r.roleId),
          businessesCount: u._count.businesses,
          reviewsCount: u._count.reviews,
        })),
      },
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch users." },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.roles)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "FORBIDDEN", message: "Admin access required." },
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { userId, isActive, addRole, removeRole } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "MISSING_USER_ID", message: "User ID is required." },
        },
        { status: 400 }
      );
    }

    if (isActive !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive },
      });
    }

    if (addRole) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId,
            roleId: addRole,
          },
        },
        update: {},
        create: {
          userId,
          roleId: addRole,
        },
      });
    }

    if (removeRole) {
      await prisma.userRole.deleteMany({
        where: {
          userId,
          roleId: removeRole,
        },
      });
    }

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_MODIFIED_BY_ADMIN",
        entityType: "USER",
        entityId: userId,
        details: JSON.stringify({ isActive, addRole, removeRole }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "User status updated successfully.",
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update user." },
      },
      { status: 500 }
    );
  }
}
