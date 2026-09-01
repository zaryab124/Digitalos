import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RiderProfileClient from "./RiderProfileClient";

export const dynamic = "force-dynamic";

export default async function RiderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const driver = await prisma.deliveryRider.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          fullNameUr: true,
          phoneNumber: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
      city: true,
      rideReviews: {
        include: {
          customer: { select: { fullName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!driver) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <RiderProfileClient driver={driver} />
    </div>
  );
}
