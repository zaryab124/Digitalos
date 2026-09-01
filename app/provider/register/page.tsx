import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSelectedCity, getAllActiveCities } from "@/lib/city";
import { prisma } from "@/lib/prisma";
import ProviderRegisterClient from "./ProviderRegisterClient";

export const dynamic = "force-dynamic";

export default async function ProviderRegisterPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/provider/register");
  }

  // Check if user already registered
  const existing = await prisma.serviceProvider.findUnique({
    where: { userId: user.id },
  });

  if (existing) {
    redirect("/provider/dashboard");
  }

  const [activeCity, cities] = await Promise.all([
    getSelectedCity(),
    getAllActiveCities(),
  ]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="space-y-1">
        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider">
          🛠️ Artisan & Technician Onboarding
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Join Jampur Digital OS as a Service Provider
        </h1>
        <p className="text-xs text-slate-500 font-urdu">
          جام پور کے ہنرمندوں کا ڈیجیٹل اندراج — باوقار روزگار اور براہ راست گاہک
        </p>
      </div>

      <ProviderRegisterClient
        user={user}
        activeCity={activeCity}
        cities={cities}
      />
    </div>
  );
}
