import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Administrator access required." } },
      { status: 403 }
    );
  }

  try {
    const [
      totalUsers,
      totalBusinesses,
      approvedBusinesses,
      totalProviders,
      totalOrders,
      ordersList,
      totalRequests,
      activeSubs,
      farmerCount,
      opportunitiesCount,
      aiLogsCount,
      eventsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.business.count({ where: { status: "APPROVED" } }),
      prisma.serviceProvider.count({ where: { status: "APPROVED" } }),
      prisma.order.count(),
      prisma.order.findMany({ select: { totalAmount: true, status: true } }),
      prisma.serviceRequest.count(),
      prisma.businessSubscription.findMany({
        where: { status: "ACTIVE" },
        include: { plan: true },
      }),
      prisma.farmerProfile.count(),
      prisma.opportunity.count({ where: { status: "APPROVED" } }),
      prisma.aiInteractionLog.count(),
      prisma.analyticsEvent.count(),
    ]);

    const gmv = ordersList.reduce((sum, o) => sum + o.totalAmount, 0);
    const subscriptionRevenue = activeSubs.reduce((sum, s) => sum + s.amountPaid, 0);

    return NextResponse.json({
      success: true,
      data: {
        platform: {
          totalUsers,
          totalBusinesses,
          approvedBusinesses,
          pendingBusinesses: totalBusinesses - approvedBusinesses,
          totalProviders,
          totalServiceRequests: totalRequests,
          totalOrders,
          grossMerchandiseValuePKR: gmv,
          activePaidSubscriptions: activeSubs.length,
          totalSubscriptionRevenuePKR: subscriptionRevenue,
          totalFarmers: farmerCount,
          totalOpportunities: opportunitiesCount,
          totalAiQueries: aiLogsCount,
          totalTelemetryEvents: eventsCount,
        },
        subscriptionsBreakdown: activeSubs.map((s) => ({
          id: s.id,
          businessId: s.businessId,
          planName: s.plan.name,
          amountPaid: s.amountPaid,
          status: s.status,
          endDate: s.endDate,
        })),
      },
    });
  } catch (error) {
    console.error("Platform analytics error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to generate platform analytics." } },
      { status: 500 }
    );
  }
}
