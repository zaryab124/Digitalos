import React from "react";
import { getSelectedCity } from "@/lib/city";
import { getCurrentUser } from "@/lib/auth";
import AssistantClient from "./AssistantClient";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const [activeCity, user] = await Promise.all([
    getSelectedCity(),
    getCurrentUser(),
  ]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
          🤖 AI Local Assistant • {activeCity.name}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Ask Jampur Digital Assistant
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-urdu">
          اردو، رومن اردو یا انگریزی میں پوچھیں — مقامی دکانیں، کاریگر اور اشیاء تلاش کریں
        </p>
      </div>

      <AssistantClient activeCity={activeCity} user={user} />
    </div>
  );
}
