"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Car,
  Truck,
  Bike,
  Phone,
  Lock,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function RiderLoginClient() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Invalid phone number or password.");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/rider/dashboard");
        router.refresh();
      }, 700);
    } catch {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const setDemoDriver = (phone: string, pass: string) => {
    setIdentifier(phone);
    setPassword(pass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
            <Car className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Rider & Driver Portal</h1>
          <p className="text-xs text-slate-500 font-urdu">
            ڈرائیور اور لوڈر لاگ ان پورٹل — سواریاں قبول کریں اور کمائیں
          </p>
        </div>

        {/* Demo Fast Fill Buttons for Drivers */}
        <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-2 text-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block text-center">
            Demo Driver Accounts (1-Click Fill)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoDriver("+923004444001", "Rider@12345")}
              className="p-2 rounded-xl bg-white hover:bg-emerald-100 text-slate-800 font-bold text-[11px] border border-emerald-200 text-left flex items-center gap-1.5 transition-colors"
            >
              <span className="text-base">🏍️</span>
              <div className="leading-tight truncate">
                <div>Bike Rider</div>
                <div className="text-[9px] text-slate-400 font-normal">Kamran Ali</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDemoDriver("+923005544332", "Rider@12345")}
              className="p-2 rounded-xl bg-white hover:bg-emerald-100 text-slate-800 font-bold text-[11px] border border-emerald-200 text-left flex items-center gap-1.5 transition-colors"
            >
              <span className="text-base">🛺</span>
              <div className="leading-tight truncate">
                <div>Auto Rickshaw</div>
                <div className="text-[9px] text-slate-400 font-normal">Ghulam Rasool</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDemoDriver("+923007766554", "Rider@12345")}
              className="p-2 rounded-xl bg-white hover:bg-emerald-100 text-slate-800 font-bold text-[11px] border border-emerald-200 text-left flex items-center gap-1.5 transition-colors"
            >
              <span className="text-base">🚚</span>
              <div className="leading-tight truncate">
                <div>Cargo Loader</div>
                <div className="text-[9px] text-slate-400 font-normal">Haji Manzoor</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDemoDriver("+923008899001", "Rider@12345")}
              className="p-2 rounded-xl bg-white hover:bg-emerald-100 text-slate-800 font-bold text-[11px] border border-emerald-200 text-left flex items-center gap-1.5 transition-colors"
            >
              <span className="text-base">🚗</span>
              <div className="leading-tight truncate">
                <div>AC Taxi Cab</div>
                <div className="text-[9px] text-slate-400 font-normal">M. Imran</div>
              </div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Login successful! Opening Driver Dashboard...</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Driver Phone Number (موبائل نمبر)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="+923004444001 or 03004444001"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Password (پاس ورڈ)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Logging in...</span>
            ) : (
              <>
                <span>Driver Login &rarr;</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2 text-xs">
          <p className="text-slate-500">
            Want to drive with us?{" "}
            <NextLink
              href="/rider/register"
              className="text-emerald-700 font-bold hover:underline"
            >
              Register your Vehicle (نیا ڈرائیور رجسٹر کریں)
            </NextLink>
          </p>
          <p className="text-slate-400 text-[11px]">
            Customer or Merchant?{" "}
            <NextLink href="/auth/login" className="text-slate-600 font-semibold hover:underline">
              Standard Login
            </NextLink>
          </p>
        </div>
      </div>
    </div>
  );
}
