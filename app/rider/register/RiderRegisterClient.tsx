"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  Car,
  Truck,
  Bike,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BadgeCheck,
  ShieldCheck,
  Phone,
  Lock,
  User,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface RiderRegisterClientProps {
  user: { id: string; fullName: string; phoneNumber: string } | null;
  activeCity: { id: string; name: string };
  cities: Array<{ id: string; name: string; nameUr: string | null }>;
  areas: Array<{ id: string; name: string; nameUr: string | null }>;
}

export default function RiderRegisterClient({
  user,
  activeCity,
  cities,
  areas,
}: RiderRegisterClientProps) {
  const router = useRouter();

  const [cityId, setCityId] = useState(activeCity.id);
  const [vehicleCategory, setVehicleCategory] = useState<
    "BIKE" | "AUTO_RICKSHAW" | "LOADER_RICKSHAW" | "CAR_TAXI" | "PICKUP_TRUCK"
  >("AUTO_RICKSHAW");

  // Account details if not logged in
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [password, setPassword] = useState("");

  // Vehicle & Verification details
  const [vehicleMakeModel, setVehicleMakeModel] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [cnicNumber, setCnicNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [baseLocation, setBaseLocation] = useState("Sabzi Mandi & Fruits Market");
  const [services, setServices] = useState<string[]>(["PASSENGER_RIDE"]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggleService = (srv: string) => {
    if (services.includes(srv)) {
      if (services.length > 1) {
        setServices(services.filter((s) => s !== srv));
      }
    } else {
      setServices([...services, srv]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload: any = {
        cityId,
        vehicleCategory,
        vehicleType:
          vehicleCategory === "LOADER_RICKSHAW"
            ? "LOADER"
            : vehicleCategory === "AUTO_RICKSHAW"
            ? "RICKSHAW"
            : vehicleCategory === "CAR_TAXI"
            ? "CAR"
            : vehicleCategory === "PICKUP_TRUCK"
            ? "TRUCK"
            : "MOTORCYCLE",
        vehicleMakeModel,
        vehicleNumber,
        cnicNumber,
        licenseNumber,
        serviceTypes: services,
        baseLocation,
      };

      if (!user) {
        payload.fullName = fullName;
        payload.phoneNumber = phoneNumber;
        payload.password = password;
      }

      const res = await fetch("/api/v1/riders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || "Failed to submit driver application.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Application approved! Welcome to the Jampur Fleet.");
      setTimeout(() => {
        router.push("/rider/dashboard");
        router.refresh();
      }, 1000);
    } catch {
      setErrorMessage("Network error. Please check connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-8"
    >
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SECTION 1: DRIVER ACCOUNT DETAILS (If Not Logged In) */}
      {!user && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>1. Driver Account Information (ذاتی معلومات)</span>
            </h2>
            <NextLink href="/rider/login" className="text-xs text-emerald-700 font-bold hover:underline">
              Already registered? Login &rarr;
            </NextLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Full Name (پورا نام) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ghulam Rasool"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Mobile Number (موبائل نمبر) *
              </label>
              <input
                type="text"
                required
                placeholder="03001234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Create Password (پاس ورڈ) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: VEHICLE CATEGORY SELECTION */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="space-y-1">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-600" />
            <span>2. Select Your Vehicle Type (گاڑی کی قسم منتخب کریں)</span>
          </h2>
          <p className="text-xs text-slate-500 font-urdu">
            جس گاڑی سے آپ سواری یا سامان منتقل کرنا چاہتے ہیں
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Rickshaw */}
          <button
            type="button"
            onClick={() => {
              setVehicleCategory("AUTO_RICKSHAW");
              if (!services.includes("PASSENGER_RIDE")) setServices(["PASSENGER_RIDE"]);
            }}
            className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
              vehicleCategory === "AUTO_RICKSHAW"
                ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🛺</span>
              {vehicleCategory === "AUTO_RICKSHAW" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="font-extrabold text-xs text-slate-900">Auto Rickshaw / Qingqi</div>
              <div className="text-[11px] text-slate-500 font-urdu">چنگچی و آٹو رکشہ (سواری)</div>
            </div>
          </button>

          {/* Cargo Loader */}
          <button
            type="button"
            onClick={() => {
              setVehicleCategory("LOADER_RICKSHAW");
              setServices(["MERCHANT_CARGO"]);
            }}
            className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
              vehicleCategory === "LOADER_RICKSHAW"
                ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🚚</span>
              {vehicleCategory === "LOADER_RICKSHAW" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="font-extrabold text-xs text-slate-900">Cargo Loader (مال بردار)</div>
              <div className="text-[11px] text-slate-500 font-urdu">لوڈر رکشہ برائے دکان و منڈی سامان</div>
            </div>
          </button>

          {/* Bike */}
          <button
            type="button"
            onClick={() => {
              setVehicleCategory("BIKE");
              if (!services.includes("PASSENGER_RIDE")) setServices(["PASSENGER_RIDE"]);
            }}
            className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
              vehicleCategory === "BIKE"
                ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🏍️</span>
              {vehicleCategory === "BIKE" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="font-extrabold text-xs text-slate-900">Motorcycle (بائیک)</div>
              <div className="text-[11px] text-slate-500 font-urdu">موٹرسائیکل سواری و پارسل ترسیل</div>
            </div>
          </button>

          {/* Car / Taxi */}
          <button
            type="button"
            onClick={() => {
              setVehicleCategory("CAR_TAXI");
              setServices(["PASSENGER_RIDE"]);
            }}
            className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
              vehicleCategory === "CAR_TAXI"
                ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🚗</span>
              {vehicleCategory === "CAR_TAXI" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="font-extrabold text-xs text-slate-900">Car / AC Taxi (کار ٹیکسی)</div>
              <div className="text-[11px] text-slate-500 font-urdu">شہری و بین الشہری آرام دہ سفر</div>
            </div>
          </button>

          {/* Pickup Truck */}
          <button
            type="button"
            onClick={() => {
              setVehicleCategory("PICKUP_TRUCK");
              setServices(["MERCHANT_CARGO"]);
            }}
            className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
              vehicleCategory === "PICKUP_TRUCK"
                ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🚛</span>
              {vehicleCategory === "PICKUP_TRUCK" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="font-extrabold text-xs text-slate-900">Pickup Truck (شاہ زور / پک اپ)</div>
              <div className="text-[11px] text-slate-500 font-urdu">بھاری سامان اور 1500 کلو+ لوڈ</div>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 3: BASE STATION & SERVICES OFFERED */}
      <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>3. Main Stand & Service Types (مین اڈا / اسٹاپ)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Primary City & Operating Stand *
            </label>
            <select
              value={baseLocation}
              onChange={(e) => setBaseLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
            >
              <option value="Sabzi Mandi & Fruits Market">🥦 Sabzi Mandi & Fruits Market (سبزی منڈی اڈا)</option>
              <option value="Ghalla Mandi (Grain Market)">🌾 Ghalla Mandi Stop (غلہ منڈی اڈا)</option>
              <option value="Bypass Chowk">🛣️ Bypass Chowk (بائی پاس چوک)</option>
              <option value="Indus Highway">🚗 Indus Highway Stand (انڈس ہائی وے)</option>
              <option value="Main Bazaar">🏪 Main Bazaar (مین بازار)</option>
              <option value="THQ Hospital Road">🏥 THQ Hospital Road (ہسپتال روڈ)</option>
              <option value="College Road">🎓 College Road (کالج روڈ)</option>
            </select>
            <span className="text-[10px] text-emerald-700 font-urdu mt-1 block">
              سبزی منڈی اور غلہ منڈی اسٹاپ سے زیادہ سواریاں اور لوڈر آرڈرز ملتے ہیں
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Services You Will Provide *
            </label>
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={services.includes("PASSENGER_RIDE")}
                  onChange={() => toggleService("PASSENGER_RIDE")}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Passenger Rides (مسافر سواریاں)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={services.includes("MERCHANT_CARGO")}
                  onChange={() => toggleService("MERCHANT_CARGO")}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Merchant Cargo Logistics (دکانداروں کا مال و سامان)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={services.includes("PARCEL_DELIVERY")}
                  onChange={() => toggleService("PARCEL_DELIVERY")}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Store Parcel Delivery (میڈیکل و کریانہ پارسل ڈلیوری)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: VEHICLE & CNIC VERIFICATION */}
      <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>4. Vehicle Plate & CNIC Verification (تصدیقی دستاویزات)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Vehicle Model & Brand (گاڑی کا ماڈل) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sazgar 9-Seater or New Asia 200cc Loader"
              value={vehicleMakeModel}
              onChange={(e) => setVehicleMakeModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Vehicle Registration Number (نمبر پلیٹ) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. JMP-5544 or RJP-1234"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              CNIC Number (قومی شناختی کارڈ نمبر) *
            </label>
            <input
              type="text"
              required
              placeholder="32402-1234567-1"
              value={cnicNumber}
              onChange={(e) => setCnicNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Driving License Number (ڈرائیونگ لائسنس — اختیاری)
            </label>
            <input
              type="text"
              placeholder="LIC-JMP-8812"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 font-urdu">
          رجسٹریشن کے فوری بعد آپ لائیو سواریاں اور لوڈر کے آرڈرز قبول کرنا شروع کر سکتے ہیں۔
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          {isLoading ? (
            <span>Registering Vehicle...</span>
          ) : (
            <>
              <span>Complete Driver Registration &rarr;</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
