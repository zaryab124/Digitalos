import React from "react";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  ArrowLeft,
  Share2,
  Calendar,
  Package,
  ShieldCheck,
  Flag,
  PenLine,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isBusinessOpenNow, formatPKR, DAYS_OF_WEEK } from "@/lib/utils";
import BusinessProfileClient from "./BusinessProfileClient";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

interface BusinessDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BusinessDetailPage({
  params,
}: BusinessDetailPageProps) {
  const { id } = await params;

  const business = await prisma.business.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      city: true,
      category: true,
      locations: true,
      hours: {
        orderBy: { dayOfWeek: "asc" },
      },
      products: {
        where: { isAvailable: true },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        where: { isFlagged: false },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              fullNameUr: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!business) {
    notFound();
  }

  const openStatus = isBusinessOpenNow(business.hours);
  const location = business.locations[0];
  const cleanWhatsApp = (business.whatsapp || business.phone).replace(/\D/g, "");

  // Calculate rating distribution
  const ratingsCount = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5
  business.reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingsCount[r.rating - 1]++;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <NextLink
          href="/explore"
          className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Directory</span>
        </NextLink>
        <span>/</span>
        <span>{business.city.name}</span>
        <span>/</span>
        <span>{business.category.name}</span>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate">{business.name}</span>
      </div>

      {/* Hero Banner & Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-72 w-full bg-slate-900 overflow-hidden">
          {business.bannerUrl ? (
            <img
              src={business.bannerUrl}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-emerald-900 flex items-center justify-center text-emerald-100 text-2xl font-bold">
              {business.name}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges on Cover */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md ${
                openStatus.isOpen
                  ? "bg-emerald-500 text-white"
                  : "bg-rose-500 text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{openStatus.message}</span>
            </span>
          </div>
        </div>

        {/* Business Main Info Header */}
        <div className="px-6 py-6 sm:px-8 -mt-12 sm:-mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden shrink-0">
                {business.logoUrl ? (
                  <img
                    src={business.logoUrl}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-700 text-white flex items-center justify-center font-bold text-2xl">
                    {business.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    {business.category.name}
                  </span>
                  {business.isVerified && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm">
                      <BadgeCheck className="w-3.5 h-3.5 fill-white text-emerald-600" />
                      <span>Verified Local Shop</span>
                    </span>
                  )}
                  {business.status === "PENDING" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                      Pending Verification
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {business.name}
                </h1>

                {business.nameUr && (
                  <p className="text-base text-emerald-800 font-urdu">
                    {business.nameUr}
                  </p>
                )}

                {location && (
                  <p className="text-xs text-slate-600 flex items-center gap-1 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {location.addressLine} • {location.area}, {business.city.name}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Action Contact Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
              <a
                href={`tel:${business.phone}`}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>

              <a
                href={`https://wa.me/${cleanWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-sm font-bold transition-all hover:scale-105"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-center">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-500">Average Rating</span>
              <div className="flex items-center justify-center gap-1 mt-1 text-amber-500 font-bold text-lg">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{business.ratingAverage.toFixed(1)}</span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-500">Customer Reviews</span>
              <p className="font-bold text-lg text-slate-900 mt-1">
                {business.reviewCount} Reviews
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-500">Catalog Items</span>
              <p className="font-bold text-lg text-slate-900 mt-1">
                {business.products.length} Items
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-500">City Verification</span>
              <p className="font-bold text-sm text-emerald-700 mt-1.5 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Govt Verified</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): About, Products, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* About / Description */}
          {business.description && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
              <h2 className="text-base font-bold text-slate-900">
                About {business.name}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {business.description}
              </p>
              {business.descriptionUr && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-sm text-emerald-900 font-urdu leading-loose">
                    {business.descriptionUr}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Products / Services Catalog */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <span>Products & Services Catalog ({business.products.length})</span>
              </h2>
            </div>

            {business.products.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No items listed yet in this catalog. Contact business directly via Call/WhatsApp.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {business.products.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between space-y-2 hover:border-emerald-200 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-slate-900">
                          {product.name}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium shrink-0">
                          {product.unit}
                        </span>
                      </div>
                      {product.nameUr && (
                        <p className="text-xs text-emerald-800 font-urdu">
                          {product.nameUr}
                        </p>
                      )}
                      {product.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                      <div>
                        <span className="font-extrabold text-base text-emerald-700">
                          {formatPKR(product.price)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-slate-400 line-through ml-1">
                            {formatPKR(product.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      <AddToCartButton
                        product={{
                          id: product.id,
                          businessId: business.id,
                          businessName: business.name,
                          name: product.name,
                          nameUr: product.nameUr,
                          price: product.price,
                          unit: product.unit,
                          imageUrl: product.imageUrl,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews & Ratings Section (Client Interactive) */}
          <BusinessProfileClient
            businessId={business.id}
            businessName={business.name}
            ratingAverage={business.ratingAverage}
            reviewCount={business.reviewCount}
            ratingsCount={ratingsCount}
            reviews={business.reviews.map((r) => ({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              createdAt: r.createdAt.toISOString(),
              user: {
                id: r.user.id,
                fullName: r.user.fullName,
                fullNameUr: r.user.fullNameUr,
              },
            }))}
          />
        </div>

        {/* Right Column (1 Col): Hours, Location & Contact Details */}
        <div className="space-y-6">
          {/* Weekly Opening Hours */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Weekly Business Hours</span>
            </h3>

            <div className="space-y-2 text-xs">
              {DAYS_OF_WEEK.map(({ day, en, ur }) => {
                const hourObj = business.hours.find((h) => h.dayOfWeek === day);
                const isToday = new Date().getDay() === day;

                return (
                  <div
                    key={day}
                    className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                      isToday
                        ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200"
                        : "text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{en}</span>
                      <span className="text-slate-400 font-urdu">({ur})</span>
                      {isToday && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase">
                          Today
                        </span>
                      )}
                    </div>

                    <div>
                      {!hourObj || hourObj.isClosed ? (
                        <span className="text-rose-500 font-semibold">Closed (بند)</span>
                      ) : (
                        <span>
                          {hourObj.openTime} — {hourObj.closeTime}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location & Address Card */}
          {location && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Physical Location</span>
              </h3>

              <div className="text-xs text-slate-700 space-y-1.5 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <p className="font-semibold text-slate-900">{location.addressLine}</p>
                {location.addressLineUr && (
                  <p className="text-emerald-800 font-urdu">{location.addressLineUr}</p>
                )}
                <p className="text-slate-500">
                  Area: <span className="font-medium text-slate-800">{location.area}</span>
                </p>
                {location.landmark && (
                  <p className="text-slate-500">
                    Landmark:{" "}
                    <span className="font-medium text-slate-800">{location.landmark}</span>
                  </p>
                )}
                <p className="text-[10px] text-slate-400 font-mono pt-1">
                  GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
              </div>

              <a
                href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Open in Google Maps &rarr;
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
