"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Plus,
  Check,
  Search,
  Store,
  BadgeCheck,
  Tag,
  Truck,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPKR } from "@/lib/utils";

interface MarketplaceClientProps {
  activeCity: { id: string; name: string };
  categories: any[];
  products: any[];
  currentCategory?: string;
  initialQuery?: string;
}

export default function MarketplaceClient({
  categories,
  products,
  currentCategory,
  initialQuery,
}: MarketplaceClientProps) {
  const router = useRouter();
  const { addItem, items } = useCart();

  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [selectedCat, setSelectedCat] = useState(currentCategory || "all");
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      businessId: product.businessId,
      businessName: product.businessName,
      name: product.name,
      nameUr: product.nameUr,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
    });

    setAddedItemMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, medicines, solar panels, groceries..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <NextLink
            href="/marketplace"
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              !currentCategory || currentCategory === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            All Products
          </NextLink>

          {categories.map((cat) => (
            <NextLink
              key={cat.id}
              href={`/marketplace?category=${cat.slug}`}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                currentCategory === cat.slug
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{cat.name}</span>
              {cat.nameUr && (
                <span className="font-urdu ml-1 opacity-75 hidden sm:inline">
                  ({cat.nameUr})
                </span>
              )}
            </NextLink>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">
            No products found matching your search.
          </h3>
          <p className="text-xs text-slate-400">
            Try clearing filters or search for another item.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => {
            const isAdded = addedItemMap[product.id];
            const inCartCount =
              items.find((i) => i.productId === product.id)?.quantity || 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  {/* Shop Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <NextLink
                      href={`/business/${product.businessId}`}
                      className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 truncate flex items-center gap-1"
                    >
                      <Store className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{product.businessName}</span>
                      {product.isVerified && (
                        <BadgeCheck className="w-3.5 h-3.5 fill-emerald-600 text-white shrink-0" />
                      )}
                    </NextLink>

                    {product.isDeliveryAvailable && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                        <Truck className="w-2.5 h-2.5" />
                        <span>Delivery</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 group-hover:text-emerald-800 transition-colors">
                      {product.name}
                    </h3>
                    {product.nameUr && (
                      <p className="text-xs text-emerald-800 font-urdu truncate mt-0.5">
                        {product.nameUr}
                      </p>
                    )}
                    {product.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price & Action */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-base sm:text-lg font-black text-slate-900">
                        {formatPKR(product.price)}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1">
                        / {product.unit}
                      </span>
                    </div>

                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatPKR(product.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                      isAdded
                        ? "bg-emerald-700 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add to Cart {inCartCount > 0 ? `(${inCartCount})` : ""}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
