"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Building2,
  Users,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  X,
  Layers,
  Globe,
  Store,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface AdminCitiesClientProps {
  initialCities: any[];
}

export default function AdminCitiesClient({
  initialCities,
}: AdminCitiesClientProps) {
  const router = useRouter();
  const [cities, setCities] = useState<any[]>(initialCities);

  // Add City Modal state
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameUr, setNameUr] = useState("");
  const [slug, setSlug] = useState("");
  const [division, setDivision] = useState("D.G. Khan Division");
  const [district, setDistrict] = useState("Rajanpur District");
  const [tehsil, setTehsil] = useState("");
  const [latitude, setLatitude] = useState("29.6433");
  const [longitude, setLongitude] = useState("70.5950");
  const [radiusKm, setRadiusKm] = useState("15.0");
  const [isSavingCity, setIsSavingCity] = useState(false);

  // Manage Areas Modal state
  const [selectedCityForAreas, setSelectedCityForAreas] = useState<any | null>(null);
  const [areaName, setAreaName] = useState("");
  const [areaNameUr, setAreaNameUr] = useState("");
  const [areaPostalCode, setAreaPostalCode] = useState("");
  const [isSavingArea, setIsSavingArea] = useState(false);

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCity(true);

    try {
      const res = await fetch("/api/v1/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nameUr: nameUr || undefined,
          slug,
          division,
          district,
          tehsil: tehsil || name,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radiusKm: parseFloat(radiusKm),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCities((prev) => [...prev, { ...data.data.city, areas: [], _count: { businesses: 0, serviceProviders: 0, orders: 0, farmerProfiles: 0, opportunities: 0 } }]);
        setIsAddCityOpen(false);
        setName("");
        setSlug("");
        router.refresh();
        alert(`City ${data.data.city.name} added successfully!`);
      } else {
        alert(data.error?.message || "Failed to add city.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setIsSavingCity(false);
    }
  };

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityForAreas || !areaName) return;

    setIsSavingArea(true);
    try {
      const res = await fetch(`/api/v1/cities/${selectedCityForAreas.slug}/areas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: areaName,
          nameUr: areaNameUr || undefined,
          postalCode: areaPostalCode || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const newArea = data.data.area;
        setSelectedCityForAreas((prev: any) => ({
          ...prev,
          areas: [...prev.areas, newArea],
        }));
        setCities((prev) =>
          prev.map((c) =>
            c.id === selectedCityForAreas.id
              ? { ...c, areas: [...c.areas, newArea] }
              : c
          )
        );
        setAreaName("");
        setAreaNameUr("");
        setAreaPostalCode("");
        router.refresh();
      } else {
        alert(data.error?.message || "Failed to add area.");
      }
    } catch {
      alert("Error adding area.");
    } finally {
      setIsSavingArea(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Geographic Hierarchy Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Globe className="w-4 h-4" />
            <span>Pakistan • Punjab Province • South Punjab Municipalities</span>
          </div>
          <h2 className="text-lg font-black">
            Geographic Multi-City Tenancy Model
          </h2>
          <p className="text-xs text-slate-300">
            Country (Pakistan) → Province (Punjab) → Division (D.G. Khan) → District → City → Area
          </p>
        </div>

        <button
          onClick={() => setIsAddCityOpen(true)}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New City</span>
        </button>
      </div>

      {/* Cities Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900">
            Active Tenant Cities ({cities.length})
          </h3>
          <span className="text-xs font-bold text-slate-400">
            Zero Code Rewrites Required for New Cities
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-6">City Name</th>
                <th className="py-3.5 px-4">District / Division</th>
                <th className="py-3.5 px-4">Configured Areas</th>
                <th className="py-3.5 px-4">Active Merchants</th>
                <th className="py-3.5 px-4">Orders</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
              {cities.map((city) => (
                <tr key={city.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-extrabold text-sm text-slate-900">{city.name}</div>
                    {city.nameUr && (
                      <div className="text-xs text-slate-500 font-urdu">{city.nameUr}</div>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">/{city.slug}</span>
                  </td>

                  <td className="py-4 px-4 text-slate-600">
                    <span className="font-bold text-slate-900 block">{city.district}</span>
                    <span className="text-[11px] text-slate-400">{city.division}</span>
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full font-bold text-[11px]">
                      {city.areas.length} Areas Configured
                    </span>
                  </td>

                  <td className="py-4 px-4 font-bold text-emerald-800">
                    {city._count.businesses} Shops
                  </td>

                  <td className="py-4 px-4 font-bold text-slate-900">
                    {city._count.orders} Orders
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => setSelectedCityForAreas(city)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
                    >
                      Manage Areas ({city.areas.length}) →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add City Modal */}
      {isAddCityOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Provision New Municipal City (سٹی اندراج)
              </h3>
              <button onClick={() => setIsAddCityOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCity} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }}
                    placeholder="e.g. Taunsa"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">City Name (Urdu)</label>
                  <input
                    type="text"
                    value={nameUr}
                    onChange={(e) => setNameUr(e.target.value)}
                    placeholder="e.g. تونسہ شریف"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-urdu"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slug (URL identifier) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. taunsa"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Division</label>
                  <input
                    type="text"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Taunsa District"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tehsil</label>
                  <input
                    type="text"
                    value={tehsil}
                    onChange={(e) => setTehsil(e.target.value)}
                    placeholder="e.g. Taunsa"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCityOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCity}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold disabled:opacity-50"
                >
                  {isSavingCity ? "Saving..." : "Add City"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Areas Modal */}
      {selectedCityForAreas && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Manage Areas: {selectedCityForAreas.name}
                </h3>
                <p className="text-xs text-slate-500 font-urdu">{selectedCityForAreas.nameUr}</p>
              </div>
              <button
                onClick={() => setSelectedCityForAreas(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Area Form */}
            <form onSubmit={handleAddArea} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <span className="font-bold text-slate-900 block">Add Local Neighborhood / Bazaar:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="Area Name (e.g. Model Town)"
                  className="px-3 py-2 rounded-xl border border-slate-300"
                />
                <input
                  type="text"
                  value={areaNameUr}
                  onChange={(e) => setAreaNameUr(e.target.value)}
                  placeholder="نام اردو میں"
                  className="px-3 py-2 rounded-xl border border-slate-300 font-urdu"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={areaPostalCode}
                  onChange={(e) => setAreaPostalCode(e.target.value)}
                  placeholder="Postal Code (e.g. 33000)"
                  className="px-3 py-2 rounded-xl border border-slate-300 w-36"
                />

                <button
                  type="submit"
                  disabled={isSavingArea || !areaName.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSavingArea ? "Adding..." : "Add Area"}
                </button>
              </div>
            </form>

            {/* Existing Areas List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Configured Areas ({selectedCityForAreas.areas.length}):
              </span>
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {selectedCityForAreas.areas.map((a: any) => (
                  <div key={a.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{a.name}</span>
                      {a.nameUr && (
                        <span className="text-slate-500 font-urdu ml-2">({a.nameUr})</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{a.postalCode || "N/A"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
