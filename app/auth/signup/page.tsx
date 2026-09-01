"use client";

import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Store, User, Phone, Lock, MapPin, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

interface City {
  id: string;
  name: string;
  nameUr: string | null;
  slug: string;
}

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [fullNameUr, setFullNameUr] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cityId, setCityId] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "BUSINESS_OWNER">("CUSTOMER");
  const [preferredLanguage, setPreferredLanguage] = useState("ur");

  const [cities, setCities] = useState<City[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/v1/cities")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.cities) {
          setCities(data.data.cities);
          if (data.data.cities.length > 0) {
            setCityId(data.data.cities[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          fullNameUr: fullNameUr || undefined,
          phoneNumber,
          email: email || undefined,
          password,
          cityId,
          role,
          preferredLanguage,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Registration failed. Please check your data.");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        if (role === "BUSINESS_OWNER") {
          router.push("/business/register");
        } else {
          router.push("/");
        }
        router.refresh();
      }, 1000);
    } catch {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Create JDOS Account</h1>
          <p className="text-xs text-slate-500 font-urdu">
            جام پور ڈیجیٹل او ایس اکاؤنٹ بنائیں
          </p>
        </div>

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
              <span>Account created! Redirecting...</span>
            </div>
          )}

          {/* Account Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              I want to use JDOS as / میں اکاؤنٹ بنانا چاہتا ہوں بطور
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("CUSTOMER")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  role === "CUSTOMER"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                👤 Customer / Citizen
              </button>
              <button
                type="button"
                onClick={() => setRole("BUSINESS_OWNER")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  role === "BUSINESS_OWNER"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                🏪 Shopkeeper / Merchant
              </button>
            </div>
          </div>

          {/* Full Name English & Urdu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name (English)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Muhammad Bilal"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                پورا نام (اردو میں اختیاری)
              </label>
              <input
                type="text"
                value={fullNameUr}
                onChange={(e) => setFullNameUr(e.target.value)}
                placeholder="مثال: محمد بلال"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-urdu"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mobile Phone Number / موبائل نمبر
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="03001234567 or +923001234567"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* City Selection & Preferred Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your City / شہر
              </label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.nameUr ? `(${c.nameUr})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Language / زبان
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              >
                <option value="ur">اردو (Urdu)</option>
                <option value="skr">سرائیکی (Saraiki)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Create Password / پاس ورڈ بنائیں
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? "Creating Account..." : "Complete Registration"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{" "}
            <NextLink
              href="/auth/login"
              className="font-bold text-emerald-700 hover:underline"
            >
              Sign In Here
            </NextLink>
          </p>
        </div>
      </div>
    </div>
  );
}
