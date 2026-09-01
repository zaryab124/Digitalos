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

  const farmer = await prisma.farmerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!farmer) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Farmer profile not found." } },
      { status: 404 }
    );
  }

  const crops = await prisma.crop.findMany({
    where: { farmerId: farmer.id },
    include: { diagnoses: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: { crops },
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

  try {
    const body = await req.json();
    const {
      name,
      nameUr,
      variety,
      acresPlanted,
      sowingDate,
      expectedHarvestDate,
      stage = "SOWING",
      estimatedYieldMaunds,
      notes,
    } = body;

    if (!name || !sowingDate) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_FAILED", message: "Crop name and sowing date are required." } },
        { status: 400 }
      );
    }

    const crop = await prisma.crop.create({
      data: {
        farmerId: farmer.id,
        name,
        nameUr: nameUr || null,
        variety: variety || null,
        acresPlanted: acresPlanted ? parseFloat(acresPlanted) : 1.0,
        sowingDate: new Date(sowingDate),
        expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : null,
        stage,
        estimatedYieldMaunds: estimatedYieldMaunds ? parseFloat(estimatedYieldMaunds) : null,
        notes: notes || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Crop record created successfully.",
        data: { crop },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create crop error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create crop record." } },
      { status: 500 }
    );
  }
}
