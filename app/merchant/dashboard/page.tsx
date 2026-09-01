import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MerchantDashboardClient from "./MerchantDashboardClient";

export const dynamic = "force-dynamic";

export default async function MerchantDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/merchant/dashboard");
  }

  // Fetch businesses owned by this user
  const businesses = await prisma.business.findMany({
    where: { ownerId: user.id },
    include: {
      city: true,
      category: true,
      locations: true,
      hours: { orderBy: { dayOfWeek: "asc" } },
      products: { orderBy: { createdAt: "desc" } },
      offers: { orderBy: { createdAt: "desc" } },
      orders: {
        include: {
          customer: { select: { fullName: true, phoneNumber: true } },
          rider: { include: { user: { select: { fullName: true, phoneNumber: true } } } },
          items: true,
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        include: {
          user: {
            select: { id: true, fullName: true, phoneNumber: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (businesses.length === 0) {
    redirect("/business/register");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Merchant Operations & Commerce Dashboard
        </h1>
        <p className="text-xs text-slate-500 font-urdu">
          دکاندار ڈیش بورڈ — کیٹلاگ، کسٹمر آرڈرز اور سیلز
        </p>
      </div>

      <MerchantDashboardClient
        user={user}
        businesses={businesses.map((b) => ({
          ...b,
          location: b.locations[0] || null,
        }))}
      />
    </div>
  );
}
