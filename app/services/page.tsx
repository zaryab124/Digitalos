import React from "react";
import NextLink from "next/link";
import {
  Wrench,
  Zap,
  Snowflake,
  Droplet,
  Hammer,
  ShieldCheck,
  Clock,
  CheckCircle2,
  PlusCircle,
  Search,
  Sparkles,
  Award,
} from "lucide-react";
import { getSelectedCity } from "@/lib/city";
import { prisma } from "@/lib/prisma";
import ProviderCard from "@/components/ProviderCard";

export const dynamic = "force-dynamic";

export default async function ServicesMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category: categorySlug, q } = await searchParams;
  const activeCity = await getSelectedCity();

  // Fetch standard services
  const services = await prisma.service.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  // Fetch verified approved providers in the active city
  const where: any = {
    cityId: activeCity.id,
    status: "APPROVED",
  };

  if (categorySlug) {
    where.categorySlug = categorySlug;
  }

  if (q && q.trim() !== "") {
    const term = q.trim();
    where.OR = [
      { primarySkill: { contains: term } },
      { primarySkillUr: { contains: term } },
      { user: { fullName: { contains: term } } },
      { secondarySkills: { contains: term } },
    ];
  }

  const providers = await prisma.serviceProvider.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          fullNameUr: true,
          phoneNumber: true,
          avatarUrl: true,
        },
      },
      city: true,
    },
    orderBy: [
      { isAvailable: "desc" },
      { ratingAverage: "desc" },
      { jobsCompleted: "desc" },
    ],
  });

  const categoryPills = [
    { slug: "all", label: "All Artisans", labelUr: "تمام ہنرمند", icon: Wrench },
    { slug: "electronics", label: "Electrician & Solar", labelUr: "الیکٹریشن و سولر", icon: Zap },
    { slug: "hardware", label: "Plumber & Sanitary", labelUr: "پلمبر و سینیٹری", icon: Droplet },
    { slug: "automotive", label: "Auto & Mechanics", labelUr: "آٹو مکینک", icon: Hammer },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner with Request CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-12 shadow-xl border border-amber-900/30">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Local Services & Verified Artisans • {activeCity.name}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Verified Home Repairs & <span className="text-amber-400">Skilled Technicians</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-urdu leading-relaxed">
            جام پور کے تصدیق شدہ الیکٹریشن، اے سی ٹیکنیشن، پلمبر اور مستری ایک کلک پر۔ مسائل درج کریں اور بہترین قیمت پر کام کروائیں۔
          </p>

          {/* Direct CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <NextLink
              href="/services/request"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 transition-transform hover:scale-105"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Post a Repair Request (درخواست درج کریں)</span>
            </NextLink>

            <NextLink
              href="/provider/register"
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition-colors"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Join as a Service Provider</span>
            </NextLink>
          </div>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute right-6 -bottom-10 opacity-10 pointer-events-none hidden md:block">
          <Wrench className="w-72 h-72 text-white" />
        </div>
      </section>

      {/* How It Works (4-Step Flow) */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900">
            How Services Marketplace Works
          </h2>
          <p className="text-xs text-slate-500 font-urdu">
            آسان 4 مراحل میں کام کروائیں — شفافیت اور تسلی بخش سروس
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900">1. Describe Problem</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-urdu">
              مسئلہ بیان کریں، جگہ منتخب کریں اور تصویر اپ لوڈ کریں۔
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900">2. Receive Instant Quotes</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-urdu">
              جام پور کے قریبی تصدیق شدہ ٹیکنیشنز کی جانب سے قیمت کی پیشکش موصول کریں۔
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900">3. Select Best Quote</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-urdu">
              ریٹنگ، تجربہ اور مناسب قیمت دیکھ کر ٹیکنیشن منتخب کریں۔
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center">
              4
            </div>
            <h3 className="font-bold text-sm text-slate-900">4. Complete & Review</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-urdu">
              کام مکمل ہونے کے بعد ریٹنگ اور ریویو دیں تاکہ کمیونٹی کو فائدہ ہو۔
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Verified Artisans in {activeCity.name} ({providers.length})
            </h2>
            <p className="text-xs text-slate-500 font-urdu">
              شہر کے مستند کاریگر اور مکینک
            </p>
          </div>

          <NextLink
            href="/services/request"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            + Need Custom Repair?
          </NextLink>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categoryPills.map((pill) => {
            const Icon = pill.icon;
            const isSelected =
              (!categorySlug && pill.slug === "all") || categorySlug === pill.slug;

            return (
              <NextLink
                key={pill.slug}
                href={pill.slug === "all" ? "/services" : `/services?category=${pill.slug}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-amber-400" />
                <span>{pill.label}</span>
                <span className="font-urdu opacity-75 hidden sm:inline">({pill.labelUr})</span>
              </NextLink>
            );
          })}
        </div>

        {/* Providers Grid */}
        {providers.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">
              No service providers found in this category yet.
            </h3>
            <p className="text-xs text-slate-500">
              You can still submit a custom service request and we will notify available technicians!
            </p>
            <NextLink
              href="/services/request"
              className="inline-block px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
            >
              Post Service Request
            </NextLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map((p) => (
              <ProviderCard
                key={p.id}
                provider={{
                  id: p.id,
                  userId: p.userId,
                  fullName: p.user.fullName,
                  fullNameUr: p.user.fullNameUr,
                  phoneNumber: p.user.phoneNumber,
                  avatarUrl: p.user.avatarUrl,
                  primarySkill: p.primarySkill,
                  primarySkillUr: p.primarySkillUr,
                  secondarySkills: JSON.parse(p.secondarySkills || "[]"),
                  experienceYears: p.experienceYears,
                  baseVisitFee: p.baseVisitFee,
                  serviceAreas: JSON.parse(p.serviceAreas || "[]"),
                  isVerified: p.isVerified,
                  isAvailable: p.isAvailable,
                  ratingAverage: p.ratingAverage,
                  reviewCount: p.reviewCount,
                  jobsCompleted: p.jobsCompleted,
                  city: p.city.name,
                  categorySlug: p.categorySlug,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
