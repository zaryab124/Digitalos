"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import {
  Store,
  Wrench,
  Phone,
  MessageSquare,
  Star,
  ShieldCheck,
  Search,
  MapPin,
  Filter,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface FarmerDirectoryClientProps {
  activeCity: { id: string; name: string; slug: string };
  businesses: any[];
  providers: any[];
}

export default function FarmerDirectoryClient({
  activeCity,
  businesses,
  providers,
}: FarmerDirectoryClientProps) {
  const [activeTab, setActiveTab] = useState<"DEALERS" | "EXPERTS">("DEALERS");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.nameUr && b.nameUr.includes(searchQuery))
  );

  const filteredProviders = providers.filter((p) =>
    p.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.primarySkill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search & Tabs */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dealers, seeds, khad or veterinary specialists..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("DEALERS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === "DEALERS"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Khad & Seed Stores ({filteredBusinesses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("EXPERTS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === "EXPERTS"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Veterinary & Tubewell Artisans ({filteredProviders.length})</span>
          </button>
        </div>
      </div>

      {/* Dealers Tab */}
      {activeTab === "DEALERS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBusinesses.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-600">No agricultural dealers found.</p>
              <p className="text-[11px] text-slate-400">Try adjusting your search terms.</p>
            </div>
          ) : (
            filteredBusinesses.map((biz) => (
              <div
                key={biz.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-emerald-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{biz.name}</h4>
                      {biz.nameUr && (
                        <p className="text-xs text-emerald-800 font-urdu">{biz.nameUr}</p>
                      )}
                    </div>
                    {biz.isVerified && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold shrink-0 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {biz.description || `Agricultural supplies & equipment in ${activeCity.name}.`}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{biz.locations[0]?.addressLine || activeCity.name}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {biz.phone && (
                    <a
                      href={`tel:${biz.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  )}

                  <NextLink
                    href={`/business/${biz.id}`}
                    className="flex-1 text-center px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                  >
                    View Storefront →
                  </NextLink>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Experts Tab */}
      {activeTab === "EXPERTS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-600">No agricultural specialists found.</p>
            </div>
          ) : (
            filteredProviders.map((prov) => (
              <div
                key={prov.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-emerald-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {prov.user.fullName}
                      </h4>
                      <span className="text-xs text-emerald-800 font-bold block">
                        {prov.primarySkill}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{prov.ratingAverage.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    {prov.experienceYears} Years Field Experience • {prov.jobsCompleted} Cases Handled
                  </p>

                  <div className="text-xs font-semibold text-slate-700">
                    Base Inspection Fee: <strong>{formatPKR(prov.baseVisitFee)}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${prov.user.phoneNumber}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>

                  <NextLink
                    href={`/provider/${prov.id}`}
                    className="flex-1 text-center px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                  >
                    Request Visit →
                  </NextLink>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
