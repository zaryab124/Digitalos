"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info,
} from "lucide-react";

interface BusinessRegisterClientProps {
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
    cityId: string;
  };
  categories: Array<{
    id: string;
    name: string;
    nameUr?: string | null;
    slug: string;
  }>;
  cities: Array<{
    id: string;
    name: string;
    nameUr?: string | null;
    slug: string;
  }>;
}

export default function BusinessRegisterClient({
  user,
  categories,
  cities,
}: BusinessRegisterClientProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [nameUr, setNameUr] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [cityId, setCityId] = useState(user.cityId || cities[0]?.id || "");
  const [phone, setPhone] = useState(user.phoneNumber || "");
  const [whatsapp, setWhatsapp] = useState(user.phoneNumber || "");
  const [addressLine, setAddressLine] = useState("");
  const [addressLineUr, setAddressLineUr] = useState("");
  const [area, setArea] = useState("Main Bazaar");
  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionUr, setDescriptionUr] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nameUr: nameUr || undefined,
          categoryId,
          cityId,
          phone,
          whatsapp: whatsapp || phone,
          addressLine,
          addressLineUr: addressLineUr || undefined,
          area,
          landmark: landmark || undefined,
          description: description || undefined,
          descriptionUr: descriptionUr || undefined,
          logoUrl: logoUrl || undefined,
          bannerUrl: bannerUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error?.message || "Failed to register business.");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/merchant/dashboard");
        router.refresh();
      }, 1200);
    } catch {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Important Notice / ضروری ہدایت</p>
          <p className="leading-relaxed">
            Newly registered businesses are placed in <strong className="font-bold text-amber-950">PENDING</strong> status. City administrators will verify your details before activating your public listing.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Business registered successfully! Redirecting to your merchant dashboard...</span>
          </div>
        )}

        {/* Section 1: Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Business Identification / دکان کا نام اور معلومات
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business / Shop Name (English) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Al-Razi Pharmacy"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                دکان کا نام (اردو میں)
              </label>
              <input
                type="text"
                value={nameUr}
                onChange={(e) => setNameUr(e.target.value)}
                placeholder="مثال: الرازی فارمیسی"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-urdu"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.nameUr ? `(${c.nameUr})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City / Location *
              </label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.nameUr ? `(${c.nameUr})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Address */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Contact & Physical Location / پتہ اور رابطہ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Order Number (Optional)
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Address Line *
              </label>
              <input
                type="text"
                required
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Shop # 12, Main Indus Highway"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Area / Bazaar Name *
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Shahi Bazaar, Indus Highway, Dajal Road"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nearby Landmark (Optional)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Opposite THQ Hospital, Near Grid Station"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Section 3: Description */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            3. About & Description / دکان کی تفصیلات
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              About Business (English)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your specialties, wholesale/retail offerings, and services..."
              className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              دکان کی تفصیل (اردو یا سرائیکی)
            </label>
            <textarea
              rows={3}
              value={descriptionUr}
              onChange={(e) => setDescriptionUr(e.target.value)}
              placeholder="اپنی دکان کی اشیاء اور سروسز کے بارے میں لکھیں..."
              className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-urdu"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || success}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <span>{isSubmitting ? "Submitting Registration..." : "Submit for Verification"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
