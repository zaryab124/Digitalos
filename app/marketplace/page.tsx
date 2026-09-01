import React from "react";
import NextLink from "next/link";
import {
  ShoppingBag,
  Sparkles,
  Zap,
  Tag,
  Store,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { getSelectedCity } from "@/lib/city";
import { prisma } from "@/lib/prisma";
import MarketplaceClient from "./MarketplaceClient";

export const dynamic = "force-dynamic";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category: categorySlug, q } = await searchParams;
  const activeCity = await getSelectedCity();

  // Fetch active promotional offers
  const offers = await prisma.offer.findMany({
    where: {
      isActive: true,
      endDate: { gte: new Date() },
      business: { cityId: activeCity.id, status: "APPROVED" },
    },
    include: {
      business: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { isFeatured: "desc" },
  });

  // Fetch categories
  const categories = await prisma.businessCategory.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { businesses: { where: { status: "APPROVED" } } } },
    },
    orderBy: { name: "asc" },
  });

  // Fetch products
  const where: any = {
    business: {
      cityId: activeCity.id,
      status: "APPROVED",
    },
    isAvailable: true,
  };

  if (categorySlug) {
    where.business.category = { slug: categorySlug };
  }

  if (q && q.trim() !== "") {
    const term = q.trim();
    where.OR = [
      { name: { contains: term } },
      { nameUr: { contains: term } },
      { description: { contains: term } },
      { business: { name: { contains: term } } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      business: {
        select: {
          id: true,
          name: true,
          nameUr: true,
          slug: true,
          isVerified: true,
          ratingAverage: true,
          locations: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-amber-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-800/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Local Commerce & Instant Delivery • {activeCity.name}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Order from Verified Shops in <span className="text-emerald-400">Jampur Bazaars</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-urdu leading-relaxed">
            مستند فارمیسی، سولر سسٹمز، کریانہ اور ہارڈویئر کی اشیاء گھر بیٹھے منگوائیں۔ تیز ترین رائڈر ڈلیوری اور کیش آن ڈلیوری سہولت۔
          </p>
        </div>
      </section>

      {/* Promotional Offers Carousel / Grid */}
      {offers.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-rose-500" />
              <span>Promotional Offers & Bumper Deals (خصوصی رعایت)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-200 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase">
                    {offer.discountPercentage}% FLAT OFF
                  </span>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    {offer.title}
                  </h3>
                  {offer.titleUr && (
                    <p className="text-xs text-emerald-900 font-urdu">{offer.titleUr}</p>
                  )}
                  <p className="text-[11px] text-slate-500">
                    By {offer.business.name} • Min Order: PKR {offer.minOrderAmount}
                  </p>
                </div>

                <NextLink
                  href={`/business/${offer.business.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0"
                >
                  Shop Deal
                </NextLink>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Interactive Product Grid Client */}
      <MarketplaceClient
        activeCity={activeCity}
        categories={categories}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          nameUr: p.nameUr,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          unit: p.unit,
          stockQuantity: p.stockQuantity,
          isAvailable: p.isAvailable,
          isDeliveryAvailable: p.isDeliveryAvailable,
          discountPercentage: p.discountPercentage,
          imageUrl: p.imageUrl,
          businessId: p.business.id,
          businessName: p.business.name,
          businessSlug: p.business.slug,
          isVerified: p.business.isVerified,
          ratingAverage: p.business.ratingAverage,
          area: p.business.locations[0]?.area || "City Center",
        }))}
        currentCategory={categorySlug}
        initialQuery={q}
      />
    </div>
  );
}
