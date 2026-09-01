import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MerchantSubscriptionClient from "./MerchantSubscriptionClient";

export const dynamic = "force-dynamic";

export default async function MerchantSubscriptionPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?redirect=/merchant/subscription");
  }

  const business = await prisma.business.findFirst({
    where: { ownerId: user.id },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        orderBy: { endDate: "desc" },
        take: 1,
      },
      products: { select: { id: true } },
      offers: { select: { id: true } },
    },
  });

  if (!business) {
    redirect("/business/register");
  }

  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: "asc" },
  });

  const activeSub = business.subscriptions[0] || null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
          💎 Merchant Subscriptions & Growth Tools
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Business Subscription Plans (کاروباری پلانز)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-urdu">
          اپنی دکان کی فروخت بڑھائیں، فیچرڈ لسٹنگ اور جدید اے آئی مارکیٹنگ ٹولز حاصل کریں
        </p>
      </div>

      <MerchantSubscriptionClient
        business={business}
        plans={plans}
        activeSub={activeSub}
      />
    </div>
  );
}
