import React from "react";
import { getSelectedCity } from "@/lib/city";
import { prisma } from "@/lib/prisma";
import FarmerMandiClient from "./FarmerMandiClient";

export const dynamic = "force-dynamic";

export default async function FarmerMandiPage() {
  const activeCity = await getSelectedCity();

  const rates = await prisma.mandiRate.findMany({
    where: { cityId: activeCity.id },
    orderBy: [{ reportedDate: "desc" }, { modalPrice: "desc" }],
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
          📈 Market Intelligence • {activeCity.name}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Galla Mandi Daily Rates (غلہ منڈی ریٹس)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-urdu">
          جام پور اور راجن پور غلہ منڈی کے تصدیق شدہ یومیہ بھاؤ، قیمت کا اتار چڑھاؤ اور تاریخی ڈیٹا
        </p>
      </div>

      <FarmerMandiClient activeCity={activeCity} initialRates={rates} />
    </div>
  );
}
