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
  Phone,
  Power,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Users,
  TrendingUp,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface AdminFleetClientProps {
  initialDrivers: any[];
  cities: Array<{ id: string; name: string }>;
}

export default function AdminFleetClient({
  initialDrivers,
  cities,
}: AdminFleetClientProps) {
  const router = useRouter();
  const [drivers, setDrivers] = useState(initialDrivers);

  const [selectedCityId, setSelectedCityId] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Filtered drivers list
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchCity = selectedCityId === "ALL" || d.cityId === selectedCityId;
      const matchCat = selectedCategory === "ALL" || d.vehicleCategory === selectedCategory;
      const matchStatus = selectedStatus === "ALL" || d.status === selectedStatus;
      const matchSearch =
        searchQuery === "" ||
        d.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.user.phoneNumber.includes(searchQuery) ||
        d.cnicNumber.includes(searchQuery) ||
        d.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCity && matchCat && matchStatus && matchSearch;
    });
  }, [drivers, selectedCityId, selectedCategory, selectedStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: drivers.length,
      pending: drivers.filter((d) => d.status === "PENDING").length,
      approved: drivers.filter((d) => d.status === "APPROVED").length,
      online: drivers.filter((d) => d.status === "APPROVED" && d.isAvailable).length,
      bikes: drivers.filter((d) => d.vehicleCategory === "BIKE").length,
      rickshaws: drivers.filter((d) => d.vehicleCategory === "AUTO_RICKSHAW").length,
      loaders: drivers.filter((d) => d.vehicleCategory === "LOADER_RICKSHAW").length,
      cars: drivers.filter((d) => d.vehicleCategory === "CAR_TAXI").length,
    };
  }, [drivers]);

  const handleUpdateStatus = async (
    driverId: string,
    newStatus: "APPROVED" | "REJECTED" | "SUSPENDED"
  ) => {
    setIsUpdating(driverId);
    try {
      const res = await fetch("/api/v1/admin/fleet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId,
          status: newStatus,
          isVerified: newStatus === "APPROVED",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === driverId ? { ...d, status: newStatus, isVerified: newStatus === "APPROVED" } : d))
        );
      } else {
        alert(data.error?.message || "Failed to update driver status.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              🛡️ City Fleet & Logistics Administration
            </span>
            <Link
              href="/admin"
              className="text-xs text-slate-500 hover:text-slate-800 font-bold"
            >
              ← Back to Main Admin
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Rider & Fleet Operations Management
          </h1>
          <p className="text-xs text-slate-500 font-urdu">
            جام پور اور جنوبی پنجاب میں موٹر سائیکل، رکشہ، لوڈر اور کار ٹیکسی ڈرائیورز کی نگرانی اور منظوری
          </p>
        </div>

        <Link
          href="/rides"
          target="_blank"
          className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md"
        >
          <span>View Public Rides Hub</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Registered Fleet
          </span>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          <span className="text-[10px] text-emerald-700 font-bold">
            {stats.online} Online on Road
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200 bg-amber-50/40 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            Pending KYC Verification
          </span>
          <p className="text-2xl font-black text-amber-900">{stats.pending}</p>
          <span className="text-[10px] text-amber-700 font-bold">
            Requires Admin Review
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Merchant Cargo Loaders
          </span>
          <p className="text-2xl font-black text-emerald-800">{stats.loaders}</p>
          <span className="text-[10px] text-slate-400">Heavy Load Carriers</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Bikes, Rickshaws & Cabs
          </span>
          <p className="text-2xl font-black text-slate-900">
            {stats.bikes + stats.rickshaws + stats.cars}
          </p>
          <span className="text-[10px] text-slate-400">
            {stats.bikes} Bikes • {stats.rickshaws} Rickshaws • {stats.cars} Cabs
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Name, Phone, CNIC, Plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Vehicle Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
          >
            <option value="ALL">All Vehicle Types (سب گاڑیاں)</option>
            <option value="BIKE">Motorcycle / Bike (موٹر سائیکل)</option>
            <option value="AUTO_RICKSHAW">Auto Rickshaw (رکشہ)</option>
            <option value="LOADER_RICKSHAW">Loader Rickshaw (لوڈر رکشہ)</option>
            <option value="CAR_TAXI">Car / AC Taxi (گاڑی)</option>
            <option value="PICKUP_TRUCK">Pickup Truck (پک اپ ٹرک)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
          >
            <option value="ALL">All Statuses (سب حالات)</option>
            <option value="PENDING">Pending Approval (زیر التواء)</option>
            <option value="APPROVED">Approved & Active (منظور شدہ)</option>
            <option value="SUSPENDED">Suspended (معطل شدہ)</option>
          </select>

          {/* City Filter */}
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
          >
            <option value="ALL">All Cities (تمام شہر)</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fleet Directory List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Driver Fleet Directory ({filteredDrivers.length})</span>
          </h2>
        </div>

        {filteredDrivers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No drivers found matching current filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDrivers.map((driver) => (
              <div
                key={driver.id}
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/60 transition-colors"
              >
                {/* Driver Info */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
                    {driver.vehicleCategory === "LOADER_RICKSHAW" || driver.vehicleCategory === "PICKUP_TRUCK" ? (
                      <Truck className="w-7 h-7 text-emerald-400" />
                    ) : driver.vehicleCategory === "CAR_TAXI" ? (
                      <Car className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <Bike className="w-7 h-7 text-emerald-400" />
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {driver.user.fullName}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          driver.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : driver.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {driver.status}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 font-bold">{driver.city.name}</span>
                    </div>

                    <p className="text-slate-600 font-mono">
                      Phone: <span className="font-bold text-slate-900">{driver.user.phoneNumber}</span> • CNIC: {driver.cnicNumber}
                    </p>

                    <p className="text-slate-600">
                      Vehicle: <span className="font-bold text-slate-900">{driver.vehicleMakeModel || driver.vehicleType}</span> ({driver.vehicleNumber})
                      {driver.licenseNumber && ` • License: ${driver.licenseNumber}`}
                      {driver.cargoCapacityKg && ` • Payload: ${driver.cargoCapacityKg}kg`}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px]">
                      <span className="font-bold text-amber-700 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{driver.ratingAverage || "5.0"}</span>
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-700 font-bold">
                        {driver.ridesCompleted} Rides • {driver.cargoTripsCompleted} Cargo Loads • {driver.deliveriesCompleted} Deliveries
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-emerald-800 font-black">
                        Earned: {formatPKR(driver.totalEarnings)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                  <Link
                    href={`/rider/${driver.id}`}
                    target="_blank"
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                  >
                    Public Profile
                  </Link>

                  {driver.status !== "APPROVED" && (
                    <button
                      onClick={() => handleUpdateStatus(driver.id, "APPROVED")}
                      disabled={isUpdating === driver.id}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isUpdating === driver.id ? "Approving..." : "Approve Driver"}</span>
                    </button>
                  )}

                  {driver.status === "APPROVED" && (
                    <button
                      onClick={() => handleUpdateStatus(driver.id, "SUSPENDED")}
                      disabled={isUpdating === driver.id}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors disabled:opacity-50"
                    >
                      <span>Suspend</span>
                    </button>
                  )}

                  {driver.status === "PENDING" && (
                    <button
                      onClick={() => handleUpdateStatus(driver.id, "REJECTED")}
                      disabled={isUpdating === driver.id}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors disabled:opacity-50"
                    >
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
