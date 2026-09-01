import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        city: true,
        customer: {
          select: { id: true, fullName: true, phoneNumber: true, avatarUrl: true },
        },
        assignedProvider: {
          include: {
            user: { select: { fullName: true, phoneNumber: true, avatarUrl: true } },
          },
        },
        quotes: {
          include: {
            provider: {
              include: {
                user: { select: { fullName: true, phoneNumber: true, avatarUrl: true } },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        review: true,
      },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Service request not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { request },
    });
  } catch (error) {
    console.error("Service request detail error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch request." } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        assignedProvider: true,
      },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Request not found." } },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { status, finalPrice } = body;

    const isCustomer = user.id === request.customerId;
    const isAssignedProvider = request.assignedProvider && request.assignedProvider.userId === user.id;
    const isAdministrator = isAdmin(user.roles);

    if (!isCustomer && !isAssignedProvider && !isAdministrator) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Unauthorized to update request status." } },
        { status: 403 }
      );
    }

    // Customer can CANCEL if not already COMPLETED
    if (status === "CANCELLED") {
      if (!isCustomer && !isAdministrator) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Only customer can cancel request." } },
          { status: 403 }
        );
      }
    }

    // Provider can transition IN_PROGRESS or COMPLETED
    if (status === "IN_PROGRESS" || status === "COMPLETED") {
      if (!isAssignedProvider && !isAdministrator) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Only assigned provider can update job progress." } },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(finalPrice !== undefined && { finalPrice: parseFloat(finalPrice) }),
      },
      include: {
        customer: true,
        assignedProvider: {
          include: { user: true },
        },
      },
    });

    // Notify customer when job completed
    if (status === "COMPLETED") {
      await prisma.notification.create({
        data: {
          userId: request.customerId,
          title: "Service Job Completed",
          titleUr: "سروس مکمل ہو گئی ہے",
          message: `${updated.assignedProvider?.user.fullName} marked your request as completed. Please leave a rating and review!`,
          messageUr: "ٹیکنیشن نے کام مکمل کر دیا ہے۔ براہ کرم ریٹنگ اور رائے درج کریں۔",
          type: "SERVICE_COMPLETED",
          link: `/services/requests/${id}`,
        },
      });

      // Update provider earnings and jobsCompleted if finalPrice set
      if (request.assignedProviderId && (finalPrice || request.finalPrice)) {
        const earned = finalPrice ? parseFloat(finalPrice) : request.finalPrice || 0;
        await prisma.serviceProvider.update({
          where: { id: request.assignedProviderId },
          data: {
            jobsCompleted: { increment: 1 },
            totalEarnings: { increment: earned },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Request status updated to ${status}.`,
      data: { request: updated },
    });
  } catch (error) {
    console.error("Request status update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update request." } },
      { status: 500 }
    );
  }
}
