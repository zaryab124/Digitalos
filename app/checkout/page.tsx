import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSelectedCity } from "@/lib/city";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/checkout");
  }

  const activeCity = await getSelectedCity();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Secure Checkout
        </h1>
        <p className="text-xs text-slate-500 font-urdu">
          آرڈر کی تصدیق اور ترسیل کا پتہ
        </p>
      </div>

      <CheckoutClient user={user} activeCity={activeCity} />
    </div>
  );
}
