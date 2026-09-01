import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProviderDashboardClient from "./ProviderDashboardClient";

export const dynamic = "force-dynamic";

export default async function ProviderDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/provider/dashboard");
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: user.id },
    include: {
      city: true,
      quotes: {
        include: {
          request: {
            include: {
              customer: { select: { fullName: true, phoneNumber: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      assignedJobs: {
        include: {
          customer: { select: { fullName: true, phoneNumber: true } },
          review: true,
        },
        orderBy: { updatedAt: "desc" },
      },
      reviews: {
        include: {
          customer: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!provider) {
    redirect("/provider/register");
  }

  // Fetch available open leads in their category and city
  const availableLeads = await prisma.serviceRequest.findMany({
    where: {
      cityId: provider.cityId,
      categorySlug: provider.categorySlug,
      status: { in: ["OPEN", "QUOTED"] },
      quotes: {
        none: {
          providerId: provider.id,
        },
      },
    },
    include: {
      customer: { select: { fullName: true } },
      _count: { select: { quotes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Technician & Artisan Operations Workspace
        </h1>
        <p className="text-xs text-slate-500 font-urdu">
          کاریگر ڈیش بورڈ — نئے آرڈرز، کوٹیشنز اور آمدنی کا ریکارڈ
        </p>
      </div>

      <ProviderDashboardClient
        user={user}
        provider={{
          ...provider,
          secondarySkills: JSON.parse(provider.secondarySkills || "[]"),
          serviceAreas: JSON.parse(provider.serviceAreas || "[]"),
        }}
        availableLeads={availableLeads}
      />
    </div>
  );
}
