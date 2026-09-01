import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
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

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        request: {
          include: { customer: true },
        },
        provider: {
          include: { user: true },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Quotation not found." } },
        { status: 404 }
      );
    }

    if (quote.request.customerId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only the customer who created this request can accept a quote." } },
        { status: 403 }
      );
    }

    // Atomic execution of acceptance
    const requestId = quote.requestId;

    // 1. Accept target quote
    await prisma.quote.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });

    // 2. Reject all other quotes on this request
    await prisma.quote.updateMany({
      where: {
        requestId,
        id: { not: id },
      },
      data: { status: "REJECTED" },
    });

    // 3. Assign provider and update request status to ASSIGNED
    const updatedRequest = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: "ASSIGNED",
        assignedProviderId: quote.providerId,
        finalPrice: quote.estimatedAmount,
      },
      include: {
        assignedProvider: {
          include: { user: true },
        },
      },
    });

    // 4. Send notification to winning provider
    await prisma.notification.create({
      data: {
        userId: quote.provider.userId,
        title: "🎉 Quotation Accepted!",
        titleUr: "مبارک ہو! آپ کی پیشکش قبول ہو گئی ہے",
        message: `${quote.request.customer.fullName} accepted your quote for PKR ${quote.estimatedAmount}. Customer Address: ${quote.request.addressLine} (${quote.request.area}). Phone: ${quote.request.customer.phoneNumber}`,
        messageUr: `کسٹمر نے آپ کی پیشکش قبول کر لی ہے۔ کسٹمر سے رابطہ کریں: ${quote.request.customer.phoneNumber}`,
        type: "QUOTE_ACCEPTED",
        link: `/provider/dashboard`,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "QUOTE_ACCEPTED",
        entityType: "SERVICE_REQUEST",
        entityId: requestId,
        details: JSON.stringify({
          providerId: quote.providerId,
          amount: quote.estimatedAmount,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `You have accepted ${quote.provider.user.fullName}'s quotation for PKR ${quote.estimatedAmount}!`,
      data: { request: updatedRequest },
    });
  } catch (error) {
    console.error("Quote accept error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to accept quotation." } },
      { status: 500 }
    );
  }
}
