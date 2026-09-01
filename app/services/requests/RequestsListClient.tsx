"use client";

import React from "react";
import NextLink from "next/link";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface RequestsListClientProps {
  requests: any[];
}

export default function RequestsListClient({ requests }: RequestsListClientProps) {
  if (requests.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">
            No Service Requests Posted Yet
          </h3>
          <p className="text-xs text-slate-500 font-urdu">
            آپ نے ابھی تک کوئی سروس کی درخواست درج نہیں کی۔
          </p>
        </div>
        <NextLink
          href="/services/request"
          className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md"
        >
          Post Your First Request
        </NextLink>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase">
            OPEN FOR QUOTES
          </span>
        );
      case "QUOTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase animate-pulse">
            QUOTES RECEIVED
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase">
            TECHNICIAN ASSIGNED
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-extrabold uppercase">
            WORK IN PROGRESS
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
            COMPLETED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase">
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <NextLink
          key={req.id}
          href={`/services/requests/${req.id}`}
          className="block bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                {getStatusBadge(req.status)}
                <span className="text-xs text-slate-400">
                  {new Date(req.createdAt).toLocaleDateString("en-PK", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  • 📍 {req.area}, {req.city.name}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
                {req.title}
              </h3>

              <p className="text-xs text-slate-600 line-clamp-1">
                {req.description}
              </p>

              {/* Status context */}
              {req.status === "QUOTED" && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 pt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{req.quotes.length} technician(s) submitted quotes for this job!</span>
                </div>
              )}

              {req.assignedProvider && (
                <div className="text-xs text-slate-600 pt-1">
                  <strong>Assigned Tech:</strong> {req.assignedProvider.user.fullName} (
                  {formatPKR(req.finalPrice || 0)})
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                <span>View Quotes & Details</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </NextLink>
      ))}
    </div>
  );
}
