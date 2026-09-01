import React from "react";
import { getSelectedCity } from "@/lib/city";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentProfileClient from "./StudentProfileClient";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage() {
  const activeCity = await getSelectedCity();
  const user = await getCurrentUser();

  const profile = user
    ? await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        include: {
          city: true,
          applications: {
            include: { opportunity: true },
            orderBy: { appliedAt: "desc" },
          },
          listings: { orderBy: { createdAt: "desc" } },
        },
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div>
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold uppercase tracking-wider">
          🎓 Student Digital Resume • {activeCity.name}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Student Profile & Applications (طالب علم پروفائل)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-urdu">
          اپنی تعلیمی اسناد، مہارتیں اور جمع کردہ درخواستوں کی تفصیلات سنبھالیں
        </p>
      </div>

      <StudentProfileClient
        activeCity={activeCity}
        user={user}
        initialProfile={profile}
      />
    </div>
  );
}
