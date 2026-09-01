import { NextResponse } from "next/server";
import { getAgroWeatherData } from "@/lib/weather";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const citySlug = searchParams.get("city") || "jampur";

  try {
    const weather = await getAgroWeatherData(citySlug);
    return NextResponse.json({
      success: true,
      data: { weather },
    });
  } catch (error) {
    console.error("Weather endpoint error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch weather data." } },
      { status: 500 }
    );
  }
}
