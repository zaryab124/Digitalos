import React from "react";
import NextLink from "next/link";
import {
  Search,
  Filter,
  BadgeCheck,
  Clock,
  MapPin,
  Compass,
  SlidersHorizontal,
  X,
  Map as MapIcon,
  Grid,
} from "lucide-react";
import { getSelectedCity } from "@/lib/city";
import { prisma } from "@/lib/prisma";
import BusinessCard from "@/components/BusinessCard";

export const dynamic = "force-dynamic";

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    verified?: string;
    area?: string;
    view?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const city = await getSelectedCity();
  const cityId = city?.id;
  const cityName = city?.name || "Jampur";

  const q = params.q?.trim() || "";
  const categorySlug = params.category || "";
  const verifiedOnly = params.verified === "true";
  const areaFilter = params.area || "";
  const viewMode = params.view === "map" ? "map" : "grid";

  // Build filter query
  const where: any = {
    cityId,
    status: "APPROVED",
  };

  if (verifiedOnly) {
    where.isVerified = true;
  }

  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }

  if (areaFilter) {
    where.locations = {
      some: { area: { contains: areaFilter } },
    };
  }

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { nameUr: { contains: q } },
      { description: { contains: q } },
      { descriptionUr: { contains: q } },
      {
        locations: {
          some: {
            OR: [
              { addressLine: { contains: q } },
              { area: { contains: q } },
              { landmark: { contains: q } },
            ],
          },
        },
      },
    ];
  }

  const [categories, businesses, areas] = await Promise.all([
    prisma.businessCategory.findMany({
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
    }),
    prisma.business.findMany({
      where,
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
      orderBy: [
        { isFeatured: "desc" },
        { isVerified: "desc" },
        { ratingAverage: "desc" },
      ],
    }),
    prisma.businessLocation.findMany({
      where: { cityId },
      select: { area: true },
      distinct: ["area"],
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <Compass className="w-4 h-4" />
            <span>Local Business Discovery</span>
            <span>•</span>
            <span>{cityName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            City Directory & Bazaar
          </h1>
          <p className="text-xs text-slate-500 font-urdu">
            جام پور اور مضافات کی تمام تصدیق شدہ دکانیں اور سروسز
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <NextLink
            href={`/explore?${new URLSearchParams({
              ...(q && { q }),
              ...(categorySlug && { category: categorySlug }),
              ...(verifiedOnly && { verified: "true" }),
              ...(areaFilter && { area: areaFilter }),
              view: "grid",
            }).toString()}`}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              viewMode === "grid"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </NextLink>

          <NextLink
            href={`/explore?${new URLSearchParams({
              ...(q && { q }),
              ...(categorySlug && { category: categorySlug }),
              ...(verifiedOnly && { verified: "true" }),
              ...(areaFilter && { area: areaFilter }),
              view: "map",
            }).toString()}`}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              viewMode === "map"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map Discovery</span>
          </NextLink>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form method="GET" action="/explore" className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder={`Search by shop name, product, street or keyword in ${cityName}...`}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Category Select */}
            <select
              name="category"
              defaultValue={categorySlug}
              className="py-2.5 px-3 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Categories (تمام کیٹیگریز)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name} ({c._count.businesses})
                </option>
              ))}
            </select>

            {/* Area Select */}
            {areas.length > 0 && (
              <select
                name="area"
                defaultValue={areaFilter}
                className="py-2.5 px-3 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Areas / Bazaars</option>
                {areas.map((a) => (
                  <option key={a.area} value={a.area}>
                    {a.area}
                  </option>
                ))}
              </select>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors shrink-0"
            >
              Filter
            </button>
          </div>
        </form>

        {/* Category Pill Quick Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-100 no-scrollbar">
          <NextLink
            href="/explore"
            className={`px-3 py-1.5 rounded-full shrink-0 font-medium transition-colors ${
              !categorySlug && !verifiedOnly
                ? "bg-emerald-700 text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({businesses.length})
          </NextLink>

          <NextLink
            href={`/explore?verified=true${q ? `&q=${q}` : ""}`}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full shrink-0 font-medium transition-colors ${
              verifiedOnly
                ? "bg-emerald-700 text-white font-bold"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Verified Only</span>
          </NextLink>

          {categories.map((cat) => (
            <NextLink
              key={cat.id}
              href={`/explore?category=${cat.slug}${q ? `&q=${q}` : ""}`}
              className={`px-3 py-1.5 rounded-full shrink-0 font-medium transition-colors ${
                categorySlug === cat.slug
                  ? "bg-emerald-700 text-white font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.name} ({cat._count.businesses})
            </NextLink>
          ))}
        </div>
      </div>

      {/* Active Filter Tags */}
      {(q || categorySlug || verifiedOnly || areaFilter) && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-400">Active Filters:</span>
          {q && (
            <span className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded-lg flex items-center gap-1">
              Search: &quot;{q}&quot;
              <NextLink href={`/explore?${new URLSearchParams({ ...(categorySlug && { category: categorySlug }), ...(verifiedOnly && { verified: "true" }) }).toString()}`}>
                <X className="w-3 h-3 hover:text-rose-600" />
              </NextLink>
            </span>
          )}
          {categorySlug && (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg flex items-center gap-1">
              Category: {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
              <NextLink href={`/explore?${new URLSearchParams({ ...(q && { q }), ...(verifiedOnly && { verified: "true" }) }).toString()}`}>
                <X className="w-3 h-3 hover:text-rose-600" />
              </NextLink>
            </span>
          )}
          {verifiedOnly && (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg flex items-center gap-1">
              Verified Only
              <NextLink href={`/explore?${new URLSearchParams({ ...(q && { q }), ...(categorySlug && { category: categorySlug }) }).toString()}`}>
                <X className="w-3 h-3 hover:text-rose-600" />
              </NextLink>
            </span>
          )}
          {areaFilter && (
            <span className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded-lg flex items-center gap-1">
              Area: {areaFilter}
              <NextLink href={`/explore?${new URLSearchParams({ ...(q && { q }), ...(categorySlug && { category: categorySlug }) }).toString()}`}>
                <X className="w-3 h-3 hover:text-rose-600" />
              </NextLink>
            </span>
          )}
          <NextLink href="/explore" className="text-xs text-rose-600 hover:underline font-semibold ml-2">
            Reset All
          </NextLink>
        </div>
      )}

      {/* Main Results Content */}
      {businesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No businesses found matching your criteria</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search terms or category filters, or explore all verified businesses in {cityName}.
            </p>
          </div>
          <NextLink
            href="/explore"
            className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
          >
            Clear Filters & View All
          </NextLink>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {businesses.map((biz) => (
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
      ) : (
        /* Map Discovery View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Business Pin List */}
          <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {businesses.length} Pin Locations in {cityName}
            </p>
            {businesses.map((biz, idx) => (
              <div
                key={biz.id}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-colors shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <NextLink
                        href={`/business/${biz.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-emerald-700"
                      >
                        {biz.name}
                      </NextLink>
                      {biz.nameUr && (
                        <p className="text-xs text-emerald-800 font-urdu">{biz.nameUr}</p>
                      )}
                    </div>
                  </div>
                  {biz.isVerified && (
                    <BadgeCheck className="w-4 h-4 fill-emerald-600 text-white shrink-0" />
                  )}
                </div>

                {biz.locations[0] && (
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{biz.locations[0].addressLine}</span>
                  </p>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-500">
                    ⭐ {biz.ratingAverage.toFixed(1)} ({biz.reviewCount})
                  </span>
                  <NextLink
                    href={`/business/${biz.id}`}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    View Details &rarr;
                  </NextLink>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Visual Map Canvas */}
          <div className="lg:col-span-2 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 rounded-2xl p-6 text-white min-h-[450px] flex flex-col justify-between border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  {cityName} Spatial Grid
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Local Coordinates & Landmarks
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Lat: {city?.latitude || 29.6433}, Lng: {city?.longitude || 70.5950}
              </span>
            </div>

            {/* Radar Coordinates Visualization */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
              {businesses.slice(0, 6).map((biz, idx) => {
                const loc = biz.locations[0];
                return (
                  <div
                    key={biz.id}
                    className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15 space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="truncate">
                        #{idx + 1} {biz.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">
                      {loc?.area || "City Center"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      GPS: {loc?.latitude.toFixed(4) || "29.6433"}, {loc?.longitude.toFixed(4) || "70.5950"}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="relative z-10 text-[11px] text-slate-400 border-t border-white/10 pt-3 flex items-center justify-between">
              <span>All spatial coordinates verified by Jampur Digital OS</span>
              <span className="text-emerald-400 font-semibold">Live GPS Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
