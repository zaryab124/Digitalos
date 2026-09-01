import React from "react";
import { getSelectedCity } from "@/lib/city";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpportunitiesClient from "./OpportunitiesClient";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const activeCity = await getSelectedCity();
  const user = await getCurrentUser();

  const opportunities = await prisma.opportunity.findMany({
    where: { cityId: activeCity.id, status: "APPROVED" },
    include: {
      applications: user
        ? {
            where: { student: { userId: user.id } },
            select: { id: true, status: true },
          }
        : false,
    },
    orderBy: [{ applicationDeadline: "asc" }, { createdAt: "desc" }],
  });

  const studentProfile = user
    ? await prisma.studentProfile.findUnique({
        where: { userId: user.id },
      })
    : null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div>
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold uppercase tracking-wider">
          💼 Verified Opportunities • {activeCity.name}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Scholarships, Jobs & Internships (مواقع اور وظائف)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-urdu">
          جنوبی پنجاب کے طلباء کیلئے مصدقہ اسکالرشپس، انٹرن شپس، ٹریننگ کورسز اور مقامی ملازمتیں
        </p>
      </div>

      <OpportunitiesClient
        activeCity={activeCity}
        user={user}
        initialOpportunities={opportunities}
        studentProfile={studentProfile}
      />
    </div>
  );
}
