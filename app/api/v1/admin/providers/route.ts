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

    const providers = await prisma.serviceProvider.findMany({
      where: {
        ...(status && status !== "ALL" ? { status } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            fullNameUr: true,
            phoneNumber: true,
            email: true,
          },
        },
        city: true,
        _count: {
          select: {
            quotes: true,
            assignedJobs: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        providers: providers.map((p) => ({
          id: p.id,
          userId: p.userId,
          fullName: p.user.fullName,
          phoneNumber: p.user.phoneNumber,
          email: p.user.email,
          city: p.city.name,
          categorySlug: p.categorySlug,
          primarySkill: p.primarySkill,
          cnicNumber: p.cnicNumber,
          experienceYears: p.experienceYears,
          baseVisitFee: p.baseVisitFee,
          status: p.status,
          isVerified: p.isVerified,
          isAvailable: p.isAvailable,
          ratingAverage: p.ratingAverage,
          reviewCount: p.reviewCount,
          jobsCompleted: p.jobsCompleted,
          totalEarnings: p.totalEarnings,
          createdAt: p.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Admin providers error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch providers." } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.roles)) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Admin privileges required." } },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { providerId, status, isVerified } = body;

    if (!providerId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_FAILED", message: "Provider ID is required." } },
        { status: 400 }
      );
    }

    const updated = await prisma.serviceProvider.update({
      where: { id: providerId },
      data: {
        ...(status && { status }),
        ...(isVerified !== undefined && { isVerified }),
        // If approved, make available by default
        ...(status === "APPROVED" && { isAvailable: true }),
      },
      include: {
        user: true,
      },
    });

    // Notify provider of approval
    if (status === "APPROVED") {
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: "🎉 Profile Approved & Verified!",
          titleUr: "آپ کا سروس پروفائل منظور ہو چکا ہے",
          message: "Your service provider profile has been verified. You can now receive leads and submit quotes to customers.",
          messageUr: "آپ کا پروفائل منظور کر لیا گیا ہے۔ اب آپ گاہکوں کو اپنی سروسز پیش کر سکتے ہیں۔",
          type: "GENERAL",
          link: "/provider/dashboard",
        },
      });
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: `PROVIDER_${status}`,
        entityType: "PROVIDER",
        entityId: providerId,
        details: JSON.stringify({ status, isVerified }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Provider status updated to ${status}.`,
      data: { provider: updated },
    });
  } catch (error) {
    console.error("Admin provider update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update provider." } },
      { status: 500 }
    );
  }
}
