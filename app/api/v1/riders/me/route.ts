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
    const rider = await prisma.deliveryRider.findUnique({
      where: { userId: user.id },
      include: {
        city: true,
        assignedOrders: {
          include: {
            business: { select: { name: true, phone: true, locations: true } },
            customer: { select: { fullName: true, phoneNumber: true } },
            items: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!rider) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_A_RIDER", message: "No rider profile found." } },
        { status: 404 }
      );
    }

    // Available unassigned orders in city ready for pickup
    const availableOrders = await prisma.order.findMany({
      where: {
        cityId: rider.cityId,
        status: "READY_FOR_PICKUP",
        riderId: null,
      },
      include: {
        business: { select: { name: true, phone: true, locations: true } },
        customer: { select: { fullName: true, phoneNumber: true } },
        items: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        rider,
        availableOrders,
      },
    });
  } catch (error) {
    console.error("Rider workspace fetch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch rider dashboard." } },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }

  try {
    const rider = await prisma.deliveryRider.findUnique({
      where: { userId: user.id },
    });

    if (!rider) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_A_RIDER", message: "No rider profile found." } },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { isAvailable } = body;

    const updated = await prisma.deliveryRider.update({
      where: { id: rider.id },
      data: {
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Rider availability set to ${isAvailable ? "Online" : "Offline"}.`,
      data: { rider: updated },
    });
  } catch (error) {
    console.error("Rider update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update rider." } },
      { status: 500 }
    );
  }
}
