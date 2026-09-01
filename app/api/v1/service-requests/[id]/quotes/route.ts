import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { quoteSubmissionSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Please log in to submit a quote." } },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // Check if user is a verified service provider
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.id },
    });

    if (!provider || provider.status !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNVERIFIED_PROVIDER",
            message: "Only approved and verified service providers can submit price quotes.",
          },
        },
        { status: 403 }
      );
    }

    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Service request not found." } },
        { status: 404 }
      );
    }

    if (request.status !== "OPEN" && request.status !== "QUOTED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REQUEST_NOT_OPEN",
            message: "This request is no longer accepting new quotes.",
          },
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = quoteSubmissionSchema.safeParse({
      ...body,
      requestId: id,
    });

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid quotation data",
            details: validated.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Create / Upsert quote
    const quote = await prisma.quote.upsert({
      where: {
        requestId_providerId: {
          requestId: id,
          providerId: provider.id,
        },
      },
      update: {
        estimatedAmount: data.estimatedAmount,
        estimatedArrival: data.estimatedArrival,
        estimatedDuration: data.estimatedDuration,
        notes: data.notes || null,
        status: "PENDING",
      },
      create: {
        requestId: id,
        providerId: provider.id,
        estimatedAmount: data.estimatedAmount,
        estimatedArrival: data.estimatedArrival,
        estimatedDuration: data.estimatedDuration,
        notes: data.notes || null,
        status: "PENDING",
      },
    });

    // Update request status to QUOTED if currently OPEN
    if (request.status === "OPEN") {
      await prisma.serviceRequest.update({
        where: { id },
        data: { status: "QUOTED" },
      });
    }

    // Send notification to customer
    await prisma.notification.create({
      data: {
        userId: request.customerId,
        title: "New Quotation Received",
        titleUr: "نئی قیمت کی پیشکش موصول ہوئی",
        message: `${user.fullName} offered PKR ${data.estimatedAmount} (${data.estimatedArrival}) for your request: ${request.title}.`,
        messageUr: `${user.fullName} نے آپ کی سروس کی درخواست پر ${data.estimatedAmount} روپے کی پیشکش کی ہے۔`,
        type: "QUOTE_RECEIVED",
        link: `/services/requests/${id}`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your quotation has been sent to the customer!",
        data: { quote },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Quote submission error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to submit quote." } },
      { status: 500 }
    );
  }
}
