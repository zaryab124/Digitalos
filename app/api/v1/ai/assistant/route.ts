import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { extractIntent } from "@/lib/ai/intent";
import { processGroundedQuery } from "@/lib/ai/grounding";

export async function POST(req: Request) {
  const startTime = Date.now();
  const user = await getCurrentUser();

  try {
    const body = await req.json();
    const { prompt, citySlug = "jampur" } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_PROMPT", message: "Please provide a valid question or prompt." },
        },
        { status: 400 }
      );
    }

    const city = await prisma.city.findFirst({
      where: { slug: citySlug, isActive: true },
    });

    if (!city) {
      return NextResponse.json(
        { success: false, error: { code: "CITY_NOT_FOUND", message: "City not found." } },
        { status: 404 }
      );
    }

    // 1. Extract Structured Intent
    const extractedIntent = extractIntent(prompt);

    // 2. Ground Query against real database
    const groundedResult = await processGroundedQuery(extractedIntent, citySlug);

    const latencyMs = Date.now() - startTime;

    // 3. Telemetry Interaction Logging (non-sensitive)
    await prisma.aiInteractionLog.create({
      data: {
        userId: user?.id || null,
        cityId: city.id,
        query: prompt.slice(0, 500),
        detectedLanguage: extractedIntent.language,
        extractedIntent: extractedIntent.intent,
        parameters: JSON.stringify({
          categorySlug: extractedIntent.categorySlug,
          serviceTrade: extractedIntent.serviceTrade,
          maxBudget: extractedIntent.maxBudget,
          urgency: extractedIntent.urgency,
        }),
        entityCount: groundedResult.entities.length,
        status: groundedResult.status,
        latencyMs,
      },
    }).catch((e) => console.error("Telemetry log error:", e));

    return NextResponse.json({
      success: true,
      data: {
        query: prompt,
        intent: extractedIntent,
        response: groundedResult,
        latencyMs,
      },
    });
  } catch (error) {
    console.error("AI assistant endpoint error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to process AI query." } },
      { status: 500 }
    );
  }
}
