"use client";

import React from "react";
import NextLink from "next/link";
import {
  GraduationCap,
  Briefcase,
  BookOpen,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Phone,
  Tag,
  Clock,
  Layers,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface StudentDashboardClientProps {
  activeCity: { id: string; name: string; slug: string };
  user: any;
  opportunities: any[];
  listings: any[];
  groups: any[];
  studentProfile: any;
}

export default function StudentDashboardClient({
  activeCity,
  user,
  opportunities,
  listings,
  groups,
  studentProfile,
}: StudentDashboardClientProps) {
  return (
    <div className="space-y-6">
      {/* Quick Nav Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NextLink
          href="/students/opportunities"
          className="p-4 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-md shadow-blue-600/20 hover:scale-[1.02] transition-transform space-y-2"
        >
          <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm">Opportunities & Jobs</h3>
            <p className="text-[11px] text-blue-100 font-urdu">وظائف اور ملازمتیں</p>
          </div>
        </NextLink>

        <NextLink
          href="/students/marketplace"
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:scale-[1.02] transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Student Bazaar</h3>
            <p className="text-[11px] text-slate-500 font-urdu">پرانی کتب اور نوٹس</p>
          </div>
        </NextLink>

        <NextLink
          href="/students/community"
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:scale-[1.02] transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Study Circles</h3>
            <p className="text-[11px] text-slate-500 font-urdu">ایم ڈی کیٹ اور اسٹڈی گروپس</p>
          </div>
        </NextLink>

        <NextLink
          href="/students/profile"
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:scale-[1.02] transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Digital Resume</h3>
            <p className="text-[11px] text-slate-500 font-urdu">طالب علم پروفائل</p>
          </div>
        </NextLink>
      </div>

      {/* Main Grid: Verified Opportunities & Marketplace Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Verified Opportunities (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span>Featured Scholarships, Jobs & Training</span>
              </h2>
              <p className="text-xs text-slate-500 font-urdu">
                سرکاری اور تصدیق شدہ تعلیمی وظائف اور مقامی جابز
              </p>
            </div>

            <NextLink
              href="/students/opportunities"
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>View All ({opportunities.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NextLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2 hover:border-blue-200 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        opp.type === "SCHOLARSHIP"
                          ? "bg-amber-100 text-amber-800"
                          : opp.type === "JOB"
                          ? "bg-emerald-100 text-emerald-800"
                          : opp.type === "TRAINING"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {opp.type}
                    </span>

                    {opp.isVerified && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1">
                    {opp.title}
                  </h4>
                  {opp.titleUr && (
                    <p className="text-xs text-blue-900 font-urdu line-clamp-1">
                      {opp.titleUr}
                    </p>
                  )}

                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {opp.organizationName} • {opp.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-800 font-bold">
                    {opp.stipendOrSalary || "Free"}
                  </span>
                  {opp.applicationDeadline && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(opp.applicationDeadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Study Circles & Groups (1 Col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Active Study Circles</span>
                </h3>
                <p className="text-xs text-slate-500 font-urdu">
                  مشترکہ تعلیم اور تیاری گروپ
                </p>
              </div>

              <NextLink
                href="/students/community"
                className="text-xs font-bold text-purple-700 hover:underline"
              >
                Join →
              </NextLink>
            </div>

            <div className="space-y-2.5">
              {groups.map((grp) => (
                <div
                  key={grp.id}
                  className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-slate-900">{grp.name}</h5>
                    <span className="px-2 py-0.5 rounded-full bg-white text-purple-800 text-[10px] font-bold">
                      {grp.memberCount} Members
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{grp.description}</p>
                  <div className="text-[10px] text-purple-900 font-semibold flex items-center gap-1 pt-1">
                    <Calendar className="w-3 h-3 text-purple-600" />
                    <span>{grp.meetingSchedule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <NextLink
            href="/students/organizations"
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Colleges & Universities Directory</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </NextLink>
        </div>
      </div>

      {/* Student Peer-to-Peer Marketplace Highlights */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Student Marketplace (Used Books, Calculators & Notes)</span>
            </h3>
            <p className="text-xs text-slate-500 font-urdu">
              طالب علموں کے درمیان سستی کتب اور تعلیمی آلات کی خرید و فروخت
            </p>
          </div>

          <NextLink
            href="/students/marketplace"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>Open Bazaar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NextLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {listings.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2 flex flex-col justify-between hover:border-emerald-200 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="uppercase">{item.category}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {item.condition}
                  </span>
                </div>

                <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2">
                  {item.title}
                </h4>

                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/50 flex items-baseline justify-between">
                <span className="font-black text-sm text-emerald-800">
                  {formatPKR(item.price)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {item.student?.user?.fullName || "Student"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
