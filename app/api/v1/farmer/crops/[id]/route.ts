import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const farmer = await prisma.farmerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!farmer) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Not authorized." } },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { stage, estimatedYieldMaunds, notes } = body;

    const crop = await prisma.crop.update({
      where: { id, farmerId: farmer.id },
      data: {
        ...(stage ? { stage } : {}),
        ...(estimatedYieldMaunds !== undefined ? { estimatedYieldMaunds: parseFloat(estimatedYieldMaunds) } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Crop updated successfully.",
      data: { crop },
    });
  } catch (error) {
    console.error("Update crop error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update crop." } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const farmer = await prisma.farmerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!farmer) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Not authorized." } },
      { status: 403 }
    );
  }

  try {
    await prisma.crop.delete({
      where: { id, farmerId: farmer.id },
    });

    return NextResponse.json({
      success: true,
      message: "Crop record deleted.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to delete crop." } },
      { status: 500 }
    );
  }
}
