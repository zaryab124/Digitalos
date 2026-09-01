"use client";

import React from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Store,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPKR } from "@/lib/utils";

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    totalItems,
    subtotal,
    businessName,
    updateQuantity,
    removeItem,
    clearCart,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const deliveryFee = 100;
  const grandTotal = subtotal > 0 ? subtotal + deliveryFee : 0;

  return (
    <>
      {/* Floating Cart Trigger Button (Bottom-Right) */}
      {totalItems > 0 && !isCartOpen && (
        <div className="fixed bottom-20 right-5 z-40 sm:bottom-6 sm:right-6 animate-bounce">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 px-5 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-2xl shadow-emerald-600/40 transition-transform hover:scale-105"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {totalItems}
              </span>
            </div>
            <span>View Cart • {formatPKR(subtotal)}</span>
          </button>
        </div>
      )}

      {/* Slide-over Drawer Backdrop */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              {/* Header */}
              <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Your Shopping Cart ({totalItems})
                  </h3>
                </div>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Shop Badge */}
              {businessName && items.length > 0 && (
                <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-950 font-bold">
                  <div className="flex items-center gap-1.5 truncate">
                    <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Ordering from: {businessName}</span>
                  </div>
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-rose-600 hover:underline shrink-0 font-semibold"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">Your cart is empty</p>
                    <p className="text-xs text-slate-400">
                      Add products from verified shops across Jampur bazaars.
                    </p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.productId}
                      className="pt-4 first:pt-0 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {item.name}
                        </h4>
                        {item.nameUr && (
                          <p className="text-[11px] text-emerald-800 font-urdu truncate">
                            {item.nameUr}
                          </p>
                        )}
                        <p className="text-xs font-bold text-slate-700">
                          {formatPKR(item.price)} <span className="text-[10px] text-slate-400 font-normal">/ {item.unit}</span>
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1.5 text-slate-600 hover:text-slate-900"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1.5 text-slate-600 hover:text-slate-900"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1.5 text-slate-300 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Summary & Checkout CTA */}
              {items.length > 0 && (
                <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Items Subtotal</span>
                      <span className="font-bold text-slate-900">{formatPKR(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Standard Delivery Fee</span>
                      <span className="font-bold text-slate-900">{formatPKR(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                      <span>Grand Total</span>
                      <span className="text-emerald-700">{formatPKR(grandTotal)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push("/checkout");
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-transform active:scale-98"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
