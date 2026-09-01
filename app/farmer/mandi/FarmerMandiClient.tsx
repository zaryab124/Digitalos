"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Calendar,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface FarmerMandiClientProps {
  activeCity: { id: string; name: string; slug: string };
  initialRates: any[];
}

export default function FarmerMandiClient({
  activeCity,
  initialRates,
}: FarmerMandiClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCropFilter, setSelectedCropFilter] = useState("ALL");

  const filteredRates = initialRates.filter((rate) => {
    const matchesSearch =
      rate.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rate.cropNameUr && rate.cropNameUr.includes(searchQuery)) ||
      (rate.variety && rate.variety.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCrop =
      selectedCropFilter === "ALL" ||
      rate.cropName.toLowerCase().includes(selectedCropFilter.toLowerCase());

    return matchesSearch && matchesCrop;
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop by English or Urdu name (e.g. Cotton, گندم)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "Cotton", "Wheat", "Sugarcane", "Sesame", "Mustard"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCropFilter(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                selectedCropFilter === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mandi Rates Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Verified Commodity Rates ({activeCity.name})
            </h3>
            <p className="text-xs text-slate-500 font-urdu">
              ریٹس براہ راست مارکیٹ کمیٹی اور آڑھتیوں سے تصدیق شدہ ہیں
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Updated: Today</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-6">Commodity / Crop</th>
                <th className="py-3.5 px-4">Variety</th>
                <th className="py-3.5 px-4">Mandi Location</th>
                <th className="py-3.5 px-4">Price Range (PKR)</th>
                <th className="py-3.5 px-4">Modal Price</th>
                <th className="py-3.5 px-4 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
              {filteredRates.map((rate) => (
                <tr key={rate.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-extrabold text-sm text-slate-900">
                      {rate.cropName}
                    </div>
                    {rate.cropNameUr && (
                      <div className="text-xs text-emerald-800 font-urdu">
                        {rate.cropNameUr}
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-4 text-slate-600">
                    {rate.variety || "Standard"}
                  </td>

                  <td className="py-4 px-4 text-slate-500 text-[11px]">
                    {rate.mandiLocation}
                  </td>

                  <td className="py-4 px-4 font-mono text-slate-600">
                    {formatPKR(rate.minPrice)} – {formatPKR(rate.maxPrice)}
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-black text-sm text-emerald-800">
                      {formatPKR(rate.modalPrice)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      per {rate.unit}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    {rate.trend === "UP" ? (
                      <span className="inline-flex items-center text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        <TrendingUp className="w-3 h-3 mr-1" /> + RISING
                      </span>
                    ) : rate.trend === "DOWN" ? (
                      <span className="inline-flex items-center text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        <TrendingDown className="w-3 h-3 mr-1" /> - FALLING
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        <Minus className="w-3 h-3 mr-1" /> STABLE
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Grounded directly in Jampur Market Committee daily rate registers.</span>
          </span>
          <span>Standard Weight: 40 Kilograms (1 Maan)</span>
        </div>
      </div>
    </div>
  );
}
