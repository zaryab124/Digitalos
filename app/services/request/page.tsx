import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSelectedCity } from "@/lib/city";
import { prisma } from "@/lib/prisma";
import ServiceRequestClient from "./ServiceRequestClient";

export const dynamic = "force-dynamic";

export default async function ServiceRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; technicianId?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/services/request");
  }

  const { category: preselectedCategory } = await searchParams;
  const activeCity = await getSelectedCity();

  // Fetch standard services
  const services = await prisma.service.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="space-y-1">
        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider">
          🛠️ Post Repair Request • {activeCity.name}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Request a Local Service & Get Quotes
        </h1>
        <p className="text-xs text-slate-500 font-urdu">
          اپنے مسئلے کی تفصیل درج کریں — قریبی ٹیکنیشنز چند منٹوں میں کوٹیشن دیں گے
        </p>
      </div>

      <ServiceRequestClient
        user={user}
        activeCity={activeCity}
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          nameUr: s.nameUr,
          categorySlug: s.category.slug,
          basePriceEstimate: s.basePriceEstimate,
        }))}
        initialCategory={preselectedCategory || "electronics"}
      />
    </div>
  );
}
