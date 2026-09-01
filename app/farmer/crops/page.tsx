import React from "react";
import { getSelectedCity } from "@/lib/city";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FarmerCropsClient from "./FarmerCropsClient";

export const dynamic = "force-dynamic";

export default async function FarmerCropsPage() {
  const activeCity = await getSelectedCity();
  const user = await getCurrentUser();

  const farmer = user
    ? await prisma.farmerProfile.findUnique({
        where: { userId: user.id },
        include: {
          crops: { orderBy: { createdAt: "desc" } },
        },
      })
    : null;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
          🌱 Farm & Crop Management • {activeCity.name}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          My Crops & Farm Acreage (فارم اور فصلی ریکارڈ)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-urdu">
          فصلوں کا رقبہ، بوائی کی تاریخ، نگہداشت اور متوقع پیداوار کا ڈیجیٹل ریکارڈ
        </p>
      </div>

      <FarmerCropsClient activeCity={activeCity} user={user} farmer={farmer} />
    </div>
  );
}
