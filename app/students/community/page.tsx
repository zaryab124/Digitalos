import React from "react";
import { getSelectedCity } from "@/lib/city";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentCommunityClient from "./StudentCommunityClient";

export const dynamic = "force-dynamic";

export default async function StudentCommunityPage() {
  const activeCity = await getSelectedCity();
  const user = await getCurrentUser();

  const groups = await prisma.studentGroup.findMany({
    where: { cityId: activeCity.id, isActive: true },
    orderBy: [{ memberCount: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div>
        <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold uppercase tracking-wider">
          👥 Study Circles & Community • {activeCity.name}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Peer Study Groups & Prep Circles (اسٹڈی سرکلز)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-urdu">
          ایم ڈی کیٹ، ای کیٹ، سی ایس ایس اور فری لانسنگ اسکلز کیلئے ہم خیال طلباء کا باہمی نیٹ ورک
        </p>
      </div>

      <StudentCommunityClient
        activeCity={activeCity}
        user={user}
        initialGroups={groups}
      />
    </div>
  );
}
