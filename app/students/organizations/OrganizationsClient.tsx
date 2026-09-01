"use client";

import React, { useState } from "react";
import {
  Building2,
  Phone,
  Globe,
  MapPin,
  ShieldCheck,
  Search,
  BookOpen,
} from "lucide-react";

interface OrganizationsClientProps {
  activeCity: { id: string; name: string; slug: string };
  initialOrganizations: any[];
}

export default function OrganizationsClient({
  activeCity,
  initialOrganizations,
}: OrganizationsClientProps) {
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = initialOrganizations.filter((org) => {
    const matchesType = selectedType === "ALL" || org.type === selectedType;
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.nameUr && org.nameUr.includes(searchQuery)) ||
      org.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
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
            placeholder="Search colleges, universities, TEVTA institutes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "COLLEGE", "UNIVERSITY", "VOCATIONAL_INSTITUTE"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                selectedType === type
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((org) => (
          <div
            key={org.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-blue-300 transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-extrabold uppercase">
                  {org.type.replace("_", " ")}
                </span>

                {org.isVerified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> HEC / BISE Verified
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                {org.name}
              </h3>
              {org.nameUr && (
                <p className="text-xs text-blue-900 font-urdu">{org.nameUr}</p>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                {org.description || "Leading educational institution in South Punjab."}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{org.address} ({org.city?.name || activeCity.name})</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {org.phone && (
                <a
                  href={`tel:${org.phone}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              )}

              {org.website && (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Official Portal</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
