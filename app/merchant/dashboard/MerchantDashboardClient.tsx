"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  Clock,
  BadgeCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  Package,
  Star,
  ShoppingBag,
  TrendingUp,
  Tag,
  Phone,
  Truck,
  Check,
  XCircle,
  Sparkles,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";
import MerchantAiCopilotModal from "@/components/MerchantAiCopilotModal";

interface MerchantDashboardClientProps {
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  businesses: any[];
}

export default function MerchantDashboardClient({
  businesses,
}: MerchantDashboardClientProps) {
  const router = useRouter();
  const [selectedBizIndex, setSelectedBizIndex] = useState(0);
  const currentBiz = businesses[selectedBizIndex] || businesses[0];

  const [activeTab, setActiveTab] = useState<"orders" | "catalog" | "offers" | "reviews">("orders");
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // New product modal state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [prodName, setProdName] = useState("");
  const [prodNameUr, setProdNameUr] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodComparePrice, setProdComparePrice] = useState("");
  const [prodUnit, setProdUnit] = useState("piece");
  const [prodStock, setProdStock] = useState("100");
  const [prodDesc, setProdDesc] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [prodError, setProdError] = useState<string | null>(null);

  // New Offer modal state
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [offerTitle, setOfferTitle] = useState("");
  const [offerTitleUr, setOfferTitleUr] = useState("");
  const [offerDiscount, setOfferDiscount] = useState("10");
  const [offerMinOrder, setOfferMinOrder] = useState("1000");
  const [offerDesc, setOfferDesc] = useState("");
  const [isSavingOffer, setIsSavingOffer] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  // Analytics calculation
  const allOrders = currentBiz.orders || [];
  const completedOrders = allOrders.filter(
    (o: any) => o.status === "DELIVERED" || o.status === "COMPLETED"
  );
  const grossRevenue = completedOrders.reduce((sum: number, o: any) => sum + o.subtotal, 0);
  const avgOrderValue = completedOrders.length > 0 ? grossRevenue / completedOrders.length : 0;

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error?.message || "Failed to update order status.");
        return;
      }

      router.refresh();
    } catch {
      alert("Network error.");
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdError(null);
    setIsSavingProduct(true);

    const priceNum = parseFloat(prodPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setProdError("Please enter a valid positive price.");
      setIsSavingProduct(false);
      return;
    }

    try {
      const res = await fetch(`/api/v1/businesses/${currentBiz.id}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prodName,
          nameUr: prodNameUr || undefined,
          price: priceNum,
          compareAtPrice: prodComparePrice ? parseFloat(prodComparePrice) : null,
          unit: prodUnit,
          stockQuantity: parseInt(prodStock) || 100,
          description: prodDesc || undefined,
          isAvailable: true,
          isDeliveryAvailable: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setProdError(data.error?.message || "Failed to add product.");
        setIsSavingProduct(false);
        return;
      }

      setIsAddProductOpen(false);
      setProdName("");
      setProdNameUr("");
      setProdPrice("");
      setProdComparePrice("");
      setProdDesc("");
      router.refresh();
    } catch {
      setProdError("Network error. Please try again.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfferError(null);
    setIsSavingOffer(true);

    try {
      const res = await fetch("/api/v1/marketplace/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: currentBiz.id,
          title: offerTitle,
          titleUr: offerTitleUr || undefined,
          discountPercentage: parseFloat(offerDiscount),
          minOrderAmount: parseFloat(offerMinOrder),
          description: offerDesc || undefined,
          isFeatured: true,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOfferError(data.error?.message || "Failed to create offer.");
        setIsSavingOffer(false);
        return;
      }

      setIsAddOfferOpen(false);
      setOfferTitle("");
      setOfferTitleUr("");
      setOfferDesc("");
      router.refresh();
    } catch {
      setOfferError("Network error.");
    } finally {
      setIsSavingOffer(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to remove this item from your catalog?")) return;

    try {
      const res = await fetch(
        `/api/v1/businesses/${currentBiz.id}/products/${productId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert("Failed to delete product.");
    }
  };

  if (!currentBiz) {
    return (
      <div className="bg-white p-8 rounded-3xl text-center space-y-3">
        <p className="text-sm font-semibold">No businesses found for your account.</p>
        <NextLink
          href="/business/register"
          className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Register a Business
        </NextLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Status */}
      {currentBiz.status === "PENDING" && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800">
                Storefront verification in progress by City Admin.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-xl">
            Awaiting Approval
          </span>
        </div>
      )}

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">Total Store Orders</span>
          <p className="text-2xl font-black text-slate-900">{allOrders.length}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">Delivered Revenue</span>
          <p className="text-2xl font-black text-emerald-800">{formatPKR(grossRevenue)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">Avg Order Value</span>
          <p className="text-2xl font-black text-slate-900">{formatPKR(avgOrderValue)}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">Rating</span>
          <div className="flex items-center gap-1 mt-1 text-amber-500 font-bold text-lg">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>{currentBiz.ratingAverage.toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-normal">({currentBiz.reviews.length})</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === "orders"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Customer Orders ({allOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === "catalog"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Catalog ({currentBiz.products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("offers")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === "offers"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Promotions & Deals ({currentBiz.offers?.length || 0})</span>
        </button>

        <button
          onClick={() => setIsCopilotOpen(true)}
          className="ml-auto px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-slate-900 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 hover:scale-105 transition-transform"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>AI Copilot Tools</span>
        </button>
      </div>

      {/* 1. ORDERS TAB */}
      {activeTab === "orders" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
              Incoming Customer Orders
            </h3>
          </div>

          {allOrders.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              No orders placed for this storefront yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 space-y-4">
              {allOrders.map((order: any) => (
                <div key={order.id} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">
                          #{order.orderNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Customer: {order.customer.fullName} ({order.customer.phoneNumber}) • {order.deliveryArea}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-base font-black text-emerald-800">
                        {formatPKR(order.totalAmount)}
                      </span>
                      <p className="text-[10px] text-slate-400">{order.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 space-y-1">
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

                  {/* Order Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {order.status === "PENDING" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, "PREPARING")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                      >
                        Accept & Prepare
                      </button>
                    )}

                    {order.status === "PREPARING" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, "READY_FOR_PICKUP")}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm"
                      >
                        Mark Ready for Rider Pickup
                      </button>
                    )}

                    <NextLink
                      href={`/orders/${order.id}`}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                    >
                      Track Order
                    </NextLink>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. CATALOG TAB */}
      {activeTab === "catalog" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
              Product & Inventory Catalog
            </h3>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {currentBiz.products.map((p: any) => (
              <div
                key={p.id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                  {p.nameUr && <p className="text-xs text-emerald-800 font-urdu">{p.nameUr}</p>}
                  <p className="text-[11px] text-slate-500">
                    Stock: {p.stockQuantity} {p.unit}s
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-bold text-sm text-slate-900">{formatPKR(p.price)}</span>
                    <span className="text-xs text-slate-400 block">/ {p.unit}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. OFFERS TAB */}
      {activeTab === "offers" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
              Promotional Offers & Discounts
            </h3>
            <button
              onClick={() => setIsAddOfferOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Deal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentBiz.offers?.map((offer: any) => (
              <div
                key={offer.id}
                className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1"
              >
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase">
                  {offer.discountPercentage}% OFF
                </span>
                <h4 className="font-bold text-sm text-slate-900">{offer.title}</h4>
                <p className="text-xs text-slate-500">Min Order: PKR {offer.minOrderAmount}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Add Product to Catalog</h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              {prodError && (
                <div className="p-3 rounded-xl bg-rose-50 text-xs text-rose-700 border border-rose-200">
                  {prodError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Longi Solar Panel 585W"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نام (اردو میں اختیاری)
                </label>
                <input
                  type="text"
                  value={prodNameUr}
                  onChange={(e) => setProdNameUr(e.target.value)}
                  placeholder="مثال: لونگی سولر پینل"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-urdu"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="2500"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="piece">piece (عدد)</option>
                    <option value="kg">kg (کلو)</option>
                    <option value="box">box (ڈبہ)</option>
                    <option value="meter">meter (میٹر)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Qty
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl disabled:opacity-50"
                >
                  {isSavingProduct ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Offer Modal */}
      {isAddOfferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Create Promotional Deal</h3>
              <button
                onClick={() => setIsAddOfferOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOffer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Offer Title *
                </label>
                <input
                  type="text"
                  required
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="e.g. Summer Special 15% OFF"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount % *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    required
                    value={offerDiscount}
                    onChange={(e) => setOfferDiscount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min Order (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={offerMinOrder}
                    onChange={(e) => setOfferMinOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOfferOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingOffer}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl disabled:opacity-50"
                >
                  {isSavingOffer ? "Creating..." : "Create Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* AI Copilot Modal */}
      <MerchantAiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        businessName={currentBiz.name}
        businessCategory={currentBiz.category?.slug || "general"}
      />
    </div>
  );
}
