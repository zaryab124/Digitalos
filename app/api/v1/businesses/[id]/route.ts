import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { businessUpdateSchema } from "@/lib/validation";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    // Check by ID or Slug
    const business = await prisma.business.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        city: true,
        category: true,
        locations: true,
        hours: {
          orderBy: { dayOfWeek: "asc" },
        },
        products: {
          where: { isAvailable: true },
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          where: { isFlagged: false },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                fullNameUr: true,
                avatarUrl: true,
                preferredLanguage: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
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

    // If business is not APPROVED, only Owner or Admin can view it
    if (business.status !== "APPROVED") {
      const isOwner = user && user.id === business.ownerId;
      const isAdministrator = user && isAdmin(user.roles);

      if (!isOwner && !isAdministrator) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "PENDING_APPROVAL",
              message: "This business is currently undergoing administrative verification.",
            },
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        business: {
          ...business,
          location: business.locations[0] || null,
        },
      },
    });
  } catch (error) {
    console.error("Business detail fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch business details." },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
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
      include: { locations: true },
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
          error: { code: "FORBIDDEN", message: "You are not authorized to edit this business." },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = businessUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid update data",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Update business
    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameUr !== undefined && { nameUr: data.nameUr }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.phone && { phone: data.phone }),
        ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.descriptionUr !== undefined && { descriptionUr: data.descriptionUr }),
        ...(data.logoUrl && { logoUrl: data.logoUrl }),
        ...(data.bannerUrl && { bannerUrl: data.bannerUrl }),
      },
      include: {
        locations: true,
        hours: true,
        category: true,
      },
    });

    // Update location if provided
    if (data.addressLine || data.area || data.landmark || data.latitude || data.longitude) {
      const locId = business.locations[0]?.id;
      if (locId) {
        await prisma.businessLocation.update({
          where: { id: locId },
          data: {
            ...(data.addressLine && { addressLine: data.addressLine }),
            ...(data.addressLineUr !== undefined && { addressLineUr: data.addressLineUr }),
            ...(data.area && { area: data.area }),
            ...(data.landmark !== undefined && { landmark: data.landmark }),
            ...(data.latitude !== undefined && { latitude: data.latitude }),
            ...(data.longitude !== undefined && { longitude: data.longitude }),
          },
        });
      }
    }

    // Update hours if provided
    if (data.hours && data.hours.length > 0) {
      for (const h of data.hours) {
        await prisma.businessHour.upsert({
          where: {
            businessId_dayOfWeek: {
              businessId: business.id,
              dayOfWeek: h.dayOfWeek,
            },
          },
          update: {
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
          },
          create: {
            businessId: business.id,
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Business details updated successfully.",
      data: { business: updatedBusiness },
    });
  } catch (error) {
    console.error("Business update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update business." },
      },
      { status: 500 }
    );
  }
}
