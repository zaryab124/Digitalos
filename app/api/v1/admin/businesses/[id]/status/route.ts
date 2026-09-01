import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await req.json();
    const { status, isVerified, isFeatured } = body;

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: `Status must be one of: ${validStatuses.join(", ")}`,
          },
        },
        { status: 400 }
      );
    }

    const existingBusiness = await prisma.business.findUnique({
      where: { id },
    });

    if (!existingBusiness) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Business not found." },
        },
        { status: 404 }
      );
    }

    const newStatus = status || existingBusiness.status;
    const newVerified =
      isVerified !== undefined
        ? isVerified
        : newStatus === "APPROVED"
        ? true
        : existingBusiness.isVerified;

    const updatedBusiness = await prisma.business.update({
      where: { id },
      data: {
        status: newStatus,
        isVerified: newVerified,
        ...(isFeatured !== undefined && { isFeatured }),
      },
      include: {
        city: true,
        category: true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: `BUSINESS_STATUS_${newStatus}`,
        entityType: "BUSINESS",
        entityId: id,
        details: JSON.stringify({
          previousStatus: existingBusiness.status,
          newStatus,
          isVerified: newVerified,
          businessName: existingBusiness.name,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Business status updated to ${newStatus}.`,
      data: { business: updatedBusiness },
    });
  } catch (error) {
    console.error("Business status transition error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update business status." },
      },
      { status: 500 }
    );
  }
}
