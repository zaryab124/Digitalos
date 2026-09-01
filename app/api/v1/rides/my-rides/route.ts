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

  try {
    const rides = await prisma.rideBooking.findMany({
      where: { customerId: user.id },
      include: {
        rider: {
          include: {
            user: { select: { fullName: true, phoneNumber: true, avatarUrl: true } },
          },
        },
        city: true,
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { rides },
    });
  } catch (error) {
    console.error("My rides fetch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch user rides." } },
      { status: 500 }
    );
  }
}
