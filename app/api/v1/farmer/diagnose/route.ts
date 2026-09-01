import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { diagnoseCropHealth } from "@/lib/ai/cropDoctor";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  try {
    const body = await req.json();
    const { cropName, symptoms, imageUrl, cropId } = body;

    if (!cropName || !symptoms) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_FAILED", message: "Crop name and symptoms/description are required." },
        },
        { status: 400 }
      );
    }

    // 1. Run AI Crop Doctor Diagnosis
    const diagnosis = diagnoseCropHealth(cropName, symptoms);

    let savedRecord = null;

    // 2. If user is logged in, persist to farmer profile
    if (user) {
      let farmer = await prisma.farmerProfile.findUnique({
        where: { userId: user.id },
      });

      if (!farmer) {
        farmer = await prisma.farmerProfile.create({
          data: {
            userId: user.id,
            cityId: user.cityId,
            farmName: `${user.fullName}'s Farm`,
          },
        });
      }

      savedRecord = await prisma.cropDiagnosis.create({
        data: {
          farmerId: farmer.id,
          cropId: cropId || null,
          imageUrl: imageUrl || null,
          cropName: diagnosis.cropName,
          symptoms: diagnosis.symptoms,
          diseaseDetected: diagnosis.diseaseDetected,
          diseaseDetectedUr: diagnosis.diseaseDetectedUr,
          confidenceScore: diagnosis.confidenceScore,
          explanation: diagnosis.explanation,
          treatmentRecommendations: diagnosis.treatmentRecommendations.join("\n"),
          disclaimer: diagnosis.disclaimer,
          status: "ACTIVE",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        diagnosis,
        savedRecord,
      },
    });
  } catch (error) {
    console.error("Crop diagnosis error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to process crop diagnosis." } },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const farmer = await prisma.farmerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!farmer) {
    return NextResponse.json({ success: true, data: { diagnoses: [] } });
  }

  const diagnoses = await prisma.cropDiagnosis.findMany({
    where: { farmerId: farmer.id },
    include: { crop: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: { diagnoses },
  });
}
