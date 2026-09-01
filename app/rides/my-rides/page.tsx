import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MyRidesClient from "./MyRidesClient";

export const dynamic = "force-dynamic";

export default async function MyRidesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/rides/my-rides");
  }

  const rides = await prisma.rideBooking.findMany({
    where: { customerId: user.id },
    include: {
      rider: {
        include: {
          user: { select: { fullName: true, phoneNumber: true, avatarUrl: true } },
        },
      },
      city: true,
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <MyRidesClient initialRides={rides} user={user} />
    </div>
  );
}
