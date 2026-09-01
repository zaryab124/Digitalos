import React from "react";
import { getSelectedCity } from "@/lib/city";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentDashboardClient from "./StudentDashboardClient";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const activeCity = await getSelectedCity();
  const user = await getCurrentUser();

  const [opportunities, listings, groups, studentProfile] = await Promise.all([
    prisma.opportunity.findMany({
      where: { cityId: activeCity.id, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.studentListing.findMany({
      where: { cityId: activeCity.id, status: "ACTIVE" },
      include: {
        student: {
          include: { user: { select: { fullName: true, phoneNumber: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.studentGroup.findMany({
      where: { cityId: activeCity.id, isActive: true },
      orderBy: { memberCount: "desc" },
      take: 3,
    }),
    user
      ? prisma.studentProfile.findUnique({
          where: { userId: user.id },
          include: {
            applications: { include: { opportunity: true } },
            listings: true,
          },
        })
      : null,
  ]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold uppercase tracking-wider">
            🎓 Youth & Student Ecosystem • {activeCity.name}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Talib-e-Ilm Hub (طالب علم پورٹل)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-urdu">
            مصدقہ وظائف، انٹرن شپس، مقامی ملازمتیں، پرانی کتب مارکیٹ اور اسٹڈی سرکلز
          </p>
        </div>
      </div>

      <StudentDashboardClient
        activeCity={activeCity}
        user={user}
        opportunities={opportunities}
        listings={listings}
        groups={groups}
        studentProfile={studentProfile}
      />
    </div>
  );
}
