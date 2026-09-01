import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        plans: plans.map((p) => ({
          id: p.id,
          name: p.name,
          nameUr: p.nameUr,
          priceMonthly: p.priceMonthly,
          priceAnnual: p.priceAnnual,
          productLimit: p.productLimit,
          offerLimit: p.offerLimit,
          canUseAiCopilot: p.canUseAiCopilot,
          canUseAdvancedAnalytics: p.canUseAdvancedAnalytics,
          featuredPlacement: p.featuredPlacement,
          whatsappLeads: p.whatsappLeads,
          features: JSON.parse(p.features || "[]"),
        })),
      },
    });
  } catch (error) {
    console.error("Subscription plans error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch plans." } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Admin access required." } },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, nameUr, priceMonthly, priceAnnual, productLimit, offerLimit, canUseAiCopilot, featuredPlacement, features } = body;

    const plan = await prisma.subscriptionPlan.upsert({
      where: { name },
      update: {
        ...(nameUr !== undefined ? { nameUr } : {}),
        ...(priceMonthly !== undefined ? { priceMonthly: parseFloat(priceMonthly) } : {}),
        ...(priceAnnual !== undefined ? { priceAnnual: parseFloat(priceAnnual) } : {}),
        ...(productLimit !== undefined ? { productLimit: parseInt(productLimit) } : {}),
        ...(offerLimit !== undefined ? { offerLimit: parseInt(offerLimit) } : {}),
        ...(canUseAiCopilot !== undefined ? { canUseAiCopilot } : {}),
        ...(featuredPlacement !== undefined ? { featuredPlacement } : {}),
        ...(features !== undefined ? { features: typeof features === "string" ? features : JSON.stringify(features) } : {}),
      },
      create: {
        name,
        nameUr: nameUr || null,
        priceMonthly: priceMonthly ? parseFloat(priceMonthly) : 0,
        priceAnnual: priceAnnual ? parseFloat(priceAnnual) : 0,
        productLimit: productLimit ? parseInt(productLimit) : 10,
        offerLimit: offerLimit ? parseInt(offerLimit) : 1,
        canUseAiCopilot: Boolean(canUseAiCopilot),
        featuredPlacement: Boolean(featuredPlacement),
        features: typeof features === "string" ? features : JSON.stringify(features || []),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription plan updated successfully.",
      data: { plan },
    });
  } catch (error) {
    console.error("Save plan error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update plan." } },
      { status: 500 }
    );
  }
}
