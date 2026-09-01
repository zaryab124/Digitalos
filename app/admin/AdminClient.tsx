"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Star,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  Check,
  Ban,
  Wrench,
  Clock,
  Truck,
  ShoppingBag,
  Power,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface AdminClientProps {
  stats: {
    totalUsers: number;
    totalBusinesses: number;
    pendingCount: number;
    approvedCount: number;
    totalReviews: number;
    pendingReportsCount: number;
    pendingProvidersCount: number;
    pendingRidersCount: number;
    totalServiceRequests: number;
    totalOrdersCount: number;
  };
  businesses: any[];
  users: any[];
  categories: any[];
  reports: any[];
  providers: any[];
  serviceRequests: any[];
  riders: any[];
  orders: any[];
}

export default function AdminClient({
  stats,
  businesses,
  users,
  categories,
  reports,
  providers,
  serviceRequests,
  riders,
  orders,
}: AdminClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "pending" | "providers" | "riders" | "orders" | "all-businesses" | "users" | "reports"
  >("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleUpdateStatus = async (bizId: string, status: string) => {
    setActionLoading(bizId);
    try {
      const res = await fetch(`/api/v1/admin/businesses/${bizId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert("Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateProviderStatus = async (providerId: string, status: string) => {
    setActionLoading(providerId);
    try {
      const res = await fetch("/api/v1/admin/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, status, isVerified: status === "APPROVED" }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert("Failed to update provider status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateRiderStatus = async (riderId: string, status: string) => {
    setActionLoading(riderId);
    try {
      const res = await fetch("/api/v1/admin/riders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riderId, status, isVerified: status === "APPROVED" }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert("Failed to update rider status.");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingBusinesses = businesses.filter((b) => b.status === "PENDING");
  const pendingProviders = providers.filter((p) => p.status === "PENDING");
  const pendingRiders = riders.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-6">
      {/* Overview Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500">Registered Users</span>
          <p className="text-xl font-extrabold text-slate-900">{stats.totalUsers}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-700">Pending Shops</span>
          <p className="text-xl font-extrabold text-amber-700">{stats.pendingCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-700">Pending Artisans</span>
          <p className="text-xl font-extrabold text-amber-700">{stats.pendingProvidersCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-700">Pending Riders</span>
          <p className="text-xl font-extrabold text-amber-700">{stats.pendingRidersCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-700">Customer Orders</span>
          <p className="text-xl font-extrabold text-emerald-700">{stats.totalOrdersCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-indigo-700">Service Requests</span>
          <p className="text-xl font-extrabold text-indigo-700">{stats.totalServiceRequests}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "pending"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Pending Shops ({pendingBusinesses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("providers")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "providers"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Artisans & Technicians ({providers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("riders")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "riders"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Delivery Fleet ({riders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "orders"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Customer Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("all-businesses")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "all-businesses"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          All Shops ({businesses.length})
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "users"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Users ({users.length})
        </button>
      </div>

      {/* TAB 1: PENDING BUSINESSES */}
      {activeTab === "pending" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
            Shop Verification Queue ({pendingBusinesses.length})
          </h3>

          {pendingBusinesses.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No pending shops awaiting review.</p>
          ) : (
            <div className="divide-y divide-slate-100 space-y-4">
              {pendingBusinesses.map((biz) => (
                <div key={biz.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <h4 className="font-extrabold text-sm text-slate-900">{biz.name}</h4>
                    <p className="text-slate-500">Category: {biz.category} • {biz.city} ({biz.area})</p>
                    <p className="text-slate-500">Owner: {biz.owner.fullName} ({biz.owner.phoneNumber})</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleUpdateStatus(biz.id, "APPROVED")}
                      disabled={actionLoading === biz.id}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Approve & Verify
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(biz.id, "REJECTED")}
                      disabled={actionLoading === biz.id}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ARTISANS & PROVIDERS */}
      {activeTab === "providers" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
            Technicians & Artisans Moderation ({providers.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {providers.map((p) => (
              <div key={p.id} className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900">{p.fullName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === "APPROVED" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-slate-600">Skill: <strong>{p.primarySkill}</strong> • CNIC: {p.cnicNumber}</p>
                  <p className="text-slate-500">City: {p.city} • Fee: PKR {p.baseVisitFee} • Rating: ★ {p.ratingAverage}</p>
                </div>

                <div className="flex items-center gap-2">
                  {p.status !== "APPROVED" && (
                    <button
                      onClick={() => handleUpdateProviderStatus(p.id, "APPROVED")}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                  )}
                  {p.status === "APPROVED" && (
                    <button
                      onClick={() => handleUpdateProviderStatus(p.id, "SUSPENDED")}
                      className="px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs hover:bg-amber-200"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DELIVERY FLEET */}
      {activeTab === "riders" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
            Delivery Rider Fleet ({riders.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {riders.map((r) => (
              <div key={r.id} className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900">{r.fullName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === "APPROVED" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                    }`}>
                      {r.status}
                    </span>
                    {r.isAvailable && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase">
                        ONLINE
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600">
                    Vehicle: <strong>{r.vehicleType}</strong> ({r.vehicleNumber}) • Phone: {r.phoneNumber}
                  </p>
                  <p className="text-slate-500">
                    CNIC: {r.cnicNumber} • City: {r.city} • Completed: {r.deliveriesCompleted} • Earnings: {formatPKR(r.totalEarnings)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {r.status !== "APPROVED" && (
                    <button
                      onClick={() => handleUpdateRiderStatus(r.id, "APPROVED")}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                    >
                      Approve & Verify
                    </button>
                  )}
                  {r.status === "APPROVED" && (
                    <button
                      onClick={() => handleUpdateRiderStatus(r.id, "SUSPENDED")}
                      className="px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs hover:bg-amber-200"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS MONITOR */}
      {activeTab === "orders" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
            Cross-City Customer Orders Monitor ({orders.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {orders.map((o) => (
              <div key={o.id} className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">#{o.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-800 text-[10px]">
                      {o.status}
                    </span>
                  </div>
                  <p className="text-slate-600">Store: <strong>{o.business.name}</strong> • Customer: {o.customer.fullName} ({o.customer.phoneNumber})</p>
                  <p className="text-slate-500">Destination: {o.deliveryArea} • Payment: {o.paymentMethod} ({formatPKR(o.totalAmount)})</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">
                    {o.rider ? `Rider: ${o.rider}` : "Unassigned"}
                  </span>
                  <NextLink
                    href={`/orders/${o.id}`}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                  >
                    View
                  </NextLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ALL SHOPS */}
      {activeTab === "all-businesses" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
            All Registered Businesses ({businesses.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {businesses.map((biz) => (
              <div key={biz.id} className="py-3 flex items-center justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{biz.name}</h4>
                  <p className="text-slate-500">{biz.category} • {biz.city} • Status: {biz.status}</p>
                </div>
                <NextLink href={`/business/${biz.id}`} className="text-emerald-700 font-bold hover:underline">
                  Storefront →
                </NextLink>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: USERS */}
      {activeTab === "users" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
            Platform Users ({users.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{u.fullName}</h4>
                  <p className="text-slate-500 font-mono">{u.phoneNumber} • {u.city}</p>
                </div>
                <div className="flex gap-1">
                  {u.roles.map((r: string) => (
                    <span key={r} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
