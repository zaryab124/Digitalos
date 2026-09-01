"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Zap,
  Snowflake,
  Droplet,
  Hammer,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

interface ServiceRequestClientProps {
  user: { id: string; fullName: string; phoneNumber: string };
  activeCity: { id: string; name: string; slug: string };
  services: Array<{
    id: string;
    name: string;
    nameUr?: string | null;
    categorySlug: string;
    basePriceEstimate?: number | null;
  }>;
  initialCategory: string;
}

export default function ServiceRequestClient({
  activeCity,
  services,
  initialCategory,
}: ServiceRequestClientProps) {
  const router = useRouter();

  const [categorySlug, setCategorySlug] = useState(initialCategory || "electronics");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"LOW" | "MEDIUM" | "HIGH" | "EMERGENCY">("MEDIUM");
  const [addressLine, setAddressLine] = useState("");
  const [area, setArea] = useState("Indus Highway");
  const [preferredDate, setPreferredDate] = useState("Today");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("Afternoon (02:00 - 05:00 PM)");
  const [photoUrl, setPhotoUrl] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories = [
    { slug: "electronics", name: "Electrician & Solar", icon: Zap },
    { slug: "hardware", name: "Plumber & Sanitary", icon: Droplet },
    { slug: "automotive", name: "Motorcycle & Auto", icon: Hammer },
  ];

  const quickTemplates = [
    {
      title: "AC Cooling / Gas Refill (اے سی گیس لیک)",
      desc: "Mere ghar ka 1.5 ton Inverter AC chal raha hai lekin thandi hawa nahi de raha. Gas leak lagti hai.",
      cat: "electronics",
    },
    {
      title: "Short Circuit & Breaker Tripping (شارٹ سرکٹ)",
      desc: "Main DB box ka breaker bar bar trip ho raha hai aur bijli band ho jati hai.",
      cat: "electronics",
    },
    {
      title: "Water Motor Boring / Leakage (موٹر فٹنگ)",
      desc: "Pani wali motor ka pipe leak kar raha hai aur bathroom me pressure kam hai.",
      cat: "hardware",
    },
  ];

  const handleApplyTemplate = (tmpl: typeof quickTemplates[0]) => {
    setTitle(tmpl.title);
    setDescription(tmpl.desc);
    setCategorySlug(tmpl.cat);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (description.trim().length < 5) {
      setErrorMessage("Please write at least a few words describing the problem.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityId: activeCity.id,
          serviceId: selectedServiceId || undefined,
          categorySlug,
          title: title || `${categorySlug} Repair Request`,
          description,
          urgency,
          addressLine: addressLine || "Jampur City Center",
          area,
          preferredDate,
          preferredTimeSlot,
          photoUrl: photoUrl || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || "Failed to submit request.");
        setIsLoading(false);
        return;
      }

      router.push(`/services/requests/${data.data.serviceRequest.id}`);
    } catch {
      setErrorMessage("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Suggestion Templates */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-3xl space-y-2">
        <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
          <span>💡 Quick Suggestions / عام مسائل کے ٹیمپلیٹ</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {quickTemplates.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyTemplate(t)}
              className="text-[11px] font-semibold bg-white px-3 py-1.5 rounded-xl border border-amber-200 text-amber-900 hover:bg-amber-100/60 transition-colors text-left"
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Category Selection */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
          1. Select Trade / Category
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = categorySlug === cat.slug;

            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setCategorySlug(cat.slug)}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-slate-900">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Problem Title & Description */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
          2. Describe Problem / مسئلہ بیان کریں
        </label>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Problem Title / عنوان *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. AC cooling nahi kar raha ya Fan wiring issue"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Detailed Description / تفصیل *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail (e.g. Mere ghar ka AC on hai lekin gas nahi hai. Kitna kharcha aye ga?)"
            className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Photo URL (Optional / اختیاری تصویر)
          </label>
          <div className="relative">
            <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/broken-unit.jpg"
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Urgency & Location */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
          3. Urgency & Location / ایمرجنسی اور پتہ
        </label>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Urgency Level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { level: "LOW", label: "Normal (2-3 Days)", color: "text-slate-700" },
              { level: "MEDIUM", label: "Within 24 Hours", color: "text-amber-700" },
              { level: "HIGH", label: "Today (Same Day)", color: "text-orange-700" },
              { level: "EMERGENCY", label: "🚨 Emergency", color: "text-rose-700" },
            ].map((u) => (
              <button
                key={u.level}
                type="button"
                onClick={() => setUrgency(u.level as any)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  urgency === u.level
                    ? "border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Area / محلہ ({activeCity.name}) *
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Indus Highway">Indus Highway Bypass</option>
              <option value="Shahi Bazaar">Shahi Bazaar & Purana Chowk</option>
              <option value="THQ Hospital Road">THQ Hospital Road</option>
              <option value="Dajal Road">Dajal Road</option>
              <option value="Kotla Dewan">Kotla Dewan</option>
              <option value="City Center">City Center</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Address / مکمل پتہ *
            </label>
            <input
              type="text"
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. House # 12, Gali # 4, Near Grid Station"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-3 rounded-2xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isLoading ? "Posting Request..." : "Post Request & Receive Quotes"}</span>
        </button>
      </div>
    </form>
  );
}
