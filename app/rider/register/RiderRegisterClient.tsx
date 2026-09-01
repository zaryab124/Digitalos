"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";

interface RiderRegisterClientProps {
  user: { id: string; fullName: string; phoneNumber: string };
  activeCity: { id: string; name: string };
  cities: Array<{ id: string; name: string; nameUr: string | null }>;
}

export default function RiderRegisterClient({
  user,
  activeCity,
  cities,
}: RiderRegisterClientProps) {
  const router = useRouter();

  const [cityId, setCityId] = useState(activeCity.id);
  const [vehicleType, setVehicleType] = useState<"MOTORCYCLE" | "RICKSHAW" | "BICYCLE">("MOTORCYCLE");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [cnicNumber, setCnicNumber] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/riders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityId,
          vehicleType,
          vehicleNumber,
          cnicNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || "Failed to submit rider application.");
        setIsLoading(false);
        return;
      }

      router.push("/rider/dashboard");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
    >
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>1. Courier Identity Verification</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Rider Full Name
            </label>
            <input
              type="text"
              disabled
              value={user.fullName}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Registered Phone Number
            </label>
            <input
              type="text"
              disabled
              value={user.phoneNumber}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Operating City / شہر *
          </label>
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
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
            National Identity Card (CNIC / شناختی کارڈ نمبر) *
          </label>
          <input
            type="text"
            required
            placeholder="32402-XXXXXXX-X"
            value={cnicNumber}
            onChange={(e) => setCnicNumber(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600" />
          <span>2. Vehicle Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Vehicle Type / سواری *
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="MOTORCYCLE">Motorcycle (موٹر سائیکل)</option>
              <option value="RICKSHAW">Auto / Qingqi Rickshaw (رکشہ)</option>
              <option value="BICYCLE">Bicycle (سائیکل)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Vehicle Number Plate / رجسٹریشن نمبر *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. DGK-8821 or RJP-1234"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>{isLoading ? "Submitting Application..." : "Submit Rider Application"}</span>
      </button>
    </form>
  );
}
