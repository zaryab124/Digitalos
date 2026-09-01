"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Zap,
  ArrowRight,
  TrendingUp,
  X,
  CreditCard,
  Building2,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface MerchantSubscriptionClientProps {
  business: any;
  plans: any[];
  activeSub: any;
}

export default function MerchantSubscriptionClient({
  business,
  plans,
  activeSub,
}: MerchantSubscriptionClientProps) {
  const router = useRouter();

  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<any | null>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [paymentMethod, setPaymentMethod] = useState("JAZZCASH");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const currentPlanName = activeSub?.plan?.name || "BASIC";

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForUpgrade || isSubscribing) return;

    setIsSubscribing(true);
    try {
      const res = await fetch("/api/v1/merchant/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: selectedPlanForUpgrade.name,
          billingCycle,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedPlanForUpgrade(null);
        router.refresh();
        alert(data.message || "Subscription upgraded successfully!");
      } else {
        alert(data.error?.message || "Failed to upgrade subscription.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Status Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Current Business Tier:
          </span>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900">{currentPlanName} PLAN</h2>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              ACTIVE
            </span>
          </div>
          {activeSub ? (
            <p className="text-xs text-slate-500">
              Renews / Expires on: <strong>{new Date(activeSub.endDate).toLocaleDateString()}</strong> (Billing: {activeSub.billingCycle})
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Basic free tier with standard marketplace placement.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
            <span>Products: <strong>{business.products.length}</strong> / {activeSub?.plan?.productLimit || 10}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
            <span>Offers: <strong>{business.offers.length}</strong> / {activeSub?.plan?.offerLimit || 1}</span>
          </div>
        </div>
      </div>

      {/* Plan Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.name === currentPlanName;
          const isPro = plan.name === "PRO";
          const isPremium = plan.name === "PREMIUM";
          const featuresList = JSON.parse(plan.features || "[]");

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-6 sm:p-8 border-2 shadow-sm space-y-6 flex flex-col justify-between relative transition-all ${
                isPro
                  ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                  : isPremium
                  ? "border-purple-500 shadow-md"
                  : "border-slate-200"
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm">
                  Most Popular for Local Shops
                </div>
              )}

              {isPremium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-purple-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm">
                  Enterprise Brand Growth
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-lg text-slate-900">{plan.name}</h3>
                    {plan.nameUr && (
                      <span className="text-xs font-bold text-slate-500 font-urdu">{plan.nameUr}</span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-black text-slate-900">
                      {plan.priceMonthly === 0 ? "Free" : formatPKR(plan.priceMonthly)}
                    </span>
                    {plan.priceMonthly > 0 && (
                      <span className="text-xs text-slate-400 font-bold">/ month</span>
                    )}
                  </div>
                </div>

                {/* Feature List */}
                <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  {featuresList.map((f: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs text-center">
                    Current Active Plan
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedPlanForUpgrade(plan)}
                    className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 ${
                      isPro
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                        : isPremium
                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <span>Upgrade to {plan.name} →</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Modal */}
      {selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Upgrade to {selectedPlanForUpgrade.name}
                </h3>
                <p className="text-xs text-slate-500 font-urdu">
                  جاز کیش، ایزی پیسہ یا بینک ٹرانسفر کے ذریعے ادائیگی
                </p>
              </div>
              <button
                onClick={() => setSelectedPlanForUpgrade(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Billing Cycle</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("MONTHLY")}
                    className={`p-3 rounded-xl font-bold border text-left ${
                      billingCycle === "MONTHLY"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                        : "border-slate-200 text-slate-700"
                    }`}
                  >
                    <div>Monthly Billing</div>
                    <div className="font-black text-sm">{formatPKR(selectedPlanForUpgrade.priceMonthly)}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillingCycle("ANNUAL")}
                    className={`p-3 rounded-xl font-bold border text-left ${
                      billingCycle === "ANNUAL"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                        : "border-slate-200 text-slate-700"
                    }`}
                  >
                    <div>Annual (Save 15%)</div>
                    <div className="font-black text-sm">{formatPKR(selectedPlanForUpgrade.priceAnnual)}</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs"
                >
                  <option value="JAZZCASH">JazzCash Instant / Till ID</option>
                  <option value="EASYPAISA">EasyPaisa Account</option>
                  <option value="BANK_TRANSFER">Direct Bank Transfer (HBL / MCB Jampur)</option>
                  <option value="CASH">Cash at Municipal Facilitation Center</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-900 block">Instant Activation Guarantee:</span>
                <p>
                  Upon confirmation, your merchant catalog limit and AI marketing tools will be unlocked immediately for your storefront in {business.name}.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForUpgrade(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black disabled:opacity-50"
                >
                  {isSubscribing ? "Activating..." : "Confirm & Activate Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
