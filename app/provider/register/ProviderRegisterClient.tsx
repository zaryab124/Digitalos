"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Zap,
  Droplet,
  Hammer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";

interface ProviderRegisterClientProps {
  user: { id: string; fullName: string; phoneNumber: string };
  activeCity: { id: string; name: string };
  cities: Array<{ id: string; name: string }>;
}

export default function ProviderRegisterClient({
  user,
  activeCity,
  cities,
}: ProviderRegisterClientProps) {
  const router = useRouter();

  const [cityId, setCityId] = useState(activeCity.id);
  const [categorySlug, setCategorySlug] = useState("electronics");
  const [primarySkill, setPrimarySkill] = useState("");
  const [primarySkillUr, setPrimarySkillUr] = useState("");
  const [secondarySkillsRaw, setSecondarySkillsRaw] = useState("");
  const [cnicNumber, setCnicNumber] = useState("");
  const [experienceYears, setExperienceYears] = useState("3");
  const [baseVisitFee, setBaseVisitFee] = useState("500");
  const [serviceAreasRaw, setServiceAreasRaw] = useState("All Jampur, Indus Highway, Shahi Bazaar");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const expNum = parseInt(experienceYears);
    const feeNum = parseFloat(baseVisitFee);

    if (isNaN(expNum) || expNum < 1) {
      setErrorMessage("Please specify valid experience years (at least 1 year).");
      setIsLoading(false);
      return;
    }

    if (isNaN(feeNum) || feeNum < 0) {
      setErrorMessage("Please enter a valid visit fee amount.");
      setIsLoading(false);
      return;
    }

    const secondarySkills = secondarySkillsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const serviceAreas = serviceAreasRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/v1/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityId,
          categorySlug,
          primarySkill,
          primarySkillUr: primarySkillUr || undefined,
          secondarySkills,
          cnicNumber,
          experienceYears: expNum,
          baseVisitFee: feeNum,
          serviceAreas,
          portfolioPhotos: [],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || "Failed to register profile.");
        setIsLoading(false);
        return;
      }

      router.push("/provider/dashboard");
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

      {/* Verification Notice */}
      <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
        <h4 className="font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <span>City Administration Verification Notice</span>
        </h4>
        <p className="leading-relaxed font-urdu">
          نئے کاریگروں کا اندراج پہلے PENDING اسٹیٹس میں ہوگا اور شہری انتظامیہ کی جانب سے شناختی تصدیق کے بعد APPROVED کیا جائے گا۔
        </p>
      </div>

      {/* 1. Category & Skills */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
          1. Trade, Category & Skills
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              City / شہر *
            </label>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Category *
            </label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="electronics">Electrician & Solar (الیکٹریشن و سولر)</option>
              <option value="hardware">Plumber & Sanitary (پلمبر و سینیٹری)</option>
              <option value="automotive">Motorcycle & Auto Mechanic (آٹو مکینک)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Primary Skill / ٹیکنیکل مہارت (English) *
          </label>
          <input
            type="text"
            required
            value={primarySkill}
            onChange={(e) => setPrimarySkill(e.target.value)}
            placeholder="e.g. Master Electrician & Solar Inverter Specialist"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            مہارت (اردو میں اختیاری)
          </label>
          <input
            type="text"
            value={primarySkillUr}
            onChange={(e) => setPrimarySkillUr(e.target.value)}
            placeholder="مثال: ماسٹر الیکٹریشن و سولر فٹنگ"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-urdu"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Secondary Skills (Comma-separated)
          </label>
          <input
            type="text"
            value={secondarySkillsRaw}
            onChange={(e) => setSecondarySkillsRaw(e.target.value)}
            placeholder="e.g. Solar Wiring, UPS Inverter, Breaker Repair, Generator"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 2. Verification & Experience */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
          2. Credentials & Experience
        </label>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            CNIC Number / قومی شناختی کارڈ نمبر *
          </label>
          <input
            type="text"
            required
            value={cnicNumber}
            onChange={(e) => setCnicNumber(e.target.value)}
            placeholder="32402-1234567-1"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Your CNIC is strictly encrypted and used only for government/admin verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Years of Experience / تجربہ (سال) *
            </label>
            <input
              type="number"
              min={1}
              required
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Standard Visit / Inspection Fee (PKR) *
            </label>
            <input
              type="number"
              min={0}
              required
              value={baseVisitFee}
              onChange={(e) => setBaseVisitFee(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Service Areas (محلے / علاقے)
          </label>
          <input
            type="text"
            value={serviceAreasRaw}
            onChange={(e) => setServiceAreasRaw(e.target.value)}
            placeholder="e.g. All Jampur, Indus Highway, Shahi Bazaar, Kotla Dewan"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
          />
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
          className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isLoading ? "Submitting Profile..." : "Submit Application for Verification"}</span>
        </button>
      </div>
    </form>
  );
}
