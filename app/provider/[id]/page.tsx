import React from "react";
import { notFound } from "next/navigation";
import NextLink from "next/link";
import {
  Wrench,
  BadgeCheck,
  Star,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProviderPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const provider = await prisma.serviceProvider.findFirst({
    where: {
      OR: [{ id }, { userId: id }],
      status: "APPROVED",
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          fullNameUr: true,
          phoneNumber: true,
          avatarUrl: true,
        },
      },
      city: true,
      reviews: {
        include: {
          customer: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!provider) {
    notFound();
  }

  const secondarySkills = JSON.parse(provider.secondarySkills || "[]");
  const serviceAreas = JSON.parse(provider.serviceAreas || "[]");

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 font-black text-2xl flex items-center justify-center shadow-inner">
              {provider.user.fullName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {provider.user.fullName}
                </h1>
                {provider.isVerified && (
                  <BadgeCheck className="w-5 h-5 fill-emerald-600 text-white" />
                )}
              </div>

              {provider.user.fullNameUr && (
                <p className="text-sm text-emerald-800 font-urdu">{provider.user.fullNameUr}</p>
              )}

              <p className="text-sm font-bold text-amber-800 flex items-center gap-1 mt-0.5">
                <Wrench className="w-4 h-4" />
                <span>{provider.primarySkill}</span>
              </p>
              <p className="text-xs text-slate-500">{provider.city.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`tel:${provider.user.phoneNumber}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call</span>
            </a>

            <NextLink
              href={`/services/request?category=${provider.categorySlug}&technicianId=${provider.id}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-extrabold text-xs text-slate-950 shadow-md shadow-amber-500/20"
            >
              <span>Hire Technician</span>
            </NextLink>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500">Rating</span>
            <div className="flex items-center justify-center gap-1 mt-1 text-amber-500 font-bold text-lg">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{provider.ratingAverage.toFixed(1)}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500">Experience</span>
            <p className="font-bold text-lg text-slate-900 mt-1">
              {provider.experienceYears} Years
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500">Jobs Completed</span>
            <p className="font-bold text-lg text-slate-900 mt-1">
              {provider.jobsCompleted}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500">Inspection Fee</span>
            <p className="font-bold text-lg text-emerald-700 mt-1">
              {formatPKR(provider.baseVisitFee)}
            </p>
          </div>
        </div>

        {/* Skills & Areas */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Specializations & Technical Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {secondarySkills.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
          Customer Reviews ({provider.reviews.length})
        </h3>

        {provider.reviews.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No reviews submitted for this technician yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {provider.reviews.map((r) => (
              <div key={r.id} className="py-4 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{r.customer.fullName}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{r.rating} / 5</span>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed">&quot;{r.comment}&quot;</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
