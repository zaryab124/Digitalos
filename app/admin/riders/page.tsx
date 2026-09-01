import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import AdminFleetClient from "./AdminFleetClient";

export const dynamic = "force-dynamic";

export default async function AdminFleetPortalPage() {
  const user = await getCurrentUser();

  if (!user || !isAdmin(user.roles)) {
    redirect("/auth/login?redirect=/admin/riders");
  }

  const [drivers, cities] = await Promise.all([
    prisma.deliveryRider.findMany({
      include: {
        user: { select: { id: true, fullName: true, fullNameUr: true, phoneNumber: true, email: true, avatarUrl: true } },
        city: true,
        _count: {
          select: {
            assignedOrders: true,
            rideBookings: true,
            rideReviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.city.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <AdminFleetClient initialDrivers={drivers} cities={cities} />
    </div>
  );
}
