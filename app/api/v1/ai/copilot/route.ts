import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  generateProductDescription,
  generateMarketingCampaign,
  suggestPromotionalOffer,
} from "@/lib/ai/merchantCopilot";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { action, name, category = "general", price, businessName, dealText } = body;

    let result;

    if (action === "PRODUCT_DESCRIPTION") {
      if (!name) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_FAILED", message: "Product name is required." } },
          { status: 400 }
        );
      }
      result = generateProductDescription(name, category, price);
    } else if (action === "MARKETING_POST") {
      result = generateMarketingCampaign(businessName || "My Store", category, dealText);
    } else if (action === "OFFER_STRATEGY") {
      result = suggestPromotionalOffer(category);
    } else {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_ACTION", message: "Unsupported copilot action." } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { result },
    });
  } catch (error) {
    console.error("AI Copilot error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to generate copilot response." } },
      { status: 500 }
    );
  }
}
