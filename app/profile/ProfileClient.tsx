"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Shield,
  Star,
  CheckCircle2,
  AlertCircle,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

interface ProfileClientProps {
  user: {
    id: string;
    fullName: string;
    fullNameUr?: string | null;
    phoneNumber: string;
    email?: string | null;
    preferredLanguage: string;
    cityId: string;
    roles: string[];
  };
  cities: Array<{
    id: string;
    name: string;
    nameUr?: string | null;
    slug: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    business: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export default function ProfileClient({
  user,
  cities,
  reviews,
}: ProfileClientProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState(user.fullName);
  const [fullNameUr, setFullNameUr] = useState(user.fullNameUr || "");
  const [preferredLanguage, setPreferredLanguage] = useState(user.preferredLanguage);
  const [cityId, setCityId] = useState(user.cityId);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/v1/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          fullNameUr: fullNameUr || null,
          preferredLanguage,
          cityId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ text: data.error?.message || "Failed to update profile", type: "error" });
      } else {
        setMessage({ text: "Profile updated successfully!", type: "success" });
        router.refresh();
      }
    } catch {
      setMessage({ text: "Network error", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  };

  const isMerchant = user.roles.includes("BUSINESS_OWNER");
  const isAdmin = user.roles.includes("ADMIN") || user.roles.includes("SUPER_ADMIN");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Profile Summary Card */}
      <div className="md:col-span-1 space-y-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-2xl flex items-center justify-center mx-auto shadow-inner">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user.fullName}</h2>
            {user.fullNameUr && (
              <p className="text-sm text-emerald-800 font-urdu">{user.fullNameUr}</p>
            )}
            <p className="text-xs text-slate-500">{user.phoneNumber}</p>
          </div>

          {/* Role Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            {user.roles.map((r) => (
              <span
                key={r}
                className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold"
              >
                {r.replace("_", " ")}
              </span>
            ))}
          </div>

          {/* Quick Dashboard Links */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            {isMerchant && (
              <NextLink
                href="/merchant/dashboard"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Merchant Dashboard</span>
              </NextLink>
            )}

            {isAdmin && (
              <NextLink
                href="/admin"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Console</span>
              </NextLink>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form & Reviews History */}
      <div className="md:col-span-2 space-y-6">
        {/* Profile Edit Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <span>Edit Personal Details</span>
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            {message && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name (English)
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  پورا نام (اردو)
                </label>
                <input
                  type="text"
                  value={fullNameUr}
                  onChange={(e) => setFullNameUr(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-urdu"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Active City / شہر
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
                  Language Preference / زبان
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
              >
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* My Submitted Reviews History */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>My Submitted Reviews ({reviews.length})</span>
          </h3>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">
              You have not posted any reviews yet.
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <NextLink
                      href={`/business/${rev.business.id}`}
                      className="font-bold text-xs text-slate-900 hover:text-emerald-700"
                    >
                      {rev.business.name}
                    </NextLink>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{rev.rating}/5</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{rev.comment}</p>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
