import React from "react";
import { getSelectedCity } from "@/lib/city";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentMarketplaceClient from "./StudentMarketplaceClient";

export const dynamic = "force-dynamic";

export default async function StudentMarketplacePage() {
  const activeCity = await getSelectedCity();
  const user = await getCurrentUser();

  const listings = await prisma.studentListing.findMany({
    where: { cityId: activeCity.id, status: "ACTIVE" },
    include: {
      student: {
        include: { user: { select: { fullName: true, phoneNumber: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const studentProfile = user
    ? await prisma.studentProfile.findUnique({
        where: { userId: user.id },
      })
    : null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
          📚 Student Marketplace • {activeCity.name}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Used Books, Notes & Devices (طالب علم بازار)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-urdu">
          پرانی کتابیں، گائیڈ بکس، سائنسی کیلکولیٹر اور ہاتھ سے لکھے نوٹس سستے داموں خریدیں یا بیچیں
        </p>
      </div>

      <StudentMarketplaceClient
        activeCity={activeCity}
        user={user}
        initialListings={listings}
        studentProfile={studentProfile}
      />
    </div>
  );
}
