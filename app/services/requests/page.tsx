import React from "react";
import { redirect } from "next/navigation";
import NextLink from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RequestsListClient from "./RequestsListClient";

export const dynamic = "force-dynamic";

export default async function CustomerRequestsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/services/requests");
  }

  const requests = await prisma.serviceRequest.findMany({
    where: { customerId: user.id },
    include: {
      city: true,
      quotes: {
        include: {
          provider: {
            include: {
              user: { select: { fullName: true, phoneNumber: true } },
            },
          },
        },
        orderBy: { estimatedAmount: "asc" },
      },
      assignedProvider: {
        include: {
          user: { select: { fullName: true, phoneNumber: true } },
        },
      },
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Service Requests
          </h1>
          <p className="text-xs text-slate-500 font-urdu">
            آپ کی درج شدہ مرمت اور سروس کی درخواستیں
          </p>
        </div>

        <NextLink
          href="/services/request"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-transform active:scale-95"
        >
          <span>+ Post New Request</span>
        </NextLink>
      </div>

      <RequestsListClient requests={requests} />
    </div>
  );
}
