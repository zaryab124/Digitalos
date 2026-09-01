import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminCitiesClient from "./AdminCitiesClient";

export const dynamic = "force-dynamic";

export default async function AdminCitiesPage() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    redirect("/admin");
  }

  const cities = await prisma.city.findMany({
    include: {
      areas: { orderBy: { name: "asc" } },
      _count: {
        select: {
          businesses: true,
          serviceProviders: true,
          orders: true,
          farmerProfiles: true,
          opportunities: true,
        },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div>
        <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
          🌍 Municipal Expansion & Geographic Hierarchy
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Multi-City Management (ملٹی سٹی مینیجر)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-urdu">
          نئے شہروں کا بغیر کوڈ تبدیلی کے اندراج، علاقوں کی تشکیل اور ڈسٹرکٹ لیول تجزیات
        </p>
      </div>

      <AdminCitiesClient initialCities={cities} />
    </div>
  );
}
