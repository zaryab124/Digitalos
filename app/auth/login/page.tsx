"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Store, Phone, Lock, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
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
      const userRoles = data.data.user.roles || [];

      setTimeout(() => {
        if (userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN")) {
          router.push("/admin");
        } else if (userRoles.includes("BUSINESS_OWNER")) {
          router.push("/merchant/dashboard");
        } else if (userRoles.includes("RIDER")) {
          router.push("/rider/dashboard");
        } else {
          router.push("/");
        }
        router.refresh();
      }, 800);
    } catch {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const setDemoUser = (phone: string, pass: string) => {
    setIdentifier(phone);
    setPassword(pass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome Back</h1>
          <p className="text-xs text-slate-500 font-urdu">
            جام پور ڈیجیٹل نظام میں لاگ ان کریں
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            Quick Fill Demo Accounts (Click to test)
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setDemoUser("+923001234000", "Admin@12345")}
              className="py-1.5 px-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-[10px] border border-indigo-200 text-center"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoUser("+923001234001", "Merchant@12345")}
              className="py-1.5 px-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200 text-center"
            >
              🏪 Shop
            </button>
            <button
              type="button"
              onClick={() => setDemoUser("+923007766554", "Rider@12345")}
              className="py-1.5 px-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-200 text-center"
            >
              🚚 Loader
            </button>
            <button
              type="button"
              onClick={() => setDemoUser("+923001234003", "Customer@12345")}
              className="py-1.5 px-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px] text-center"
            >
              👤 Citizen
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Login successful! Redirecting...</span>
            </div>
          )}

          {/* Identifier Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number or Email / فون نمبر
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="+92 300 1234567 or email"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password / پاس ورڈ
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? "Signing in..." : "Log In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Signup Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don&apos;t have an account yet?{" "}
            <NextLink
              href="/auth/signup"
              className="font-bold text-emerald-700 hover:underline"
            >
              Sign Up Now
            </NextLink>
          </p>
        </div>
      </div>
    </div>
  );
}
