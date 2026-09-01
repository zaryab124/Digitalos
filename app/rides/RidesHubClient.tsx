"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Car,
  Truck,
  Bike,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Package,
  Layers,
  Search,
  UserCheck,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface RidesHubClientProps {
  activeCity: { id: string; name: string; nameUr: string | null };
  cities: Array<{ id: string; name: string }>;
  areas: Array<{ id: string; name: string; nameUr: string | null }>;
  drivers: any[];
  initialType?: string;
  initialCategory?: string;
}

export default function RidesHubClient({
  activeCity,
  areas,
  drivers,
  initialType = "ride",
  initialCategory = "ALL",
}: RidesHubClientProps) {
  const router = useRouter();

  // Mode: "PASSENGER_RIDE" or "MERCHANT_CARGO"
  const [serviceMode, setServiceMode] = useState<"PASSENGER_RIDE" | "MERCHANT_CARGO">(
    initialType === "cargo" ? "MERCHANT_CARGO" : "PASSENGER_RIDE"
  );

  // Selected vehicle category
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory !== "ALL"
      ? initialCategory
      : initialType === "cargo"
      ? "LOADER_RICKSHAW"
      : "AUTO_RICKSHAW"
  );

  // Booking Form State
  const [pickupArea, setPickupArea] = useState(areas[0]?.name || "Main Bazaar");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffArea, setDropoffArea] = useState(areas[1]?.name || "College Road");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [cargoDescription, setCargoDescription] = useState("");
  const [estimatedWeightKg, setEstimatedWeightKg] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchesCategory =
        selectedCategory === "ALL" || d.vehicleCategory === selectedCategory;
      const types = JSON.parse(d.serviceTypes || "[]");
      const matchesService = types.includes(serviceMode);
      return matchesCategory && matchesService;
    });
  }, [drivers, selectedCategory, serviceMode]);

  // Fare estimation logic
  const estimatedFare = useMemo(() => {
    const baseRates: Record<string, { base: number; perKm: number }> = {
      BIKE: { base: 60, perKm: 20 },
      AUTO_RICKSHAW: { base: 100, perKm: 35 },
      LOADER_RICKSHAW: { base: 300, perKm: 60 },
      CAR_TAXI: { base: 250, perKm: 50 },
      PICKUP_TRUCK: { base: 600, perKm: 100 },
    };

    const rate = baseRates[selectedCategory] || { base: 100, perKm: 30 };
    // Estimated average city trip ~ 3-5 km
    const avgDistanceKm = pickupArea === dropoffArea ? 2.5 : 5.0;
    return Math.round(rate.base + avgDistanceKm * rate.perKm);
  }, [selectedCategory, pickupArea, dropoffArea]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const fullPickup = pickupAddress.trim()
      ? `${pickupAddress.trim()}, ${pickupArea}`
      : `${pickupArea}, ${activeCity.name}`;
    const fullDropoff = dropoffAddress.trim()
      ? `${dropoffAddress.trim()}, ${dropoffArea}`
      : `${dropoffArea}, ${activeCity.name}`;

    try {
      const res = await fetch("/api/v1/rides/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityId: activeCity.id,
          serviceType: serviceMode,
          vehicleCategory: selectedCategory,
          pickupAddress: fullPickup,
          dropoffAddress: fullDropoff,
          pickupArea,
          dropoffArea,
          cargoDescription: serviceMode === "MERCHANT_CARGO" ? cargoDescription : undefined,
          estimatedWeightKg: serviceMode === "MERCHANT_CARGO" ? estimatedWeightKg : undefined,
          riderId: selectedDriverId,
          fareAmount: estimatedFare,
          paymentMethod: "CASH",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 401) {
          router.push(`/auth/login?redirect=/rides`);
          return;
        }
        setFormError(data.error?.message || "Failed to book ride.");
        setIsSubmitting(false);
        return;
      }

      setBookingSuccess(data.data.booking);
      setIsSubmitting(false);
    } catch {
      setFormError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-8 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Local Drivers & Loaders • {activeCity.name}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            City Ride-Hailing & Merchant Logistics
          </h1>

          <p className="text-base text-slate-300 font-urdu leading-relaxed">
            جام پور اور جنوبی پنجاب میں فوری سواری (موٹر سائیکل، رکشہ، ٹیکسی) یا دکانداروں کیلئے مال بردار لوڈر رکشہ حاصل کریں۔
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/rides/my-rides"
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center gap-2 border border-white/15 backdrop-blur-md transition-all"
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Track My Active Trips & Bookings</span>
            </Link>

            <Link
              href="/rider/register"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Bike className="w-4 h-4" />
              <span>Register as Driver / Loader</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Service Mode Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => {
            setServiceMode("PASSENGER_RIDE");
            setSelectedCategory("AUTO_RICKSHAW");
          }}
          className={`p-6 rounded-3xl border-2 text-left transition-all ${
            serviceMode === "PASSENGER_RIDE"
              ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-4 ring-emerald-500/10"
              : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between pb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black">
              <Car className="w-6 h-6" />
            </div>
            {serviceMode === "PASSENGER_RIDE" && (
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
                Active Mode
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Passenger Ride (سواری)
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-urdu">
            شہریوں کیلئے موٹر سائیکل، رکشہ اور اے سی کار ٹیکسی سروس
          </p>
        </button>

        <button
          onClick={() => {
            setServiceMode("MERCHANT_CARGO");
            setSelectedCategory("LOADER_RICKSHAW");
          }}
          className={`p-6 rounded-3xl border-2 text-left transition-all ${
            serviceMode === "MERCHANT_CARGO"
              ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-4 ring-emerald-500/10"
              : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between pb-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
              <Truck className="w-6 h-6 text-emerald-400" />
            </div>
            {serviceMode === "MERCHANT_CARGO" && (
              <span className="px-3 py-1 rounded-full bg-slate-900 text-emerald-400 text-xs font-black">
                Active Mode
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Merchant Cargo Loader (مال بردار لوڈر)
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-urdu">
            دکانداروں اور کسانوں کیلئے غلہ، کھاد، کپڑا، ادویات اور سامان کی لوڈنگ
          </p>
        </button>
      </div>

      {/* Booking Form & Vehicle Category Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Booking Card */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleCreateBooking}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
          >
            {formError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            {/* Vehicle Selection Carousel / Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                1. Select Vehicle Type / گاڑی یا سواری کا انتخاب
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {serviceMode === "PASSENGER_RIDE" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("BIKE")}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        selectedCategory === "BIKE"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 font-bold"
                      }`}
                    >
                      <Bike className="w-6 h-6 mx-auto mb-1.5 text-emerald-600" />
                      <span className="text-xs block">Bike (موٹرسائیکل)</span>
                      <span className="text-[10px] text-slate-500 block font-normal">From Rs. 60</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCategory("AUTO_RICKSHAW")}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        selectedCategory === "AUTO_RICKSHAW"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 font-bold"
                      }`}
                    >
                      <Car className="w-6 h-6 mx-auto mb-1.5 text-emerald-600" />
                      <span className="text-xs block">Rickshaw (رکشہ)</span>
                      <span className="text-[10px] text-slate-500 block font-normal">From Rs. 100</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCategory("CAR_TAXI")}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        selectedCategory === "CAR_TAXI"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 font-bold"
                      }`}
                    >
                      <Car className="w-6 h-6 mx-auto mb-1.5 text-emerald-600" />
                      <span className="text-xs block">Car / AC Taxi</span>
                      <span className="text-[10px] text-slate-500 block font-normal">From Rs. 250</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCategory("ALL")}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        selectedCategory === "ALL"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 font-bold"
                      }`}
                    >
                      <Layers className="w-6 h-6 mx-auto mb-1.5 text-slate-600" />
                      <span className="text-xs block">All Vehicles</span>
                      <span className="text-[10px] text-slate-500 block font-normal">Show Directory</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("LOADER_RICKSHAW")}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        selectedCategory === "LOADER_RICKSHAW"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 font-bold"
                      }`}
                    >
                      <Truck className="w-6 h-6 mx-auto mb-1.5 text-emerald-600" />
                      <span className="text-xs block">Loader Rickshaw</span>
                      <span className="text-[10px] text-slate-500 block font-normal">Up to 800 kg</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCategory("PICKUP_TRUCK")}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        selectedCategory === "PICKUP_TRUCK"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 font-bold"
                      }`}
                    >
                      <Truck className="w-6 h-6 mx-auto mb-1.5 text-emerald-600" />
                      <span className="text-xs block">Pickup Truck</span>
                      <span className="text-[10px] text-slate-500 block font-normal">1,500+ kg</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pickup */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Pickup Location (کہاں سے بیٹھنا ہے) *</span>
                </label>
                <select
                  value={pickupArea}
                  onChange={(e) => setPickupArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name} {a.nameUr ? `(${a.nameUr})` : ""}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Street / Shop name / Landmark (e.g. Near Ghalla Mandi Gate 2)"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                />
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-slate-400">Quick Stands:</span>
                  {["Sabzi Mandi & Fruits Market", "Ghalla Mandi (Grain Market)", "Bypass Chowk", "Main Bazaar"].map((hub) => (
                    <button
                      key={hub}
                      type="button"
                      onClick={() => setPickupArea(hub)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                        pickupArea === hub
                          ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      }`}
                    >
                      {hub.includes("Sabzi") ? "🥦 Sabzi Mandi" : hub.includes("Ghalla") ? "🌾 Ghalla Mandi" : hub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dropoff */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-rose-600" />
                  <span>Destination (کہاں جانا ہے / سامان پہنچانا ہے) *</span>
                </label>
                <select
                  value={dropoffArea}
                  onChange={(e) => setDropoffArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name} {a.nameUr ? `(${a.nameUr})` : ""}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Street / House # / Shop (e.g. College Road Shop # 4)"
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                />

                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-slate-400">Quick Stops:</span>
                  {["Sabzi Mandi & Fruits Market", "Ghalla Mandi (Grain Market)", "College Road", "THQ Hospital Road"].map((hub) => (
                    <button
                      key={hub}
                      type="button"
                      onClick={() => setDropoffArea(hub)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                        dropoffArea === hub
                          ? "bg-rose-600 text-white border-rose-600 font-bold"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      }`}
                    >
                      {hub.includes("Sabzi") ? "🥦 Sabzi Mandi" : hub.includes("Ghalla") ? "🌾 Ghalla Mandi" : hub}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cargo Specific Inputs */}
            {serviceMode === "MERCHANT_CARGO" && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <h3 className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-700" />
                  <span>Merchant Cargo / Goods Specifications (سامان کی تفصیل)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Cargo Description / سامان کی نوعیت *
                    </label>
                    <input
                      type="text"
                      required={serviceMode === "MERCHANT_CARGO"}
                      placeholder="e.g. 20 Bags of Fertilizer, 10 Rolls of Cloth"
                      value={cargoDescription}
                      onChange={(e) => setCargoDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Estimated Weight (kg) / تخمینہ وزن
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 450"
                      value={estimatedWeightKg}
                      onChange={(e) => setEstimatedWeightKg(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Estimated Fare & Dispatch Button */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">
                  Estimated Transparent Fare (تخمینہ کرایہ)
                </span>
                <span className="text-2xl font-black text-emerald-400">
                  {formatPKR(estimatedFare)}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  • Direct cash payment to driver upon destination
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? "Dispatching..."
                    : selectedDriverId
                    ? "Book Selected Driver"
                    : "⚡ Instant Broadcast to Nearest Drivers"}
                </span>
              </button>
            </div>
          </form>

          {/* Booking Confirmation Dialog */}
          {bookingSuccess && (
            <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-500 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-black text-base text-emerald-950">
                    Booking Successfully Placed! (آرڈر درج ہو چکا ہے)
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Booking #{bookingSuccess.bookingNumber} • Estimated Fare: {formatPKR(bookingSuccess.fareAmount)}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Your 4-Digit Security PIN
                  </span>
                  <span className="font-mono font-black text-xl text-emerald-700">
                    {bookingSuccess.completionPin}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Provide this PIN to the driver when your ride/cargo arrives.
                  </p>
                </div>

                <Link
                  href="/rides/my-rides"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm"
                >
                  Track Live Trip →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Verified Driver Directory */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Available Drivers in {activeCity.name} ({filteredDrivers.length})</span>
            </h2>
          </div>

          {filteredDrivers.length === 0 ? (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
              <Truck className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs text-slate-500 font-bold">
                No verified drivers online for {selectedCategory} right now.
              </p>
              <p className="text-[11px] text-slate-400">
                You can still place an open broadcast booking!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredDrivers.map((driver) => {
                const isSelected = selectedDriverId === driver.id;
                return (
                  <div
                    key={driver.id}
                    className={`p-4 rounded-3xl border-2 transition-all space-y-3 ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/60 shadow-md"
                        : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-sm text-slate-900">
                            {driver.user.fullName}
                          </h3>
                          {driver.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-slate-500 font-mono">
                          {driver.vehicleMakeModel || driver.vehicleType} • {driver.vehicleNumber}
                        </p>

                        <div className="flex items-center gap-2 pt-1 text-[11px]">
                          <span className="font-bold text-amber-700 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{driver.ratingAverage || "5.0"}</span>
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">
                            {driver.ridesCompleted + driver.cargoTripsCompleted} Trips
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          driver.isAvailable
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {driver.isAvailable ? "ONLINE" : "OFFLINE"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <a
                        href={`tel:${driver.user.phoneNumber}`}
                        className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>

                      <a
                        href={`https://wa.me/${driver.user.phoneNumber.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold transition-colors"
                        title="WhatsApp Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDriverId(isSelected ? null : driver.id)
                        }
                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                        }`}
                      >
                        {isSelected ? "Selected ✓" : "Select Driver"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
