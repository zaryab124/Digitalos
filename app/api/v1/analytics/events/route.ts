import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessId, cityId, type, metadata } = body;

    if (!type || !cityId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_FAILED", message: "Event type and cityId are required." } },
        { status: 400 }
      );
    }

    const event = await prisma.analyticsEvent.create({
      data: {
        businessId: businessId || null,
        cityId,
        type,
        metadata: metadata ? (typeof metadata === "string" ? metadata : JSON.stringify(metadata)) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: { eventId: event.id },
    });
  } catch (error) {
    console.error("Telemetry log error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to record event." } },
      { status: 500 }
    );
  }
}
