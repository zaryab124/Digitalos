"use client";

import React from "react";
import NextLink from "next/link";
import {
  CloudSun,
  Wind,
  Droplets,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Sprout,
  Store,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  FileText,
  MapPin,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface FarmerDashboardClientProps {
  activeCity: { id: string; name: string; slug: string };
  user: any;
  weather: any;
  mandiRates: any[];
  farmerProfile: any;
}

export default function FarmerDashboardClient({
  activeCity,
  user,
  weather,
  mandiRates,
  farmerProfile,
}: FarmerDashboardClientProps) {
  return (
    <div className="space-y-6">
      {/* Quick Nav Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NextLink
          href="/farmer/crop-doctor"
          className="p-4 rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition-transform space-y-2"
        >
          <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm">AI Crop Doctor</h3>
            <p className="text-[11px] text-emerald-100 font-urdu">فصل کا اے آئی علاج</p>
          </div>
        </NextLink>

        <NextLink
          href="/farmer/mandi"
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 hover:scale-[1.02] transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Mandi Rates</h3>
            <p className="text-[11px] text-slate-500 font-urdu">غلہ منڈی ریٹس</p>
          </div>
        </NextLink>

        <NextLink
          href="/farmer/crops"
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 hover:scale-[1.02] transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">My Farm & Crops</h3>
            <p className="text-[11px] text-slate-500 font-urdu">فارم اور فصلیں</p>
          </div>
        </NextLink>

        <NextLink
          href="/farmer/directory"
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 hover:scale-[1.02] transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Agri Directory</h3>
            <p className="text-[11px] text-slate-500 font-urdu">کھاد، بیج اور ڈاکٹر</p>
          </div>
        </NextLink>
      </div>

      {/* Main Grid: Weather + Today's Mandi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Agro Weather Widget */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-[11px] font-extrabold flex items-center gap-1.5">
                <CloudSun className="w-3.5 h-3.5" />
                <span>Live Agro Weather • {weather.city}</span>
              </span>
              <span className="text-xs text-slate-400 font-urdu">{weather.conditionUr}</span>
            </div>

            <div className="flex items-baseline justify-between pt-2">
              <div>
                <span className="text-5xl font-black">{weather.temperature}°C</span>
                <p className="text-xs text-slate-300 mt-1">
                  Feels like {weather.apparentTemperature}°C • {weather.condition}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
              <div className="p-2.5 rounded-2xl bg-white/5 space-y-1">
                <Wind className="w-4 h-4 text-emerald-400 mx-auto" />
                <span className="text-[10px] text-slate-400 block">Wind</span>
                <span className="text-xs font-bold">{weather.windSpeed} km/h</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/5 space-y-1">
                <Droplets className="w-4 h-4 text-blue-400 mx-auto" />
                <span className="text-[10px] text-slate-400 block">Humidity</span>
                <span className="text-xs font-bold">{weather.humidity}%</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/5 space-y-1">
                <CloudSun className="w-4 h-4 text-amber-400 mx-auto" />
                <span className="text-[10px] text-slate-400 block">Rain Prob</span>
                <span className="text-xs font-bold">{weather.precipitationProbability}%</span>
              </div>
            </div>
          </div>

          {/* Weather Alert */}
          {weather.alerts && weather.alerts.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                <span>{weather.alerts[0].title}</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                {weather.alerts[0].description}
              </p>
              <p className="text-[11px] text-emerald-200 font-urdu">
                {weather.alerts[0].descriptionUr}
              </p>
            </div>
          )}
        </div>

        {/* 2. Today's Mandi Rates Board (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Today's Mandi Rates ({activeCity.name})</span>
                </h2>
                <p className="text-xs text-slate-500 font-urdu">
                  جام پور غلہ منڈی کے تصدیق شدہ یومیہ بھاؤ
                </p>
              </div>

              <NextLink
                href="/farmer/mandi"
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>Full Mandi Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NextLink>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              {mandiRates.map((rate) => (
                <div
                  key={rate.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2 hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">
                        {rate.cropName}
                      </h4>
                      {rate.cropNameUr && (
                        <span className="text-[11px] text-emerald-800 font-urdu block">
                          {rate.cropNameUr}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{rate.variety}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      {rate.trend === "UP" ? (
                        <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <TrendingUp className="w-3 h-3 mr-0.5" /> UP
                        </span>
                      ) : rate.trend === "DOWN" ? (
                        <span className="flex items-center text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                          <TrendingDown className="w-3 h-3 mr-0.5" /> DOWN
                        </span>
                      ) : (
                        <span className="flex items-center text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Minus className="w-3 h-3 mr-0.5" /> STABLE
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/50">
                    <span className="font-black text-sm text-slate-900">
                      {formatPKR(rate.modalPrice)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      per {rate.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 text-[11px] text-emerald-900 flex items-center justify-between">
            <span>🛡️ Rates verified with Jampur Market Committee (غلہ منڈی کمیٹی)</span>
            <span className="font-bold">Unit: 40 KG (1 Maan)</span>
          </div>
        </div>
      </div>

      {/* Active Farm & Crops Summary */}
      {farmerProfile && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                {farmerProfile.farmName} • {farmerProfile.totalAcres} Acres
              </h3>
              <p className="text-xs text-slate-500">
                Irrigation: {farmerProfile.irrigationType} • Soil: {farmerProfile.soilType} • {farmerProfile.villageMouza || "Jampur"}
              </p>
            </div>

            <NextLink
              href="/farmer/crops"
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
            >
              Manage Crops →
            </NextLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {farmerProfile.crops.map((c: any) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{c.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {c.stage}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {c.acresPlanted} Acres • Sown: {new Date(c.sowingDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
