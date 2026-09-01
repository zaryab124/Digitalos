import React from "react";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RequestDetailClient from "./RequestDetailClient";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect(`/auth/login?redirect=/services/requests/${id}`);
  }

  const request = await prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      city: true,
      customer: {
        select: { id: true, fullName: true, phoneNumber: true, avatarUrl: true },
      },
      assignedProvider: {
        include: {
          user: { select: { id: true, fullName: true, phoneNumber: true, avatarUrl: true } },
        },
      },
      quotes: {
        include: {
          provider: {
            include: {
              user: { select: { id: true, fullName: true, phoneNumber: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { estimatedAmount: "asc" },
      },
      review: true,
    },
  });

  if (!request) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <RequestDetailClient user={user} request={request} />
    </div>
  );
}
