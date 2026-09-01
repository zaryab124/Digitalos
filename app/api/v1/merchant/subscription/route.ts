import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const business = await prisma.business.findFirst({
    where: { ownerId: user.id },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        orderBy: { endDate: "desc" },
        take: 1,
      },
      products: { select: { id: true } },
      offers: { select: { id: true } },
    },
  });

  if (!business) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Business not found." } },
      { status: 404 }
    );
  }

  const activeSub = business.subscriptions[0] || null;
  const currentPlan = activeSub?.plan || (await prisma.subscriptionPlan.findUnique({ where: { name: "BASIC" } }));

  return NextResponse.json({
    success: true,
    data: {
      businessId: business.id,
      businessName: business.name,
      subscription: activeSub,
      currentPlan,
      usage: {
        productsCount: business.products.length,
        productLimit: currentPlan?.productLimit || 10,
        offersCount: business.offers.length,
        offerLimit: currentPlan?.offerLimit || 1,
      },
    },
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const business = await prisma.business.findFirst({
    where: { ownerId: user.id },
  });

  if (!business) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Business not found." } },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const { planName, billingCycle = "MONTHLY", paymentMethod = "JAZZCASH", paymentRef } = body;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { name: planName },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Plan not found." } },
        { status: 404 }
      );
    }

    const durationDays = billingCycle === "ANNUAL" ? 365 : 30;
    const amountPaid = billingCycle === "ANNUAL" ? plan.priceAnnual : plan.priceMonthly;

    // Deactivate old active subscriptions
    await prisma.businessSubscription.updateMany({
      where: { businessId: business.id, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    });

    const subscription = await prisma.businessSubscription.create({
      data: {
        businessId: business.id,
        planId: plan.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        billingCycle,
        paymentMethod,
        amountPaid,
        paymentRef: paymentRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      },
      include: { plan: true },
    });

    // Update business featured status if plan allows
    if (plan.featuredPlacement) {
      await prisma.business.update({
        where: { id: business.id },
        data: { isFeatured: true },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully upgraded to ${plan.name} plan!`,
        data: { subscription },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subscription upgrade error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to upgrade subscription." } },
      { status: 500 }
    );
  }
}
