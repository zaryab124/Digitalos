import React from "react";
import NextLink from "next/link";
import {
  HeartPulse,
  ShoppingCart,
  Zap,
  Shirt,
  Sprout,
  Utensils,
  Wrench,
  Hammer,
  Store,
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  nameUr?: string | null;
  slug: string;
  icon?: string;
  businessesCount?: number;
}

interface CategoryGridProps {
  categories: CategoryItem[];
  activeSlug?: string;
}

const iconMap: Record<string, React.ElementType> = {
  "heart-pulse": HeartPulse,
  "shopping-cart": ShoppingCart,
  zap: Zap,
  shirt: Shirt,
  sprout: Sprout,
  utensils: Utensils,
  wrench: Wrench,
  hammer: Hammer,
  store: Store,
};

export default function CategoryGrid({
  categories,
  activeSlug,
}: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {categories.map((cat) => {
        const IconComponent = iconMap[cat.icon || "store"] || Store;
        const isActive = activeSlug === cat.slug;

        return (
          <NextLink
            key={cat.id}
            href={`/explore?category=${cat.slug}`}
            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 group text-center ${
              isActive
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/50"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white"
              }`}
            >
              <IconComponent className="w-5 h-5" />
            </div>

            <span className="text-xs font-bold leading-tight line-clamp-1">
              {cat.name}
            </span>

            {cat.nameUr && (
              <span
                className={`text-[11px] font-urdu leading-none mt-0.5 line-clamp-1 ${
                  isActive ? "text-white/90" : "text-emerald-800"
                }`}
              >
                {cat.nameUr}
              </span>
            )}

            {cat.businessesCount !== undefined && (
              <span
                className={`text-[10px] mt-1 ${
                  isActive ? "text-white/80" : "text-slate-400"
                }`}
              >
                {cat.businessesCount} {cat.businessesCount === 1 ? "shop" : "shops"}
              </span>
            )}
          </NextLink>
        );
      })}
    </div>
  );
}
