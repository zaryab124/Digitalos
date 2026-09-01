"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  DollarSign,
  Phone,
  Send,
  XCircle,
  ExternalLink,
  Power,
  Sparkles,
} from "lucide-react";
import { formatPKR, formatPhoneNumber } from "@/lib/utils";

interface ProviderDashboardClientProps {
  user: { id: string; fullName: string; phoneNumber: string };
  provider: any;
  availableLeads: any[];
}

export default function ProviderDashboardClient({
  user,
  provider,
  availableLeads,
}: ProviderDashboardClientProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"leads" | "active" | "quotes" | "reviews">("leads");

  // Quote Submission Modal
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteArrival, setQuoteArrival] = useState("Within 45 minutes");
  const [quoteDuration, setQuoteDuration] = useState("1-2 hours");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Status Action Loading
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Toggle Availability
  const handleToggleAvailability = async () => {
    try {
      const res = await fetch("/api/v1/providers/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !provider.isAvailable }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert("Failed to toggle status.");
    }
  };

  // Submit Quotation
  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteError(null);
    setIsSubmittingQuote(true);

    const priceNum = parseFloat(quoteAmount);
    if (isNaN(priceNum) || priceNum <= 0) {
      setQuoteError("Please enter a valid price offer.");
      setIsSubmittingQuote(false);
      return;
    }

    try {
      const res = await fetch(`/api/v1/service-requests/${selectedLead.id}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimatedAmount: priceNum,
          estimatedArrival: quoteArrival,
          estimatedDuration: quoteDuration,
          notes: quoteNotes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setQuoteError(data.error?.message || "Failed to submit quote.");
        setIsSubmittingQuote(false);
        return;
      }

      setSelectedLead(null);
      setQuoteAmount("");
      setQuoteNotes("");
      router.refresh();
    } catch {
      setQuoteError("Network error.");
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  // Update Assigned Job Status
  const handleUpdateJobStatus = async (requestId: string, newStatus: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/v1/service-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert("Failed to update status.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const activeAssignedJobs = provider.assignedJobs.filter(
    (j: any) => j.status === "ASSIGNED" || j.status === "IN_PROGRESS"
  );

  return (
    <div className="space-y-6">
      {/* Verification State Warning */}
      {provider.status === "PENDING" && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-extrabold uppercase">
                  STATUS: PENDING VERIFICATION
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Government CNIC Check in Progress
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-urdu">
                آپ کا سروس پروفائل موصول ہو چکا ہے۔ مقامی انتظامیہ کی تصدیق کے بعد آپ گاہکوں کو قیمت کی پیشکش (کوٹیشنز) بھیج سکیں گے۔
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
            ⏳ Awaiting Admin Approval
          </span>
        </div>
      )}

      {/* Header Profile & Live Availability Switcher */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xl">
              {provider.primarySkill.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {user.fullName}
                </h2>
                {provider.isVerified && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    ✓ Verified Pro
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-amber-800">{provider.primarySkill}</p>
              <p className="text-xs text-slate-500">
                {provider.city.name} • Standard Visit Fee: {formatPKR(provider.baseVisitFee)}
              </p>
            </div>
          </div>

          {/* Online Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleAvailability}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all ${
                provider.isAvailable
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{provider.isAvailable ? "Online (Receiving Leads)" : "Offline (Busy)"}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500">Average Rating</span>
            <div className="flex items-center justify-center gap-1 mt-1 text-amber-500 font-bold text-lg">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{provider.ratingAverage.toFixed(1)}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500">Completed Jobs</span>
            <p className="font-bold text-lg text-slate-900 mt-1">
              {provider.jobsCompleted}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500">Total Earnings</span>
            <p className="font-bold text-lg text-emerald-700 mt-1">
              {formatPKR(provider.totalEarnings)}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500">Active Jobs</span>
            <p className="font-bold text-lg text-amber-600 mt-1">
              {activeAssignedJobs.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab("leads")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all shrink-0 ${
            activeTab === "leads"
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Available Leads in Jampur ({availableLeads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all shrink-0 ${
            activeTab === "active"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Active Assigned Jobs ({activeAssignedJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("quotes")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all shrink-0 ${
            activeTab === "quotes"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Submitted Quotes ({provider.quotes.length})</span>
        </button>
      </div>

      {/* TAB 1: AVAILABLE LEADS */}
      {activeTab === "leads" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                New Customer Repair Leads in {provider.city.name}
              </h3>
              <p className="text-xs text-slate-500 font-urdu">
                آپ کی مہارت سے متعلق شہریوں کی نئی درخواستیں
              </p>
            </div>
          </div>

          {availableLeads.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                No new unquoted leads right now. We will notify you when a new request is posted!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        {lead.urgency}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        📍 {lead.area}
                      </span>
                      <span className="text-xs text-slate-400">
                        • {new Date(lead.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900">
                      {lead.title}
                    </h4>

                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      {lead.description}
                    </p>

                    <p className="text-xs text-slate-500">
                      <strong>Customer:</strong> {lead.customer.fullName} • <strong>Location:</strong> {lead.addressLine}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        if (provider.status !== "APPROVED") {
                          alert("Your account is currently PENDING verification by Admin.");
                          return;
                        }
                        setSelectedLead(lead);
                      }}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Quote (قیمت بھیجیں)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE ASSIGNED JOBS */}
      {activeTab === "active" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100">
            Active Jobs Underway ({activeAssignedJobs.length})
          </h3>

          {activeAssignedJobs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No jobs currently in progress.
            </p>
          ) : (
            <div className="space-y-4">
              {activeAssignedJobs.map((job: any) => (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase">
                        {job.status}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Agreed Price: {formatPKR(job.finalPrice || 0)}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900">{job.title}</h4>
                    <p className="text-xs text-slate-600">{job.description}</p>

                    <div className="text-xs text-slate-600 pt-1">
                      <strong>Customer:</strong> {job.customer.fullName} ({job.customer.phoneNumber}) •{" "}
                      <strong>Address:</strong> {job.addressLine} ({job.area})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${job.customer.phoneNumber}`}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold flex items-center gap-1 text-slate-700 hover:bg-slate-100"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call Customer</span>
                    </a>

                    {job.status === "ASSIGNED" && (
                      <button
                        onClick={() => handleUpdateJobStatus(job.id, "IN_PROGRESS")}
                        disabled={isActionLoading}
                        className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl"
                      >
                        Start Work
                      </button>
                    )}

                    {job.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => handleUpdateJobStatus(job.id, "COMPLETED")}
                        disabled={isActionLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUBMITTED QUOTES */}
      {activeTab === "quotes" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100">
            Quotation History ({provider.quotes.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {provider.quotes.map((q: any) => (
              <div
                key={q.id}
                className="py-3.5 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{q.request.title}</h4>
                  <p className="text-slate-500">
                    Customer: {q.request.customer.fullName} • {q.estimatedArrival} ({q.estimatedDuration})
                  </p>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="font-black text-slate-900 block">
                      {formatPKR(q.estimatedAmount)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        q.status === "ACCEPTED"
                          ? "bg-emerald-100 text-emerald-800"
                          : q.status === "REJECTED"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>

                  <NextLink
                    href={`/services/requests/${q.requestId}`}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </NextLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Quote Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Submit Price Quote
              </h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-900">{selectedLead.title}</p>
              <p className="text-slate-600 line-clamp-2">{selectedLead.description}</p>
              <p className="text-slate-400">📍 {selectedLead.area}, {selectedLead.addressLine}</p>
            </div>

            {quoteError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs">
                {quoteError}
              </div>
            )}

            <form onSubmit={handleSubmitQuote} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Total Quote Offer (PKR) *
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Arrival Time *
                  </label>
                  <select
                    value={quoteArrival}
                    onChange={(e) => setQuoteArrival(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                  >
                    <option value="Within 30 minutes">Within 30 mins</option>
                    <option value="Within 1 hour">Within 1 hour</option>
                    <option value="Today Evening">Today Evening</option>
                    <option value="Tomorrow Morning">Tomorrow Morning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Job Duration *
                  </label>
                  <select
                    value={quoteDuration}
                    onChange={(e) => setQuoteDuration(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                  >
                    <option value="30-45 mins">30-45 mins</option>
                    <option value="1-2 hours">1-2 hours</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Warranty / تسلی
                </label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="e.g. Genuine parts with 1-month warranty. Nitrogen leak check included."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 text-xs font-bold border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl"
                >
                  {isSubmittingQuote ? "Sending..." : "Send Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
