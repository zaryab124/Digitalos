"use client";

import React, { useState } from "react";
import { Star, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface ReviewModalProps {
  businessId: string;
  businessName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({
  businessId,
  businessName,
  isOpen,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!comment.trim() || comment.trim().length < 3) {
      setError("Please write at least 3 characters in your review comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/businesses/${businessId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 401) {
          setError("You must be logged in to post a review. Please sign in.");
        } else {
          setError(data.error?.message || "Failed to submit review.");
        }
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg("Review submitted successfully! Thank you.");
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
        onClose();
      }, 1200);
    } catch {
      setError("A network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Write a Review</h3>
            <p className="text-xs text-slate-500 truncate max-w-[280px]">
              {businessName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Star Selection */}
          <div className="flex flex-col items-center justify-center py-2 space-y-1">
            <span className="text-xs font-semibold text-slate-600">Your Rating</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-2xl focus:outline-none transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        isFilled
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 fill-slate-100"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-amber-600">
              {rating === 5 && "⭐ Excellent (بہترین)"}
              {rating === 4 && "⭐ Very Good (بہت اچھا)"}
              {rating === 3 && "⭐ Good (اچھا)"}
              {rating === 2 && "⭐ Fair (مناسب)"}
              {rating === 1 && "⭐ Poor (خراب)"}
            </span>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Feedback (English, اردو یا سرائیکی)
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience regarding customer service, pricing, and product quality..."
              className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              maxLength={1000}
            />
            <span className="text-[10px] text-slate-400 float-right">
              {comment.length}/1000
            </span>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md shadow-emerald-600/20"
            >
              {isSubmitting ? "Submitting..." : "Post Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
