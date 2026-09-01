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
  const student = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!student) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Not authorized." } },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { status, price, description } = body;

    const listing = await prisma.studentListing.update({
      where: { id, studentId: student.id },
      data: {
        ...(status ? { status } : {}),
        ...(price !== undefined ? { price: parseFloat(price) } : {}),
        ...(description ? { description } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Listing updated successfully.",
      data: { listing },
    });
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update listing." } },
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
  const student = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!student) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Not authorized." } },
      { status: 403 }
    );
  }

  try {
    await prisma.studentListing.delete({
      where: { id, studentId: student.id },
    });

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to delete listing." } },
      { status: 500 }
    );
  }
}
