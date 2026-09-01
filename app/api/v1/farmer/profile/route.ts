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

  const profile = await prisma.farmerProfile.findUnique({
    where: { userId: user.id },
    include: {
      city: true,
      crops: { orderBy: { createdAt: "desc" } },
      diagnoses: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  return NextResponse.json({
    success: true,
    data: { profile },
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

  try {
    const body = await req.json();
    const { farmName, totalAcres, irrigationType, soilType, addressLine, villageMouza, cityId } = body;

    const targetCityId = cityId || user.cityId;

    const profile = await prisma.farmerProfile.upsert({
      where: { userId: user.id },
      update: {
        farmName: farmName || "My Farm",
        totalAcres: totalAcres ? parseFloat(totalAcres) : 5.0,
        irrigationType: irrigationType || "TUBEWELL",
        soilType: soilType || "CLAY_LOAM",
        addressLine: addressLine || null,
        villageMouza: villageMouza || null,
        cityId: targetCityId,
      },
      create: {
        userId: user.id,
        cityId: targetCityId,
        farmName: farmName || "My Farm",
        totalAcres: totalAcres ? parseFloat(totalAcres) : 5.0,
        irrigationType: irrigationType || "TUBEWELL",
        soilType: soilType || "CLAY_LOAM",
        addressLine: addressLine || null,
        villageMouza: villageMouza || null,
      },
      include: { city: true },
    });

    // Ensure user has FARMER role
    const hasRole = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId: user.id, roleId: "FARMER" } },
    });
    if (!hasRole) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: "FARMER" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Farmer profile saved successfully.",
      data: { profile },
    });
  } catch (error) {
    console.error("Farmer profile error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to save farmer profile." } },
      { status: 500 }
    );
  }
}
