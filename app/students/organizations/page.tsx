import React from "react";
import { getSelectedCity } from "@/lib/city";
import { prisma } from "@/lib/prisma";
import OrganizationsClient from "./OrganizationsClient";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const activeCity = await getSelectedCity();

  const organizations = await prisma.educationalOrganization.findMany({
    include: {
      city: true,
      opportunities: {
        where: { status: "APPROVED" },
        select: { id: true, title: true, type: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div>
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold uppercase tracking-wider">
          🏛️ Educational Directory • South Punjab
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Colleges, Universities & Institutes (تعلیمی ادارے)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-urdu">
          جام پور، راجن پور اور ڈیرہ غازی خان کے تصدیق شدہ کالجز، یونیورسٹیاں اور ٹیکنیکل ادارے
        </p>
      </div>

      <OrganizationsClient
        activeCity={activeCity}
        initialOrganizations={organizations}
      />
    </div>
  );
}
