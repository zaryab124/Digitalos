import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BusinessRegisterClient from "./BusinessRegisterClient";

export const dynamic = "force-dynamic";

export default async function BusinessRegisterPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/business/register");
  }

  const [categories, cities] = await Promise.all([
    prisma.businessCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
          <span>Official Merchant Onboarding</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Register Your Business on JDOS
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-urdu">
          اپنی دکان، میڈیکل سٹور یا سروس کا اندراج کریں
        </p>
      </div>

      <BusinessRegisterClient
        user={user}
        categories={categories}
        cities={cities}
      />
    </div>
  );
}
