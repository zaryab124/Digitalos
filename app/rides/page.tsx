import React from "react";
import { getSelectedCity, getAllActiveCities } from "@/lib/city";
import { prisma } from "@/lib/prisma";
import RidesHubClient from "./RidesHubClient";

export const dynamic = "force-dynamic";

export default async function RidesHubPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; category?: string }>;
}) {
  const { type, category } = await searchParams;
  const [activeCity, cities] = await Promise.all([
    getSelectedCity(),
    getAllActiveCities(),
  ]);

  // Fetch verified active drivers in this city
  const drivers = await prisma.deliveryRider.findMany({
    where: {
      cityId: activeCity.id,
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
      rideReviews: {
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { fullName: true } } },
      },
    },
    orderBy: [{ isAvailable: "desc" }, { ratingAverage: "desc" }],
  });

  // Fetch localized areas in city
  const areas = await prisma.area.findMany({
    where: { cityId: activeCity.id, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <RidesHubClient
        activeCity={activeCity}
        cities={cities}
        areas={areas}
        drivers={drivers}
        initialType={type || "ride"}
        initialCategory={category || "ALL"}
      />
    </div>
  );
}
