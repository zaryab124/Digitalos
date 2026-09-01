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
    const cities = await prisma.city.findMany({
      orderBy: { name: "asc" },
      include: {
        areas: { select: { id: true } },
      },
    });

    const analytics = await Promise.all(
      cities.map(async (city) => {
        const [
          approvedBusinesses,
          pendingBusinesses,
          productsCount,
          approvedProviders,
          serviceRequestsCount,
          orders,
          ridersCount,
          farmersCount,
          opportunitiesCount,
          studentListingsCount,
        ] = await Promise.all([
          prisma.business.count({ where: { cityId: city.id, status: "APPROVED" } }),
          prisma.business.count({ where: { cityId: city.id, status: "PENDING" } }),
          prisma.product.count({ where: { business: { cityId: city.id } } }),
          prisma.serviceProvider.count({ where: { cityId: city.id, status: "APPROVED" } }),
          prisma.serviceRequest.count({ where: { cityId: city.id } }),
          prisma.order.findMany({
            where: { cityId: city.id },
            select: { totalAmount: true, status: true },
          }),
          prisma.deliveryRider.count({ where: { cityId: city.id, status: "APPROVED" } }),
          prisma.farmerProfile.count({ where: { cityId: city.id } }),
          prisma.opportunity.count({ where: { cityId: city.id, status: "APPROVED" } }),
          prisma.studentListing.count({ where: { cityId: city.id, status: "ACTIVE" } }),
        ]);

        const gmv = orders.reduce((sum, o) => sum + o.totalAmount, 0);

        return {
          id: city.id,
          name: city.name,
          nameUr: city.nameUr,
          slug: city.slug,
          division: city.division,
          district: city.district,
          areasCount: city.areas.length,
          isActive: city.isActive,
          businesses: {
            approved: approvedBusinesses,
            pending: pendingBusinesses,
            total: approvedBusinesses + pendingBusinesses,
          },
          productsCount,
          services: {
            providers: approvedProviders,
            requests: serviceRequestsCount,
          },
          commerce: {
            ordersCount: orders.length,
            gmvPKR: gmv,
          },
          ridersCount,
          agriculture: {
            farmersCount,
          },
          students: {
            opportunitiesCount,
            marketplaceListingsCount: studentListingsCount,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: { analytics },
    });
  } catch (error) {
    console.error("Multi-city analytics error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to generate multi-city analytics." } },
      { status: 500 }
    );
  }
}
