import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSelectedCity, getAllActiveCities } from "@/lib/city";
import { prisma } from "@/lib/prisma";
import RiderRegisterClient from "./RiderRegisterClient";

export const dynamic = "force-dynamic";

export default async function RiderRegisterPage() {
  const user = await getCurrentUser();

  // If already registered as a rider, send straight to dashboard
  if (user) {
    const existing = await prisma.deliveryRider.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      redirect("/rider/dashboard");
    }
  }

  const [activeCity, cities] = await Promise.all([
    getSelectedCity(),
    getAllActiveCities(),
  ]);

  const areas = await prisma.area.findMany({
    where: { cityId: activeCity.id, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="space-y-1">
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
          🚖 Driver & Fleet Onboarding • ڈرائیور رجسٹریشن
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Drive & Earn in {activeCity.name}
        </h1>
        <p className="text-xs text-slate-500 font-urdu">
          بائیک، چنگچی رکشہ، مال بردار لوڈر یا کار ٹیکسی رجسٹر کریں اور روزانہ عزت دار روزگار کمائیں
        </p>
      </div>

      <RiderRegisterClient
        user={user ? { id: user.id, fullName: user.fullName, phoneNumber: user.phoneNumber } : null}
        activeCity={activeCity}
        cities={cities}
        areas={areas.map((a) => ({ id: a.id, name: a.name, nameUr: a.nameUr }))}
      />
    </div>
  );
}
