import React from "react";
import NextLink from "next/link";
import {
  BadgeCheck,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  ExternalLink,
} from "lucide-react";
import { isBusinessOpenNow, formatPhoneNumber } from "@/lib/utils";

export interface BusinessCardProps {
  business: {
    id: string;
    name: string;
    nameUr?: string | null;
    slug: string;
    description?: string | null;
    descriptionUr?: string | null;
    phone: string;
    whatsapp?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    isVerified: boolean;
    isFeatured: boolean;
    ratingAverage: number;
    reviewCount: number;
    category: {
      name: string;
      nameUr?: string | null;
      slug: string;
    };
    location?: {
      addressLine: string;
      area: string;
      landmark?: string | null;
    } | null;
    hours?: Array<{
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>;
    productsCount?: number;
  };
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const openStatus = isBusinessOpenNow(business.hours || []);
  const cleanWhatsApp = (business.whatsapp || business.phone).replace(/\D/g, "");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-emerald-300 hover:shadow-lg transition-all duration-200 flex flex-col group">
      {/* Banner / Header */}
      <div className="relative h-40 bg-gradient-to-tr from-slate-100 to-slate-200 overflow-hidden">
        {business.bannerUrl ? (
          <img
            src={business.bannerUrl}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-emerald-800 flex items-center justify-center text-emerald-100 font-bold text-lg">
            {business.name}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges on Banner */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold shadow-sm">
            {business.category.name}
          </span>
          {business.isFeatured && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-bold shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Open/Closed Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm ${
              openStatus.isOpen
                ? "bg-emerald-500 text-white"
                : "bg-rose-500 text-white"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{openStatus.isOpen ? "Open Now" : "Closed"}</span>
          </span>
        </div>

        {/* Area tag at bottom of banner */}
        {business.location && (
          <div className="absolute bottom-2 left-3 flex items-center gap-1 text-white/90 text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[200px]">{business.location.area}</span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Verified Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <NextLink
                href={`/business/${business.id}`}
                className="font-bold text-base text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1"
              >
                {business.name}
              </NextLink>
              {business.nameUr && (
                <p className="text-xs text-emerald-800 font-urdu line-clamp-1 mt-0.5">
                  {business.nameUr}
                </p>
              )}
            </div>

            {business.isVerified && (
              <span
                title="Verified Local Business by City Administration"
                className="flex items-center gap-1 text-emerald-600 shrink-0 bg-emerald-50 px-1.5 py-0.5 rounded-md text-xs font-medium border border-emerald-100"
              >
                <BadgeCheck className="w-4 h-4 fill-emerald-600 text-white" />
                <span className="text-[10px]">Verified</span>
              </span>
            )}
          </div>

          {/* Description */}
          {business.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
              {business.description}
            </p>
          )}

          {/* Rating and Reviews */}
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{business.ratingAverage.toFixed(1)}</span>
            </div>
            <span className="text-slate-300">•</span>
            <span>{business.reviewCount} reviews</span>
            {business.productsCount !== undefined && business.productsCount > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-medium">
                  {business.productsCount} items
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
          <a
            href={`tel:${business.phone}`}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            title={`Call ${business.phone}`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Call</span>
          </a>

          <a
            href={`https://wa.me/${cleanWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
            title="Chat on WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          <NextLink
            href={`/business/${business.id}`}
            className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            <span>View</span>
            <ExternalLink className="w-3 h-3" />
          </NextLink>
        </div>
      </div>
    </div>
  );
}
