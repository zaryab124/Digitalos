import React from "react";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrderDetailClient from "./OrderDetailClient";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      business: {
        include: {
          locations: true,
          owner: { select: { fullName: true, phoneNumber: true } },
        },
      },
      customer: { select: { id: true, fullName: true, phoneNumber: true } },
      rider: {
        include: {
          user: { select: { fullName: true, phoneNumber: true, avatarUrl: true } },
        },
      },
      items: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true } },
        },
      },
      payment: true,
      review: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Access control
  const isCustomer = user.id === order.customerId;
  const isMerchant = user.id === order.business.ownerId;
  const isAssignedRider = order.rider && order.rider.userId === user.id;
  const isAdminUser = user.roles.includes("ADMIN") || user.roles.includes("SUPER_ADMIN");

  if (!isCustomer && !isMerchant && !isAssignedRider && !isAdminUser) {
    redirect("/orders");
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <OrderDetailClient
        order={order}
        currentUser={{ id: user.id, roles: user.roles }}
      />
    </div>
  );
}
