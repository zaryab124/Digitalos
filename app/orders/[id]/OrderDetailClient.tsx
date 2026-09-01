"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Store,
  MapPin,
  Phone,
  Truck,
  CheckCircle2,
  Clock,
  KeyRound,
  Star,
  MessageSquare,
  AlertTriangle,
  ArrowLeft,
  Banknote,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface OrderDetailClientProps {
  order: any;
  currentUser: { id: string; roles: string[] };
}

export default function OrderDetailClient({
  order,
  currentUser,
}: OrderDetailClientProps) {
  const router = useRouter();

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [riderRating, setRiderRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const isCustomer = currentUser.id === order.customerId;
  const isMerchant = currentUser.id === order.business.ownerId;
  const isRider = order.rider && order.rider.userId === currentUser.id;

  const steps = [
    { key: "PENDING", label: "Order Placed", labelUr: "آرڈر دیا گیا" },
    { key: "PREPARING", label: "Preparing", labelUr: "تیار کیا جا رہا ہے" },
    { key: "READY_FOR_PICKUP", label: "Ready for Rider", labelUr: "پک اپ کیلئے تیار" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", labelUr: "ڈلیوری روانہ" },
    { key: "DELIVERED", label: "Delivered", labelUr: "ترسیل مکمل" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "ACCEPTED":
      case "PREPARING":
        return 1;
      case "READY_FOR_PICKUP":
        return 2;
      case "OUT_FOR_DELIVERY":
        return 3;
      case "DELIVERED":
      case "COMPLETED":
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setReviewError(null);

    try {
      const res = await fetch(`/api/v1/orders/${order.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
          riderRating,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setReviewError(data.error?.message || "Failed to submit review.");
        setIsSubmittingReview(false);
        return;
      }

      setReviewSuccess(true);
      router.refresh();
    } catch {
      setReviewError("Network error. Please try again.");
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <NextLink
            href="/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </NextLink>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <span>Order #{order.orderNumber}</span>
          </h1>

          <p className="text-xs text-slate-500">
            Placed on {new Date(order.createdAt).toLocaleString()} • {order.paymentMethod}
          </p>
        </div>

        {/* Customer Proof-of-Delivery PIN */}
        {isCustomer && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-200 text-amber-900">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-amber-800">
                Proof of Delivery PIN
              </span>
              <span className="text-xl font-mono font-black text-amber-950 tracking-widest">
                {order.deliveryPin}
              </span>
              <p className="text-[10px] text-amber-700 font-urdu">
                رائڈر کو سامان ملنے پر یہ 4 ہندسوں کا کوڈ بتائیں
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Live Order Progress Stepper */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
          Live Order Status (آرڈر کی صورتحال)
        </h2>

        <div className="grid grid-cols-5 gap-2 relative">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={step.key} className="text-center space-y-2 relative">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-100 animate-pulse"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div className="space-y-0.5">
                  <p
                    className={`text-[11px] sm:text-xs font-bold ${
                      isCurrent || isCompleted ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-400 font-urdu hidden sm:block">
                    {step.labelUr}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Merchant Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>Store / Seller Details</span>
          </h3>

          <div className="space-y-2">
            <h4 className="font-extrabold text-base text-slate-900">
              {order.business.name}
            </h4>
            <p className="text-xs text-slate-600 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{order.business.locations[0]?.addressLine}</span>
            </p>
            <div className="pt-2">
              <a
                href={`tel:${order.business.phone}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>Call Store: {order.business.phone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Rider Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Delivery Courier</span>
          </h3>

          {order.rider ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    {order.rider.user.fullName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Vehicle: {order.rider.vehicleType} ({order.rider.vehicleNumber})
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
                  ★ {order.rider.ratingAverage}
                </span>
              </div>

              <div className="pt-2">
                <a
                  href={`tel:${order.rider.user.phoneNumber}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Rider: {order.rider.user.phoneNumber}</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center space-y-1">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Rider Assignment Pending</p>
              <p className="text-[11px] text-slate-400">
                A nearby courier will be assigned once the shop prepares your order.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Items & Financial Summary */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Ordered Items ({order.items.length})
        </h3>

        <div className="divide-y divide-slate-100">
          {order.items.map((item: any) => (
            <div
              key={item.id}
              className="py-3 first:pt-0 flex items-center justify-between text-xs sm:text-sm"
            >
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">{item.name}</p>
                {item.nameUr && (
                  <p className="text-[11px] text-emerald-800 font-urdu">{item.nameUr}</p>
                )}
                <p className="text-xs text-slate-400">
                  {item.quantity} × {formatPKR(item.price)} / {item.unit}
                </p>
              </div>
              <span className="font-black text-slate-900">
                {formatPKR(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Items Subtotal</span>
            <span className="font-bold text-slate-900">{formatPKR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Rider Delivery Fee</span>
            <span className="font-bold text-slate-900">{formatPKR(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
            <span>Grand Total</span>
            <span className="text-emerald-700">{formatPKR(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Review Section */}
      {(order.status === "DELIVERED" || order.status === "COMPLETED") && isCustomer && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Order & Delivery Feedback</span>
          </h3>

          {order.review || reviewSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <p className="text-xs font-bold text-emerald-900">
                ✓ You reviewed this order with {order.review?.rating || rating} Stars
              </p>
              <p className="text-xs text-emerald-800">
                "{order.review?.comment || comment}"
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {reviewError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {reviewError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Store Product Quality Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1.5 rounded-lg text-lg ${
                        star <= rating ? "text-amber-500" : "text-slate-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600">{rating} / 5</span>
                </div>
              </div>

              {order.rider && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Rider Delivery Speed & Behavior Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRiderRating(star)}
                        className={`p-1.5 rounded-lg text-lg ${
                          star <= riderRating ? "text-amber-500" : "text-slate-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600">{riderRating} / 5</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Comment / رائے
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the packaging, item condition, and delivery punctuality?"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors disabled:opacity-50"
              >
                {isSubmittingReview ? "Submitting Review..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
