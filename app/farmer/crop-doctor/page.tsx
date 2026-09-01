import React from "react";
import { getSelectedCity } from "@/lib/city";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CropDoctorClient from "./CropDoctorClient";

export const dynamic = "force-dynamic";

export default async function CropDoctorPage() {
  const activeCity = await getSelectedCity();
  const user = await getCurrentUser();

  const farmer = user
    ? await prisma.farmerProfile.findUnique({
        where: { userId: user.id },
        include: {
          crops: true,
          diagnoses: { orderBy: { createdAt: "desc" } },
        },
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
          🔬 AI Crop Doctor • {activeCity.name}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Crop Disease & Pest Diagnosis (اے آئی فصل معائنہ)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-urdu">
          پودے کے علامات یا تصویر اپلوڈ کریں اور فوراً ماہرانہ علاج اور سپرے کی ہدایات حاصل کریں
        </p>
      </div>

      <CropDoctorClient activeCity={activeCity} user={user} farmer={farmer} />
    </div>
  );
}
