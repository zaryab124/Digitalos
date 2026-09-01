import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RiderDashboardClient from "./RiderDashboardClient";

export const dynamic = "force-dynamic";

export default async function RiderDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/rider/dashboard");
  }

  const rider = await prisma.deliveryRider.findUnique({
    where: { userId: user.id },
    include: { city: true },
  });

  if (!rider) {
    redirect("/rider/register");
  }

  // Fetch available orders in city
  const availableOrders = await prisma.order.findMany({
    where: {
      cityId: rider.cityId,
      status: "READY_FOR_PICKUP",
      riderId: null,
    },
    include: {
      business: {
        include: { locations: true },
      },
      customer: { select: { fullName: true, phoneNumber: true } },
      items: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Fetch active and past orders assigned to this rider
  const assignedOrders = await prisma.order.findMany({
    where: { riderId: rider.id },
    include: {
      business: {
        include: { locations: true },
      },
      customer: { select: { fullName: true, phoneNumber: true } },
      items: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <RiderDashboardClient
        rider={rider}
        availableOrders={availableOrders}
        assignedOrders={assignedOrders}
      />
    </div>
  );
}
