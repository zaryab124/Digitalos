"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Flag, PenLine, MessageSquare, Trash2 } from "lucide-react";
import ReviewModal from "@/components/ReviewModal";
import ReportModal from "@/components/ReportModal";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    fullNameUr?: string | null;
  };
}

interface BusinessProfileClientProps {
  businessId: string;
  businessName: string;
  ratingAverage: number;
  reviewCount: number;
  ratingsCount: number[]; // [count1, count2, count3, count4, count5]
  reviews: ReviewItem[];
  currentUserId?: string;
}

export default function BusinessProfileClient({
  businessId,
  businessName,
  ratingAverage,
  reviewCount,
  ratingsCount,
  reviews,
  currentUserId,
}: BusinessProfileClientProps) {
  const router = useRouter();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setIsDeleting(reviewId);
    try {
      const res = await fetch(`/api/v1/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert("Failed to delete review.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6">
      {/* Reviews Summary Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>Customer Reviews & Ratings ({reviewCount})</span>
          </h2>
          <p className="text-xs text-slate-500 font-urdu">
            صارفین کی تصدیق شدہ آراء اور ریٹنگ
          </p>
        </div>

        <button
          onClick={() => setIsReviewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
        >
          <PenLine className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Ratings Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-center">
        {/* Score Column */}
        <div className="text-center md:border-r border-slate-200 md:pr-6 space-y-1">
          <span className="text-4xl font-extrabold text-slate-900">
            {ratingAverage.toFixed(1)}
          </span>
          <div className="flex items-center justify-center gap-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  Math.round(ratingAverage) >= star
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 block">
            Based on {reviewCount} verified reviews
          </span>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="md:col-span-2 space-y-1.5 text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingsCount[stars - 1] || 0;
            const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="w-12 text-slate-600 font-semibold">{stars} star</span>
                <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-slate-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-sm font-semibold text-slate-700">No reviews yet</p>
            <p className="text-xs text-slate-400">
              Be the first customer to share your experience with this business!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-2xl border border-slate-100 bg-white space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    {review.user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {review.user.fullName}
                    </h4>
                    {review.user.fullNameUr && (
                      <span className="text-[10px] text-emerald-800 font-urdu block">
                        {review.user.fullNameUr}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          review.rating >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Actions (Report / Delete) */}
                  <button
                    onClick={() => setReportingReviewId(review.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Report inappropriate review"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-sans pt-1">
                {review.comment}
              </p>

              <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400 border-t border-slate-50">
                <span>
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-emerald-700 font-medium">Verified Customer</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        businessId={businessId}
        businessName={businessName}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      {/* Report Modal */}
      {reportingReviewId && (
        <ReportModal
          reviewId={reportingReviewId}
          isOpen={!!reportingReviewId}
          onClose={() => setReportingReviewId(null)}
        />
      )}
    </div>
  );
}
