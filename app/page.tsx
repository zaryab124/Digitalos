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

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* City Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Serving {cityName}</span>
            {cityNameUr && <span className="font-urdu">({cityNameUr})</span>}
            <span className="text-white/40">•</span>
            <span>{totalVerifiedShops} Verified Businesses</span>
          </div>

          {/* Heading */}
          <div className="space-y-2 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              The Digital Heart of <span className="text-emerald-300">{cityName}</span>
            </h1>
            <p className="text-base sm:text-lg text-emerald-100/90 font-urdu max-w-xl mx-auto">
              آپ کے شہر کی تمام تصدیق شدہ دکانیں، میڈیکل سٹورز، سولر اور خدمات ایک جگہ
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
                placeholder={`Search pharmacies, solar, groceries in ${cityName}...`}
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
              <span className="text-emerald-300/80">Popular in {cityName}:</span>
              <NextLink
                href="/explore?category=pharmacies"
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                Pharmacies (ادویات)
              </NextLink>
              <NextLink
                href="/explore?category=electronics"
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                Solar Panels (سولر)
              </NextLink>
              <NextLink
                href="/explore?category=agriculture"
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                Fertilizers (کھاد و بیج)
              </NextLink>
              <NextLink
                href="/explore?category=textiles"
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                Shahi Bazaar (کپڑا)
              </NextLink>
            </div>
          </div>
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
