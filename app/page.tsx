import React from "react";
import NextLink from "next/link";
import {
  Search,
  MapPin,
  BadgeCheck,
  Store,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Clock,
  Car,
  Truck,
  Bike,
  ShoppingBag,
  Sprout,
  Wrench,
  GraduationCap,
  Phone,
  Shield,
  Star,
  CheckCircle,
  Navigation,
  ChevronRight,
  Users,
} from "lucide-react";
import { getSelectedCity } from "@/lib/city";
import { prisma } from "@/lib/prisma";
import BusinessCard from "@/components/BusinessCard";
import CategoryGrid from "@/components/CategoryGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const city = await getSelectedCity();
  const cityId = city?.id;
  const cityName = city?.name || "Jampur";
  const cityNameUr = city?.nameUr || "جام پور";

  // Fetch real categories with business count in this city
  const categories = await prisma.businessCategory.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          businesses: {
            where: {
              status: "APPROVED",
              ...(cityId && { cityId }),
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Fetch Featured & Verified businesses in this city
  const featuredBusinesses = await prisma.business.findMany({
    where: {
      status: "APPROVED",
      ...(cityId && { cityId }),
      isFeatured: true,
    },
    include: {
      category: true,
      locations: true,
      hours: true,
      _count: {
        select: {
          products: { where: { isAvailable: true } },
          reviews: true,
        },
      },
    },
    orderBy: { ratingAverage: "desc" },
    take: 6,
  });

  // Fetch Recently Approved / Added businesses
  const recentBusinesses = await prisma.business.findMany({
    where: {
      status: "APPROVED",
      ...(cityId && { cityId }),
    },
    include: {
      category: true,
      locations: true,
      hours: true,
      _count: {
        select: {
          products: { where: { isAvailable: true } },
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const totalVerifiedShops = await prisma.business.count({
    where: {
      status: "APPROVED",
      ...(cityId && { cityId }),
    },
  });

  const totalVerifiedDrivers = await prisma.deliveryRider.count({
    where: {
      status: "APPROVED",
      ...(cityId && { cityId }),
    },
  });

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* City Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Serving {cityName}</span>
            {cityNameUr && <span className="font-urdu">({cityNameUr})</span>}
            <span className="text-white/40">•</span>
            <span>{totalVerifiedShops} Verified Shops</span>
            <span className="text-white/40">•</span>
            <span>{totalVerifiedDrivers}+ Drivers & Loaders</span>
          </div>

          {/* Heading */}
          <div className="space-y-2 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              The Digital Heart of <span className="text-emerald-300">{cityName}</span>
            </h1>
            <p className="text-base sm:text-lg text-emerald-100/90 font-urdu max-w-xl mx-auto">
              آپ کے شہر کی تمام تصدیق شدہ دکانیں، سواریاں، لوڈر رکشہ، زرعی منڈی اور خدمات ایک جگہ
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <form
              action="/explore"
              method="GET"
              className="flex items-center bg-white rounded-2xl p-2 shadow-2xl border border-white/20"
            >
              <div className="pl-3 pr-2 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="q"
                placeholder={`Search pharmacies, rides, solar, grocers in ${cityName}...`}
                className="w-full py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/30 transition-all shrink-0"
              >
                Search
              </button>
            </form>

            {/* Quick Search Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-emerald-200">
              <span className="text-emerald-300/80">Quick Access:</span>
              <NextLink
                href="/rides"
                className="px-3 py-1 rounded-full bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-100 font-bold border border-emerald-400/30 flex items-center gap-1.5 transition-colors"
              >
                <Car className="w-3.5 h-3.5 text-emerald-300" />
                <span>Rides & Loaders (سواری و لوڈر)</span>
              </NextLink>
              <NextLink
                href="/marketplace"
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Marketplace (بازار)</span>
              </NextLink>
              <NextLink
                href="/farmer"
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Kisan Mandi (کسان)</span>
              </NextLink>
              <NextLink
                href="/services"
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Artisans (کاریگر)</span>
              </NextLink>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🚀 HIGHLIGHT BLOCK: RIDES & COMMERCIAL CARGO LOADERS SUB-PORTAL */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 lg:p-10 shadow-2xl border border-slate-700/60 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  <Car className="w-4 h-4 text-emerald-400" />
                  <span>NEW: City Rides & Commercial Cargo Fleet • سواری اور مال بردار سروس</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                  Rides, Rickshaws & Heavy Cargo Loaders in {cityName}
                </h2>
                <p className="text-sm text-slate-300 font-urdu leading-relaxed">
                  جام پور شہر اور دیہی علاقوں کے لیے بائیک، چنگچی رکشہ، مال بردار لوڈر اور اے سی کار ٹیکسی۔ دکانداروں کا سامان منتقل کرنے یا فوری سفر کے لیے براہ راست کال کریں یا آن لائن بک کریں۔
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <NextLink
                  href="/rides"
                  className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                >
                  <Car className="w-4 h-4" />
                  <span>Book Ride or Cargo Loader &rarr;</span>
                </NextLink>
                <NextLink
                  href="/rider/register"
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-2 transition-colors"
                >
                  <span>Register as Driver (ڈرائیور بنیں)</span>
                </NextLink>
              </div>
            </div>

            {/* 4 Vehicle Fleet Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Auto Rickshaw */}
              <NextLink
                href="/rides?vehicle=AUTO_RICKSHAW"
                className="group p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🛺
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-300">Popular for Families</div>
                  <h3 className="text-base font-extrabold text-white">Auto Rickshaw / Qingqi</h3>
                  <p className="text-xs text-slate-300 font-urdu mt-1">
                    چنگچی و آٹو رکشہ برائے بازار، ہسپتال و مقامی سفر
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Starts from PKR 100</span>
                  <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </NextLink>

              {/* 2. Commercial Cargo Loader */}
              <NextLink
                href="/rides?type=cargo&vehicle=LOADER_RICKSHAW"
                className="group p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 transition-all space-y-3 relative overflow-hidden"
              >
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  For Merchants
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🚚
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-300">Shops & Mandi Cargo</div>
                  <h3 className="text-base font-extrabold text-white">Commercial Loader</h3>
                  <p className="text-xs text-slate-300 font-urdu mt-1">
                    غلہ منڈی کی بوریاں، دکان کا سامان اور 800 کلو تک وزن
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Starts from PKR 300</span>
                  <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </NextLink>

              {/* 3. Bike */}
              <NextLink
                href="/rides?vehicle=BIKE"
                className="group p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🏍️
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-300">Fast & Economical</div>
                  <h3 className="text-base font-extrabold text-white">Bike Ride & Parcel</h3>
                  <p className="text-xs text-slate-300 font-urdu mt-1">
                    موٹر سائیکل سواری اور ضروری پارسل ترسیل
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Starts from PKR 60</span>
                  <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </NextLink>

              {/* 4. Car / AC Taxi */}
              <NextLink
                href="/rides?vehicle=CAR_TAXI"
                className="group p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🚗
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-300">Intercity & Comfort</div>
                  <h3 className="text-base font-extrabold text-white">AC Car / Taxi Cab</h3>
                  <p className="text-xs text-slate-300 font-urdu mt-1">
                    جام پور تا ڈیرہ غازی خان، راجن پور اور طویل سفر
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Starts from PKR 250</span>
                  <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </NextLink>
            </div>

            {/* Feature Highlights Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>CNIC & License Verified Drivers</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>4-Digit Security PIN Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct Call & WhatsApp Driver</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Transparent Star Ratings & Reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🏛️ ECOSYSTEM PORTALS HUB (ALL-IN-ONE CITIZEN SERVICES) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Explore All {cityName} Digital Portals</span>
            </h2>
            <p className="text-xs text-slate-500 font-urdu">
              جام پور ڈیجیٹل او ایس کی مرکزی خدمات
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Marketplace Portal */}
          <NextLink
            href="/marketplace"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Digital Marketplace
            </h3>
            <p className="text-xs text-slate-500 font-urdu">
              شہر کے مصدقہ تاجروں سے براہ راست خریداری اور ہوم ڈلیوری
            </p>
          </NextLink>

          {/* Kisan Hub Portal */}
          <NextLink
            href="/farmer"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Kisan & Mandi Hub
            </h3>
            <p className="text-xs text-slate-500 font-urdu">
              لائیو منڈی ریٹ، فصل ڈاکٹر، اور زرعی ماہرین کا رابطہ
            </p>
          </NextLink>

          {/* Artisan Services */}
          <NextLink
            href="/services"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Artisans & Repairmen
            </h3>
            <p className="text-xs text-slate-500 font-urdu">
              الیکٹریشن، پلمبر، سولر مکینک اور مستری سے رابطہ
            </p>
          </NextLink>

          {/* Student Ecosystem */}
          <NextLink
            href="/students"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
              Student Ecosystem
            </h3>
            <p className="text-xs text-slate-500 font-urdu">
              سکالرشپس، تدریسی حلقے، اور پرانی کتب کا بازار
            </p>
          </NextLink>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              <span>Browse Categories in {cityName}</span>
            </h2>
            <p className="text-xs text-slate-500 font-urdu">
              اپنی مطلوبہ کیٹیگری منتخب کریں
            </p>
          </div>
          <NextLink
            href="/explore"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NextLink>
        </div>

        <CategoryGrid
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            nameUr: c.nameUr,
            slug: c.slug,
            icon: c.icon,
            businessesCount: c._count.businesses,
          }))}
        />
      </section>

      {/* Featured & Verified Businesses */}
      {featuredBusinesses.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                <span>Featured & Verified in {cityName}</span>
              </h2>
              <p className="text-xs text-slate-500 font-urdu">
                شہر کی تصدیق شدہ اور قابل اعتماد دکانیں
              </p>
            </div>
            <NextLink
              href="/explore?verified=true"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>See More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NextLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredBusinesses.map((biz) => (
              <BusinessCard
                key={biz.id}
                business={{
                  id: biz.id,
                  name: biz.name,
                  nameUr: biz.nameUr,
                  slug: biz.slug,
                  description: biz.description,
                  descriptionUr: biz.descriptionUr,
                  phone: biz.phone,
                  whatsapp: biz.whatsapp,
                  logoUrl: biz.logoUrl,
                  bannerUrl: biz.bannerUrl,
                  isVerified: biz.isVerified,
                  isFeatured: biz.isFeatured,
                  ratingAverage: biz.ratingAverage,
                  reviewCount: biz.reviewCount,
                  category: {
                    name: biz.category.name,
                    nameUr: biz.category.nameUr,
                    slug: biz.category.slug,
                  },
                  location: biz.locations[0]
                    ? {
                        addressLine: biz.locations[0].addressLine,
                        area: biz.locations[0].area,
                        landmark: biz.locations[0].landmark,
                      }
                    : null,
                  hours: biz.hours,
                  productsCount: biz._count.products,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Additions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Explore Local Directory</span>
            </h2>
            <p className="text-xs text-slate-500 font-urdu">
              جام پور کی تمام مصدقہ دکانیں اور سروسز
            </p>
          </div>
          <NextLink
            href="/explore"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NextLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentBusinesses.map((biz) => (
            <BusinessCard
              key={biz.id}
              business={{
                id: biz.id,
                name: biz.name,
                nameUr: biz.nameUr,
                slug: biz.slug,
                description: biz.description,
                descriptionUr: biz.descriptionUr,
                phone: biz.phone,
                whatsapp: biz.whatsapp,
                logoUrl: biz.logoUrl,
                bannerUrl: biz.bannerUrl,
                isVerified: biz.isVerified,
                isFeatured: biz.isFeatured,
                ratingAverage: biz.ratingAverage,
                reviewCount: biz.reviewCount,
                category: {
                  name: biz.category.name,
                  nameUr: biz.category.nameUr,
                  slug: biz.category.slug,
                },
                location: biz.locations[0]
                  ? {
                      addressLine: biz.locations[0].addressLine,
                      area: biz.locations[0].area,
                      landmark: biz.locations[0].landmark,
                    }
                  : null,
                hours: biz.hours,
                productsCount: biz._count.products,
              }}
            />
          ))}
        </div>
      </section>

      {/* Merchant Registration Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-10 border border-emerald-800/40 overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Listing Fees in {cityName}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Own a Business or Workshop in {cityName}?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-urdu">
                اپنی دکان کو آن لائن درج کریں اور ہزاروں کسٹمرز تک باآسانی رسائی حاصل کریں۔ رجسٹریشن مکمل طور پر مفت ہے۔
              </p>
            </div>

            <NextLink
              href="/business/register"
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/30 transition-all shrink-0 hover:scale-105"
            >
              Register Shop Now &rarr;
            </NextLink>
          </div>
        </div>
      </section>
    </div>
  );
}
