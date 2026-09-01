"use client";

import React from "react";
import Link from "next/link";
import {
  Car,
  Truck,
  Bike,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Package,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface RiderProfileClientProps {
  driver: any;
}

export default function RiderProfileClient({ driver }: RiderProfileClientProps) {
  const serviceTypes: string[] = JSON.parse(driver.serviceTypes || "[]");

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
              {driver.vehicleCategory === "LOADER_RICKSHAW" || driver.vehicleCategory === "PICKUP_TRUCK" ? (
                <Truck className="w-10 h-10 text-emerald-400" />
              ) : driver.vehicleCategory === "CAR_TAXI" ? (
                <Car className="w-10 h-10 text-emerald-400" />
              ) : (
                <Bike className="w-10 h-10 text-emerald-400" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {driver.vehicleCategory.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-slate-500">• {driver.city.name}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
                <span>{driver.user.fullName}</span>
                {driver.isVerified && (
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                )}
              </h1>

              <p className="text-xs text-slate-500 font-urdu">
                گاڑی: {driver.vehicleMakeModel || driver.vehicleType} ({driver.vehicleNumber})
              </p>
            </div>
          </div>

          {/* Direct Contact Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={`tel:${driver.user.phoneNumber}`}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call: {driver.user.phoneNumber}</span>
            </a>

            <a
              href={`https://wa.me/${driver.user.phoneNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 transition-colors"
              title="Chat on WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
            </a>

            <Link
              href={`/rides?driverId=${driver.id}`}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Book Ride Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Reputation & Stats Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Driver Rating
            </span>
            <div className="flex items-center gap-1 text-xl font-black text-amber-600">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>{driver.ratingAverage || "5.0"}</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {driver.reviewCount} Reviews
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Passenger Rides
            </span>
            <p className="text-xl font-black text-slate-900">
              {driver.ridesCompleted} Trips
            </p>
            <span className="text-[10px] text-slate-400">Completed</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Cargo Logistics
            </span>
            <p className="text-xl font-black text-emerald-800">
              {driver.cargoTripsCompleted} Loads
            </p>
            <span className="text-[10px] text-slate-400">For Merchants & Farmers</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Transparent Pricing
            </span>
            <p className="text-sm font-black text-slate-900">
              {formatPKR(driver.baseFare)} Base
            </p>
            <span className="text-[10px] text-slate-500">
              + {formatPKR(driver.perKmRate)}/km
            </span>
          </div>
        </div>

        {/* Verification & Services Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <h3 className="font-extrabold text-emerald-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Identity & Safety Badges</span>
            </h3>
            <ul className="space-y-1 text-emerald-900 font-medium">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>CNIC Verified by City Administration</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Driving License Active: {driver.licenseNumber || "Verified"}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Vehicle Plate: {driver.vehicleNumber}</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-700" />
              <span>Supported Services & Cargo Capacity</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {serviceTypes.map((type) => (
                <span
                  key={type}
                  className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 font-bold text-[11px] text-slate-700"
                >
                  {type.replace(/_/g, " ")}
                </span>
              ))}
              {driver.cargoCapacityKg && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 font-bold text-[11px] text-amber-900">
                  Max Payload: {driver.cargoCapacityKg} kg
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Feedback */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span>Verified Customer Reviews ({driver.rideReviews.length})</span>
        </h2>

        {driver.rideReviews.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No customer reviews yet. Be the first to review this driver after your ride!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {driver.rideReviews.map((rev: any) => (
              <div key={rev.id} className="py-4 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">
                    {rev.customer.fullName}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "{rev.comment}"
                  </p>
                )}

                <span className="text-[10px] text-slate-400 block font-mono">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
