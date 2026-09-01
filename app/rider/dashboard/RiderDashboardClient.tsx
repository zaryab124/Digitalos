"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  Power,
  Store,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
  TrendingUp,
  PackageCheck,
  Clock,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface RiderDashboardClientProps {
  rider: any;
  availableOrders: any[];
  assignedOrders: any[];
}

export default function RiderDashboardClient({
  rider,
  availableOrders,
  assignedOrders,
}: RiderDashboardClientProps) {
  const router = useRouter();

  const [isAvailable, setIsAvailable] = useState(rider.isAvailable);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Delivery Completion modal state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [deliveryPin, setDeliveryPin] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const activeDeliveries = assignedOrders.filter(
    (o) => o.status === "OUT_FOR_DELIVERY" || o.status === "READY_FOR_PICKUP"
  );
  const completedDeliveries = assignedOrders.filter(
    (o) => o.status === "DELIVERED" || o.status === "COMPLETED"
  );

  const handleToggleOnline = async () => {
    setIsTogglingStatus(true);
    try {
      const res = await fetch("/api/v1/riders/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAvailable(!isAvailable);
      }
    } catch {
      // Ignore
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleClaimOrder = async (orderId: string) => {
    try {
      const res = await fetch("/api/v1/riders/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error?.message || "Failed to claim order.");
        return;
      }

      router.refresh();
    } catch {
      alert("Network error.");
    }
  };

  const handleCompleteDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    setIsCompleting(true);
    setModalError(null);

    try {
      const res = await fetch(`/api/v1/orders/${selectedOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DELIVERED",
          deliveryPin: deliveryPin.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalError(data.error?.message || "Incorrect PIN or failed to complete.");
        setIsCompleting(false);
        return;
      }

      setSelectedOrderId(null);
      setDeliveryPin("");
      setIsCompleting(false);
      router.refresh();
    } catch {
      setModalError("Network error.");
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Status */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                rider.status === "APPROVED"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              Status: {rider.status}
            </span>
            <span className="text-xs text-slate-500">• {rider.city.name}</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900">
            Rider Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-urdu">
            گاڑی نمبر: {rider.vehicleNumber} ({rider.vehicleType})
          </p>
        </div>

        {/* Online/Offline Toggle */}
        <button
          onClick={handleToggleOnline}
          disabled={isTogglingStatus || rider.status !== "APPROVED"}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-extrabold text-xs transition-all shadow-sm ${
            isAvailable
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
              : "bg-slate-200 hover:bg-slate-300 text-slate-700"
          } disabled:opacity-50`}
        >
          <Power className="w-4 h-4" />
          <span>
            {isTogglingStatus
              ? "Updating..."
              : isAvailable
              ? "Status: ONLINE (Receiving Deliveries)"
              : "Status: OFFLINE (Tap to go Online)"}
          </span>
        </button>
      </div>

      {rider.status === "PENDING" && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">Rider Application Pending Approval</p>
            <p className="text-amber-800">
              The city admin will verify your CNIC and vehicle details shortly.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">Total Deliveries</span>
          <p className="text-2xl font-black text-slate-900">
            {rider.deliveriesCompleted}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">Total Rider Earnings</span>
          <p className="text-2xl font-black text-emerald-800">
            {formatPKR(rider.totalEarnings)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">Rating</span>
          <p className="text-2xl font-black text-amber-600">
            ★ {rider.ratingAverage || "5.0"}
          </p>
        </div>
      </div>

      {/* Active Deliveries Section */}
      {activeDeliveries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Active Deliveries in Progress ({activeDeliveries.length})</span>
          </h2>

          <div className="space-y-4">
            {activeDeliveries.map((order) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-3xl border-2 border-emerald-500 shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono font-black text-sm text-slate-900">
                      Order #{order.orderNumber}
                    </span>
                    <p className="text-xs text-emerald-800 font-bold">
                      Delivery Fee: {formatPKR(order.deliveryFee)} (Collect {formatPKR(order.totalAmount)} {order.paymentMethod})
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedOrderId(order.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Complete Delivery (Enter PIN)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Shop Pickup Info */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      1. Pickup Location
                    </span>
                    <p className="font-bold text-slate-900">{order.business.name}</p>
                    <p className="text-slate-600">{order.business.locations[0]?.addressLine}</p>
                    <a
                      href={`tel:${order.business.phone}`}
                      className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline pt-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Store: {order.business.phone}</span>
                    </a>
                  </div>

                  {/* Customer Dropoff Info */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      2. Dropoff Address
                    </span>
                    <p className="font-bold text-slate-900">{order.customer.fullName}</p>
                    <p className="text-slate-600">{order.deliveryAddress} ({order.deliveryArea})</p>
                    {order.deliveryNotes && (
                      <p className="text-amber-800 italic text-[11px]">Note: "{order.deliveryNotes}"</p>
                    )}
                    <a
                      href={`tel:${order.customer.phoneNumber}`}
                      className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline pt-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Customer: {order.customer.phoneNumber}</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Leads Queue (Ready for Pickup) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Available Orders to Claim in {rider.city.name} ({availableOrders.length})</span>
          </h2>
        </div>

        {availableOrders.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No unassigned pickup orders right now. Check back as new orders are placed.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {availableOrders.map((order) => (
              <div
                key={order.id}
                className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      #{order.orderNumber}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-slate-700">{order.business.name}</span>
                  </div>
                  <p className="text-slate-500">
                    To: {order.deliveryArea} — {order.items.length} Items ({formatPKR(order.totalAmount)})
                  </p>
                  <p className="text-emerald-800 font-black">
                    Delivery Earning: {formatPKR(order.deliveryFee)}
                  </p>
                </div>

                <button
                  onClick={() => handleClaimOrder(order.id)}
                  disabled={rider.status !== "APPROVED" || !isAvailable}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 disabled:opacity-40 transition-colors"
                >
                  Claim & Pick Up
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Delivery Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Verify Delivery PIN</span>
              </h3>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 font-urdu">
              گاہک سے ان کے فون پر موصول شدہ 4 ہندسوں کا پن کوڈ طلب کریں اور درج کریں:
            </p>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCompleteDelivery} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  value={deliveryPin}
                  onChange={(e) => setDeliveryPin(e.target.value)}
                  placeholder="e.g. 4821"
                  className="w-full text-center tracking-widest text-2xl font-mono font-black py-3 rounded-2xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCompleting || deliveryPin.length < 4}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50"
                >
                  {isCompleting ? "Verifying..." : "Verify & Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
