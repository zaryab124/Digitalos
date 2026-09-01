import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.roles)) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Admin privileges required." } },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const requests = await prisma.serviceRequest.findMany({
      where: {
        ...(status && status !== "ALL" ? { status } : {}),
      },
      include: {
        city: true,
        customer: {
          select: { id: true, fullName: true, phoneNumber: true },
        },
        assignedProvider: {
          include: {
            user: { select: { fullName: true, phoneNumber: true } },
          },
        },
        _count: {
          select: { quotes: true },
        },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    console.error("Admin service requests fetch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch requests." } },
      { status: 500 }
    );
  }
}
