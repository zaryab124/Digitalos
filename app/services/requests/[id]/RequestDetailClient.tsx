"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Phone,
  Star,
  BadgeCheck,
  Sparkles,
  ArrowLeft,
  DollarSign,
  User,
} from "lucide-react";
import { formatPKR, formatPhoneNumber } from "@/lib/utils";

interface RequestDetailClientProps {
  user: { id: string; fullName: string; phoneNumber: string; roles: string[] };
  request: any;
}

export default function RequestDetailClient({
  user,
  request,
}: RequestDetailClientProps) {
  const router = useRouter();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const isCustomer = user.id === request.customerId;
  const isAssignedProvider =
    request.assignedProvider && request.assignedProvider.user.id === user.id;

  // Accept Quotation handler
  const handleAcceptQuote = async (quoteId: string) => {
    if (!confirm("Are you sure you want to accept this technician's price quote?")) return;

    setIsActionLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/quotes/${quoteId}/accept`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || "Failed to accept quote.");
        setIsActionLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("Network error.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Update Status handler (Provider: IN_PROGRESS or COMPLETED)
  const handleUpdateStatus = async (newStatus: string) => {
    setIsActionLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/service-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || "Failed to update status.");
        setIsActionLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("Network error.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Submit Review handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `/api/v1/providers/${request.assignedProviderId}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: request.id,
            rating: reviewRating,
            comment: reviewComment,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || "Failed to submit review.");
        setIsSubmittingReview(false);
        return;
      }

      setIsReviewModalOpen(false);
      router.refresh();
    } catch {
      setErrorMessage("Network error.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const steps = [
    { key: "OPEN", label: "Request Posted", labelUr: "درخواست درج" },
    { key: "QUOTED", label: "Quotes Received", labelUr: "کوٹیشنز موصول" },
    { key: "ASSIGNED", label: "Tech Assigned", labelUr: "ٹیکنیشن منتخب" },
    { key: "IN_PROGRESS", label: "In Progress", labelUr: "کام جاری" },
    { key: "COMPLETED", label: "Completed", labelUr: "مکمل" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === request.status);

  return (
    <div className="space-y-6">
      {/* Top Back Link */}
      <NextLink
        href="/services/requests"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Requests</span>
      </NextLink>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Progress Pipeline */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Job Progress Pipeline / کام کی صورتحال
          </span>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-900 uppercase">
            Status: {request.status}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center">
          {steps.map((step, idx) => {
            const isDone = currentStepIndex >= idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div key={step.key} className="space-y-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isDone ? "bg-emerald-500" : "bg-slate-200"
                  } ${isCurrent ? "ring-2 ring-emerald-500/40 animate-pulse" : ""}`}
                />
                <span
                  className={`text-[10px] sm:text-xs block font-bold truncate ${
                    isDone ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-400 font-urdu hidden sm:block">
                  {step.labelUr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Request Details Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase">
                {request.categorySlug}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold">
                Urgency: {request.urgency}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {request.title}
            </h1>

            <p className="text-xs text-slate-400">
              Posted by {request.customer.fullName} on{" "}
              {new Date(request.createdAt).toLocaleString("en-PK", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>

          {request.finalPrice && (
            <div className="text-left sm:text-right bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
              <span className="text-[11px] text-emerald-800 block">Agreed Price</span>
              <span className="text-lg font-black text-emerald-900">
                {formatPKR(request.finalPrice)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Problem Description / مسئلے کی تفصیل
          </h3>
          <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed font-sans">
            {request.description}
          </p>
        </div>

        {/* Location & Slot details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Location:</strong> {request.addressLine} ({request.area},{" "}
              {request.city.name})
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Preferred Time:</strong> {request.preferredDate || "Today"}{" "}
              {request.preferredTimeSlot ? `• ${request.preferredTimeSlot}` : ""}
            </span>
          </div>
        </div>

        {/* Action button for assigned provider */}
        {isAssignedProvider && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-amber-950 font-semibold">
              🔧 You are the assigned technician for this job.
            </div>
            <div className="flex items-center gap-2">
              {request.status === "ASSIGNED" && (
                <button
                  onClick={() => handleUpdateStatus("IN_PROGRESS")}
                  disabled={isActionLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl"
                >
                  Start Work (کام شروع کریں)
                </button>
              )}

              {request.status === "IN_PROGRESS" && (
                <button
                  onClick={() => handleUpdateStatus("COMPLETED")}
                  disabled={isActionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Job Completed (مکمل ہو گیا)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION: RECEIVED QUOTATIONS */}
      {request.status !== "COMPLETED" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Received Quotations ({request.quotes.length})</span>
              </h2>
              <p className="text-xs text-slate-500 font-urdu">
                کاریگروں کی جانب سے موصول شدہ پیشکشیں
              </p>
            </div>
          </div>

          {request.quotes.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Clock className="w-8 h-8 text-amber-500 mx-auto animate-spin" />
              <h4 className="font-bold text-sm text-slate-800">
                Awaiting Technician Quotes
              </h4>
              <p className="text-xs text-slate-500 font-urdu">
                ہم نے جام پور کے قریبی ٹیکنیشنز کو مطلع کر دیا ہے۔ کوٹیشنز موصول ہوتے ہی آپ کو نوٹیفکیشن مل جائے گی۔
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {request.quotes.map((quote: any) => {
                const isWinner = quote.status === "ACCEPTED";

                return (
                  <div
                    key={quote.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isWinner
                        ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-white hover:border-amber-300"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Provider Info */}
                      <div className="flex items-start gap-3.5 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 font-black text-base flex items-center justify-center shrink-0">
                          {quote.provider.user.fullName.charAt(0)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-sm text-slate-900">
                              {quote.provider.user.fullName}
                            </h4>
                            {quote.provider.isVerified && (
                              <BadgeCheck className="w-4 h-4 fill-emerald-600 text-white" />
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{quote.provider.ratingAverage.toFixed(1)}</span>
                            </span>
                            <span>•</span>
                            <span>{quote.provider.jobsCompleted} jobs completed</span>
                          </div>

                          {quote.notes && (
                            <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl mt-1.5">
                              &quot;{quote.notes}&quot;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Pricing & Timing */}
                      <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
                        <div>
                          <span className="text-[11px] text-slate-400 block md:text-right">
                            Total Quote Offer
                          </span>
                          <span className="text-xl font-black text-slate-900">
                            {formatPKR(quote.estimatedAmount)}
                          </span>
                          <span className="text-[11px] text-slate-500 block md:text-right">
                            ⏱️ {quote.estimatedArrival} ({quote.estimatedDuration})
                          </span>
                        </div>

                        {/* Customer Accept CTA */}
                        {isCustomer && request.status === "QUOTED" && (
                          <button
                            onClick={() => handleAcceptQuote(quote.id)}
                            disabled={isActionLoading}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-transform"
                          >
                            Accept & Hire
                          </button>
                        )}

                        {isWinner && (
                          <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                            ✓ HIRED TECHNICIAN
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION: COMPLETED & REVIEW */}
      {request.status === "COMPLETED" && (
        <div className="bg-emerald-500/10 border-2 border-emerald-500/30 p-6 sm:p-8 rounded-3xl space-y-4 text-emerald-950">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Service Completed Successfully!
              </h3>
              <p className="text-xs text-emerald-900 font-urdu">
                یہ کام مکمل ہو چکا ہے۔ برائے مہربانی ٹیکنیشن کے کام کا ریویو درج کریں۔
              </p>
            </div>
          </div>

          {request.review ? (
            <div className="bg-white p-5 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Your Submitted Review</span>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{request.review.rating} / 5 Stars</span>
                </div>
              </div>
              <p className="text-xs text-slate-700">&quot;{request.review.comment}&quot;</p>
            </div>
          ) : (
            isCustomer && (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md"
              >
                Write Customer Review & Rating (ریویو درج کریں)
              </button>
            )
          )}
        </div>
      )}

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Review {request.assignedProvider?.user.fullName}
            </h3>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Rating (1 to 5 Stars) *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          reviewRating >= star ? "fill-amber-400" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Comment / رائے *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience (e.g. Bohat acha kaam kiya, time par pohanchay aur safai se AC repair kiya.)"
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
