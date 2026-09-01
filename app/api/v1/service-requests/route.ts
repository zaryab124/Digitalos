import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { serviceRequestSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "my", "leads", "all"

    let where: any = {};

    if (filter === "leads") {
      // Find matching open leads for provider
      const provider = await prisma.serviceProvider.findUnique({
        where: { userId: user.id },
      });
      if (provider) {
        where = {
          cityId: provider.cityId,
          categorySlug: provider.categorySlug,
          status: { in: ["OPEN", "QUOTED"] },
        };
      }
    } else if (filter === "my" || !user.roles.includes("ADMIN")) {
      // Default: Customer's own requests
      where = { customerId: user.id };
    }

    const requests = await prisma.serviceRequest.findMany({
      where,
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
        quotes: {
          include: {
            provider: {
              include: {
                user: { select: { fullName: true, phoneNumber: true } },
              },
            },
          },
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
    console.error("Service requests fetch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch requests." } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Please log in to submit a service request." } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const validated = serviceRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid service request data",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Create Service Request
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        cityId: data.cityId,
        customerId: user.id,
        serviceId: data.serviceId || null,
        categorySlug: data.categorySlug,
        title: data.title,
        description: data.description,
        photoUrl: data.photoUrl || null,
        urgency: data.urgency,
        addressLine: data.addressLine,
        area: data.area || "City Center",
        preferredDate: data.preferredDate || null,
        preferredTimeSlot: data.preferredTimeSlot || null,
        status: "OPEN",
      },
      include: {
        city: true,
      },
    });

    // Notify matching approved providers in this city & category
    const matchingProviders = await prisma.serviceProvider.findMany({
      where: {
        cityId: data.cityId,
        categorySlug: data.categorySlug,
        status: "APPROVED",
        isAvailable: true,
      },
      select: { userId: true },
    });

    for (const prov of matchingProviders) {
      await prisma.notification.create({
        data: {
          userId: prov.userId,
          title: `New Service Request in ${serviceRequest.city.name}`,
          titleUr: "نئی سروس کی درخواست موصول ہوئی",
          message: `${data.title} (${data.area}) — Tap to view details and submit your price quote.`,
          messageUr: `${data.title} — قیمت کی پیشکش بھیجنے کیلئے کلک کریں۔`,
          type: "SERVICE_REQUEST",
          link: `/services/requests/${serviceRequest.id}`,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your service request has been posted to verified technicians!",
        data: { serviceRequest },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Service request creation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create service request." } },
      { status: 500 }
    );
  }
}
