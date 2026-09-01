import React from "react";
import { getSelectedCity } from "@/lib/city";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAgroWeatherData } from "@/lib/weather";
import FarmerDashboardClient from "./FarmerDashboardClient";

export const dynamic = "force-dynamic";

export default async function FarmerPage() {
  const activeCity = await getSelectedCity();
  const user = await getCurrentUser();

  const [weather, mandiRates, farmerProfile] = await Promise.all([
    getAgroWeatherData(activeCity.slug),
    prisma.mandiRate.findMany({
      where: { cityId: activeCity.id },
      orderBy: [{ reportedDate: "desc" }, { modalPrice: "desc" }],
      take: 6,
    }),
    user
      ? prisma.farmerProfile.findUnique({
          where: { userId: user.id },
          include: {
            crops: { orderBy: { createdAt: "desc" } },
            diagnoses: { orderBy: { createdAt: "desc" }, take: 3 },
          },
        })
      : null,
  ]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
            🌾 Farmer Hub & Agriculture Intelligence • {activeCity.name}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Kisan Portal (کسان پورٹل)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-urdu">
            جام پور غلہ منڈی ریٹس، جدید زرعی موسم، اور اے آئی فصل ڈاکٹر
          </p>
        </div>
      </div>

      <FarmerDashboardClient
        activeCity={activeCity}
        user={user}
        weather={weather}
        mandiRates={mandiRates}
        farmerProfile={farmerProfile}
      />
    </div>
  );
}
