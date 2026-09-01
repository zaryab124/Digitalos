"use client";

import React from "react";
import NextLink from "next/link";
import {
  BadgeCheck,
  Star,
  Phone,
  Clock,
  MapPin,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatPKR, formatPhoneNumber } from "@/lib/utils";

interface ProviderCardProps {
  provider: {
    id: string;
    userId: string;
    fullName: string;
    fullNameUr?: string | null;
    phoneNumber: string;
    avatarUrl?: string | null;
    primarySkill: string;
    primarySkillUr?: string | null;
    secondarySkills: string[];
    experienceYears: number;
    baseVisitFee: number;
    serviceAreas: string[];
    isVerified: boolean;
    isAvailable: boolean;
    ratingAverage: number;
    reviewCount: number;
    jobsCompleted: number;
    city: string;
    categorySlug: string;
  };
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      {/* Top Details */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 font-black text-base flex items-center justify-center shadow-inner">
              {provider.fullName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  {provider.fullName}
                </h3>
                {provider.isVerified && (
                  <BadgeCheck className="w-4 h-4 fill-emerald-600 text-white shrink-0" />
                )}
              </div>

              {provider.fullNameUr && (
                <p className="text-xs text-emerald-800 font-urdu">{provider.fullNameUr}</p>
              )}

              <p className="text-xs font-bold text-amber-800 flex items-center gap-1 mt-0.5">
                <Wrench className="w-3 h-3" />
                <span>{provider.primarySkill}</span>
              </p>
            </div>
          </div>

          {/* Live Availability Badge */}
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0 ${
              provider.isAvailable
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                provider.isAvailable ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            <span>{provider.isAvailable ? "Available" : "Busy"}</span>
          </span>
        </div>

        {/* Experience & Areas */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium">
            {provider.experienceYears} yrs experience
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{provider.serviceAreas[0] || provider.city}</span>
          </span>
        </div>

        {/* Secondary Skills Chips */}
        {provider.secondarySkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {provider.secondarySkills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/60 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Metrics & Action Buttons */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 font-bold text-amber-600">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{provider.ratingAverage.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({provider.reviewCount} reviews)</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Inspection / Visit Fee</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {formatPKR(provider.baseVisitFee)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={`tel:${provider.phoneNumber}`}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Call</span>
          </a>

          <NextLink
            href={`/services/request?category=${provider.categorySlug}&technicianId=${provider.id}`}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-transform active:scale-95 text-center"
          >
            <span>Request Quote</span>
          </NextLink>
        </div>
      </div>
    </div>
  );
}
