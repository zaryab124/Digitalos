import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrdersListClient from "./OrdersListClient";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/orders");
  }

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    include: {
      business: { select: { id: true, name: true, phone: true } },
      items: true,
      rider: { include: { user: { select: { fullName: true, phoneNumber: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          My Orders & Deliveries
        </h1>
        <p className="text-xs text-slate-500 font-urdu">
          آپ کے تمام آن لائن آرڈرز اور ترسیل کا ریکارڈ
        </p>
      </div>

      <OrdersListClient orders={orders} />
    </div>
  );
}
