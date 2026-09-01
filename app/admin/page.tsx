import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || !isAdmin(user.roles)) {
    redirect("/auth/login?redirect=/admin");
  }

  // Fetch stats & records across Phase 1 + Phase 2 + Phase 3
  const [
    totalUsers,
    totalBusinesses,
    pendingCount,
    approvedCount,
    totalReviews,
    pendingReportsCount,
    pendingProvidersCount,
    pendingRidersCount,
    totalServiceRequests,
    totalOrdersCount,
    allBusinesses,
    allUsers,
    allCategories,
    allReports,
    allProviders,
    allServiceRequests,
    allRiders,
    allOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.business.count(),
    prisma.business.count({ where: { status: "PENDING" } }),
    prisma.business.count({ where: { status: "APPROVED" } }),
    prisma.review.count(),
    prisma.reviewReport.count({ where: { status: "PENDING" } }),
    prisma.serviceProvider.count({ where: { status: "PENDING" } }),
    prisma.deliveryRider.count({ where: { status: "PENDING" } }),
    prisma.serviceRequest.count(),
    prisma.order.count(),
    prisma.business.findMany({
      include: {
        city: true,
        category: true,
        owner: { select: { id: true, fullName: true, phoneNumber: true } },
        locations: true,
        _count: { select: { products: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      include: {
        city: true,
        roles: { include: { role: true } },
        _count: { select: { businesses: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.businessCategory.findMany({
      include: { _count: { select: { businesses: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.reviewReport.findMany({
      include: {
        reporter: { select: { id: true, fullName: true, phoneNumber: true } },
        review: {
          include: {
            business: { select: { id: true, name: true, slug: true } },
            user: { select: { id: true, fullName: true, phoneNumber: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceProvider.findMany({
      include: {
        user: { select: { id: true, fullName: true, phoneNumber: true, email: true } },
        city: true,
        _count: { select: { quotes: true, assignedJobs: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceRequest.findMany({
      include: {
        city: true,
        customer: { select: { id: true, fullName: true, phoneNumber: true } },
        assignedProvider: {
          include: { user: { select: { fullName: true } } },
        },
        _count: { select: { quotes: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.deliveryRider.findMany({
      include: {
        user: { select: { fullName: true, phoneNumber: true, email: true } },
        city: true,
        _count: { select: { assignedOrders: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      include: {
        business: { select: { name: true, phone: true } },
        customer: { select: { fullName: true, phoneNumber: true } },
        rider: { include: { user: { select: { fullName: true, phoneNumber: true } } } },
        items: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold mb-1">
          <span>🛡️ Central Command & Governance (Phase 1 + Phase 2 + Phase 3)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          City Administration Console
        </h1>
        <p className="text-xs text-slate-500 font-urdu">
          شہری انتظامیہ اور نظام کی نگرانی — دکانیں، کاریگر، رائڈرز اور کسٹمر آرڈرز
        </p>
      </div>

      <AdminClient
        stats={{
          totalUsers,
          totalBusinesses,
          pendingCount,
          approvedCount,
          totalReviews,
          pendingReportsCount,
          pendingProvidersCount,
          pendingRidersCount,
          totalServiceRequests,
          totalOrdersCount,
        }}
        businesses={allBusinesses.map((b) => ({
          id: b.id,
          name: b.name,
          nameUr: b.nameUr,
          slug: b.slug,
          status: b.status,
          isVerified: b.isVerified,
          isFeatured: b.isFeatured,
          phone: b.phone,
          city: b.city.name,
          category: b.category.name,
          owner: b.owner,
          location: b.locations[0]?.addressLine || "No address",
          area: b.locations[0]?.area || "City Center",
          productsCount: b._count.products,
          reviewsCount: b._count.reviews,
          ratingAverage: b.ratingAverage,
          createdAt: b.createdAt.toISOString(),
        }))}
        users={allUsers.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          fullNameUr: u.fullNameUr,
          phoneNumber: u.phoneNumber,
          email: u.email,
          city: u.city.name,
          isActive: u.isActive,
          createdAt: u.createdAt.toISOString(),
          roles: u.roles.map((r) => r.roleId),
          businessesCount: u._count.businesses,
        }))}
        categories={allCategories.map((c) => ({
          id: c.id,
          name: c.name,
          nameUr: c.nameUr,
          slug: c.slug,
          icon: c.icon,
          businessesCount: c._count.businesses,
        }))}
        reports={allReports.map((r) => ({
          id: r.id,
          reason: r.reason,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          reporter: r.reporter,
          review: r.review
            ? {
                id: r.review.id,
                rating: r.review.rating,
                comment: r.review.comment,
                business: r.review.business,
                author: r.review.user,
              }
            : null,
        }))}
        providers={allProviders.map((p) => ({
          id: p.id,
          userId: p.userId,
          fullName: p.user.fullName,
          phoneNumber: p.user.phoneNumber,
          email: p.user.email,
          city: p.city.name,
          categorySlug: p.categorySlug,
          primarySkill: p.primarySkill,
          cnicNumber: p.cnicNumber,
          experienceYears: p.experienceYears,
          baseVisitFee: p.baseVisitFee,
          status: p.status,
          isVerified: p.isVerified,
          isAvailable: p.isAvailable,
          ratingAverage: p.ratingAverage,
          reviewCount: p.reviewCount,
          jobsCompleted: p.jobsCompleted,
          totalEarnings: p.totalEarnings,
          createdAt: p.createdAt.toISOString(),
        }))}
        serviceRequests={allServiceRequests.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          categorySlug: s.categorySlug,
          urgency: s.urgency,
          status: s.status,
          city: s.city.name,
          customer: s.customer,
          assignedProvider: s.assignedProvider?.user?.fullName || null,
          quotesCount: s._count.quotes,
          createdAt: s.createdAt.toISOString(),
        }))}
        riders={allRiders.map((r) => ({
          id: r.id,
          userId: r.userId,
          fullName: r.user.fullName,
          phoneNumber: r.user.phoneNumber,
          email: r.user.email,
          city: r.city.name,
          vehicleType: r.vehicleType,
          vehicleNumber: r.vehicleNumber,
          cnicNumber: r.cnicNumber,
          status: r.status,
          isVerified: r.isVerified,
          isAvailable: r.isAvailable,
          deliveriesCompleted: r.deliveriesCompleted,
          totalEarnings: r.totalEarnings,
          ratingAverage: r.ratingAverage,
          createdAt: r.createdAt.toISOString(),
        }))}
        orders={allOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          totalAmount: o.totalAmount,
          deliveryFee: o.deliveryFee,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          deliveryAddress: o.deliveryAddress,
          deliveryArea: o.deliveryArea,
          customer: o.customer,
          business: o.business,
          rider: o.rider?.user?.fullName || null,
          itemsCount: o.items.length,
          createdAt: o.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
