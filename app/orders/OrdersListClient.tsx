"use client";

import React from "react";
import NextLink from "next/link";
import {
  ShoppingBag,
  Store,
  Clock,
  ArrowRight,
  Truck,
  CheckCircle2,
  Package,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface OrdersListClientProps {
  orders: any[];
}

export default function OrdersListClient({ orders }: OrdersListClientProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Order Placed (زیر غور)",
          color: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "ACCEPTED":
      case "PREPARING":
        return {
          label: "Shop Preparing (تیار کیا جا رہا ہے)",
          color: "bg-blue-50 text-blue-800 border-blue-200",
        };
      case "READY_FOR_PICKUP":
        return {
          label: "Ready for Rider (پک اپ کیلئے تیار)",
          color: "bg-purple-50 text-purple-800 border-purple-200",
        };
      case "OUT_FOR_DELIVERY":
        return {
          label: "Out for Delivery (راستے میں ہے)",
          color: "bg-emerald-50 text-emerald-800 border-emerald-300 font-black animate-pulse",
        };
      case "DELIVERED":
      case "COMPLETED":
        return {
          label: "Delivered (مکمل ہو چکا)",
          color: "bg-slate-100 text-slate-800 border-slate-200",
        };
      case "CANCELLED":
        return {
          label: "Cancelled (منسوخ)",
          color: "bg-rose-50 text-rose-800 border-rose-200",
        };
      default:
        return { label: status, color: "bg-slate-100 text-slate-800 border-slate-200" };
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">No orders placed yet</h3>
        <p className="text-xs text-slate-400">
          Discover genuine pharmacies, groceries, and shops in Jampur to place an order.
        </p>
        <NextLink
          href="/marketplace"
          className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
        >
          Explore Marketplace
        </NextLink>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const badge = getStatusBadge(order.status);

        return (
          <div
            key={order.id}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-slate-900">
                    #{order.orderNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.business.name}</span>
                  <span>•</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-base font-black text-emerald-800">
                  {formatPKR(order.totalAmount)}
                </span>
                <p className="text-[10px] text-slate-400">
                  {order.paymentMethod} • {order.items.length} Items
                </p>
              </div>
            </div>

            {/* Preview Line Items */}
            <div className="text-xs text-slate-600 space-y-1">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.quantity}× {item.name}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatPKR(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer Link */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {order.rider && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rider: {order.rider.user.fullName}</span>
                </div>
              )}

              <NextLink
                href={`/orders/${order.id}`}
                className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                <span>Track & View Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NextLink>
            </div>
          </div>
        );
      })}
    </div>
  );
}
