"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  MapPin,
  Truck,
  CreditCard,
  Banknote,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Store,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPKR } from "@/lib/utils";

interface CheckoutClientProps {
  user: { id: string; fullName: string; phoneNumber: string };
  activeCity: { id: string; name: string };
}

export default function CheckoutClient({ user, activeCity }: CheckoutClientProps) {
  const router = useRouter();
  const { items, subtotal, businessId, businessName, clearCart } = useCart();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryArea, setDeliveryArea] = useState("Indus Highway");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "COD" | "RAAST" | "JAZZCASH" | "EASYPAISA" | "BANK_TRANSFER"
  >("COD");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deliveryFee = 100;
  const grandTotal = subtotal + deliveryFee;

  const paymentOptions = [
    {
      id: "COD",
      title: "Cash on Delivery (کیش آن ڈلیوری)",
      desc: "Pay in cash when rider delivers to your doorstep",
      icon: Banknote,
      badge: "Most Popular",
    },
    {
      id: "RAAST",
      title: "Raast Instant QR (راست کیو آر)",
      desc: "Instant zero-fee payment via any bank app Raast ID",
      icon: QrCode,
      badge: "Zero Fee",
    },
    {
      id: "JAZZCASH",
      title: "JazzCash Mobile Account",
      desc: "Direct debit from your 030X JazzCash account",
      icon: Smartphone,
    },
    {
      id: "EASYPAISA",
      title: "EasyPaisa Mobile Account",
      desc: "Direct debit from your EasyPaisa wallet",
      icon: Smartphone,
    },
    {
      id: "BANK_TRANSFER",
      title: "Direct Online Bank Transfer",
      desc: "Transfer via HBL, UBL, Meezan or NBP online banking",
      icon: CreditCard,
    },
  ];

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (items.length === 0 || !businessId) {
      setErrorMessage("Your cart is empty.");
      setIsLoading(false);
      return;
    }

    if (deliveryAddress.trim().length < 5) {
      setErrorMessage("Please enter a complete delivery address (street, house #).");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          cityId: activeCity.id,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          deliveryAddress,
          deliveryArea,
          deliveryNotes: deliveryNotes || undefined,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || "Failed to place order.");
        setIsLoading(false);
        return;
      }

      clearCart();
      router.push(`/orders/${data.data.order.id}`);
    } catch {
      setErrorMessage("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Your cart is empty</h3>
        <NextLink
          href="/marketplace"
          className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
        >
          Return to Marketplace
        </NextLink>
      </div>
    );
  }

  return (
    <form onSubmit={handlePlaceOrder} className="space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Delivery & Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Delivery Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>1. Delivery Address • {activeCity.name}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  disabled
                  value={user.fullName}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contact Phone (Rider will call here)
                </label>
                <input
                  type="text"
                  disabled
                  value={user.phoneNumber}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Area / محلہ *
              </label>
              <select
                value={deliveryArea}
                onChange={(e) => setDeliveryArea(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Indus Highway">Indus Highway Bypass</option>
                <option value="Shahi Bazaar">Shahi Bazaar & Purana Chowk</option>
                <option value="THQ Hospital Road">THQ Hospital Road</option>
                <option value="Dajal Road">Dajal Road</option>
                <option value="Kotla Dewan">Kotla Dewan</option>
                <option value="City Center">City Center</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                House # / Street / Landmark Address *
              </label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="e.g. House # 14, Gali # 3, Near Al-Razi Pharmacy, Jampur"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Delivery Instructions (Optional / خصوصی ہدایات)
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Call when outside green gate, deliver before 6 PM"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 2. Provider-Agnostic Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>2. Payment Method / ادائیگی کا طریقہ</span>
            </h2>

            <div className="space-y-2.5">
              {paymentOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentMethod === opt.id;

                return (
                  <label
                    key={opt.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => setPaymentMethod(opt.id as any)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900">
                            {opt.title}
                          </span>
                          {opt.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{opt.desc}</p>
                      </div>
                    </div>

                    <Icon className="w-5 h-5 text-slate-400 shrink-0" />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Order Summary & Place Order Button */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Order Summary</h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {items.length} Items
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{businessName}</span>
            </div>

            {/* Line items preview */}
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto space-y-2">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="pt-2 first:pt-0 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {item.quantity} × {formatPKR(item.price)}
                    </p>
                  </div>
                  <span className="font-black text-slate-900 shrink-0">
                    {formatPKR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals breakdown */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Rider Delivery Fee</span>
                <span className="font-bold text-slate-900">{formatPKR(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="text-emerald-700">{formatPKR(grandTotal)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? "Placing Order..." : "Confirm & Place Order"}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
