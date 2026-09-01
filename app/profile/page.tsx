import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [cities, userReviews] = await Promise.all([
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.review.findMany({
      where: { userId: user.id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900">User Account Settings</h1>
        <p className="text-xs text-slate-500 font-urdu">
          پروفائل اور ترتیبات
        </p>
      </div>

      <ProfileClient
        user={user}
        cities={cities}
        reviews={userReviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
          business: {
            id: r.business.id,
            name: r.business.name,
            slug: r.business.slug,
          },
        }))}
      />
    </div>
  );
}
