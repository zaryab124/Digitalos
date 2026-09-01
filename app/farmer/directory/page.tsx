import React from "react";
import { getSelectedCity } from "@/lib/city";
import { prisma } from "@/lib/prisma";
import FarmerDirectoryClient from "./FarmerDirectoryClient";

export const dynamic = "force-dynamic";

export default async function FarmerDirectoryPage() {
  const activeCity = await getSelectedCity();

  // 1. Fetch Agricultural Businesses
  const businesses = await prisma.business.findMany({
    where: {
      cityId: activeCity.id,
      status: "APPROVED",
      OR: [
        { category: { slug: "agriculture" } },
        { category: { slug: "hardware" } },
        { name: { contains: "Khad" } },
        { name: { contains: "Seed" } },
        { name: { contains: "Solar" } },
        { name: { contains: "Zari" } },
      ],
    },
    include: {
      category: true,
      locations: true,
    },
    orderBy: [{ ratingAverage: "desc" }],
  });

  // 2. Fetch Agri & Veterinary Specialists
  const providers = await prisma.serviceProvider.findMany({
    where: {
      cityId: activeCity.id,
      status: "APPROVED",
    },
    include: {
      user: true,
    },
    orderBy: [{ ratingAverage: "desc" }],
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
          🌾 Agriculture Directory • {activeCity.name}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Khad, Seed & Veterinary Directory (کھاد، بیج اور ڈاکٹر ڈائریکٹری)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-urdu">
          تصدیق شدہ کھاد و بیج ڈیلرز، زرعی مشینری، سولر ٹیوب ویل مکینک اور ویٹرنری ڈاکٹرز
        </p>
      </div>

      <FarmerDirectoryClient
        activeCity={activeCity}
        businesses={businesses}
        providers={providers}
      />
    </div>
  );
}
