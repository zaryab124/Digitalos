"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Car,
  Truck,
  Bike,
  Star,
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  KeyRound,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface MyRidesClientProps {
  initialRides: any[];
  user: any;
}

export default function MyRidesClient({ initialRides }: MyRidesClientProps) {
  const router = useRouter();
  const [rides, setRides] = useState(initialRides);

  // Review modal state
  const [reviewRideId, setReviewRideId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const activeTrips = rides.filter(
    (r) => r.status !== "COMPLETED" && r.status !== "CANCELLED"
  );
  const pastTrips = rides.filter(
    (r) => r.status === "COMPLETED" || r.status === "CANCELLED"
  );

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRideId) return;

    setIsSubmittingReview(true);
    setReviewError(null);

    try {
      const res = await fetch(`/api/v1/rides/${reviewRideId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setReviewError(data.error?.message || "Failed to submit review.");
        setIsSubmittingReview(false);
        return;
      }

      setReviewRideId(null);
      setComment("");
      setIsSubmittingReview(false);
      router.refresh();
    } catch {
      setReviewError("Network error.");
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
            🚖 Trip History & Live Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            My Rides & Cargo Bookings
          </h1>
        </div>

        <Link
          href="/rides"
          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
        >
          <span>Book Another Ride / Loader</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Active Trips Section */}
      {activeTrips.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Active Trips in Progress ({activeTrips.length})</span>
          </h2>

          <div className="space-y-4">
            {activeTrips.map((ride) => (
              <div
                key={ride.id}
                className="bg-white p-6 rounded-3xl border-2 border-emerald-500 shadow-lg space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <span className="font-mono font-black text-sm text-slate-900">
                      Booking #{ride.bookingNumber}
                    </span>
                    <p className="text-xs text-emerald-800 font-bold">
                      {ride.serviceType === "MERCHANT_CARGO"
                        ? `🚚 Commercial Cargo (${ride.vehicleCategory})`
                        : `🚖 Passenger Ride (${ride.vehicleCategory})`}
                      {" • "}
                      Fare: {formatPKR(ride.fareAmount)}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black self-start sm:self-auto ${
                      ride.status === "REQUESTED"
                        ? "bg-amber-100 text-amber-800 animate-pulse"
                        : ride.status === "ACCEPTED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    Status: {ride.status}
                  </span>
                </div>

                {/* 4-Digit Security PIN Callout */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider">
                        Security Verification PIN
                      </span>
                      <p className="text-xs text-emerald-800">
                        Give this 4-digit code to your driver when the ride/cargo arrives:
                      </p>
                    </div>
                  </div>

                  <span className="text-2xl font-mono font-black text-emerald-700 bg-white px-4 py-1.5 rounded-xl border border-emerald-300 self-start sm:self-auto">
                    {ride.completionPin}
                  </span>
                </div>

                {/* Locations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Pickup Location
                    </span>
                    <p className="font-bold text-slate-900">{ride.pickupAddress}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Destination / Dropoff
                    </span>
                    <p className="font-bold text-slate-900">{ride.dropoffAddress}</p>
                  </div>
                </div>

                {/* Assigned Driver Info */}
                {ride.rider ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Assigned Driver
                      </span>
                      <p className="font-extrabold text-sm text-slate-900">
                        {ride.rider.user.fullName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {ride.rider.vehicleMakeModel || ride.rider.vehicleType} • {ride.rider.vehicleNumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${ride.rider.user.phoneNumber}`}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Driver</span>
                      </a>
                      <a
                        href={`https://wa.me/${ride.rider.user.phoneNumber.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 text-amber-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Broadcasting to nearest available drivers in {ride.city.name}...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Trips Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
          Past Trips & Completed Logistics ({pastTrips.length})
        </h2>

        {pastTrips.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            No completed trips yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {pastTrips.map((ride) => (
              <div
                key={ride.id}
                className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      #{ride.bookingNumber}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-emerald-800">
                      {formatPKR(ride.fareAmount)} ({ride.paymentMethod})
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {ride.status}
                    </span>
                  </div>

                  <p className="text-slate-600">
                    {ride.pickupArea} → {ride.dropoffArea} ({ride.vehicleCategory})
                  </p>

                  {ride.rider && (
                    <p className="text-slate-500 text-[11px]">
                      Driver: {ride.rider.user.fullName} ({ride.rider.vehicleNumber})
                    </p>
                  )}
                </div>

                {/* Rating Button or Status */}
                {ride.status === "COMPLETED" && (
                  <div>
                    {ride.review ? (
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>You rated: {ride.review.rating}/5</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReviewRideId(ride.id);
                          setRating(5);
                          setComment("");
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>Rate Driver</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Driver Review Modal */}
      {reviewRideId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Rate Driver & Service</span>
              </h3>
              <button
                onClick={() => setReviewRideId(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 font-urdu">
              ڈرائیور کی سروس اور وقت کی پابندی پر اپنی رائے دیں:
            </p>

            {reviewError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Star Picker */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        s <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your ride / cargo experience..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReviewRideId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Rating"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
