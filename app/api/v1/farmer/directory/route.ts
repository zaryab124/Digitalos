import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const citySlug = searchParams.get("city") || "jampur";
  const filter = searchParams.get("filter"); // all, fertilizer, seeds, machinery, veterinary

  try {
    const city = await prisma.city.findFirst({
      where: { slug: citySlug, isActive: true },
    });

    if (!city) {
      return NextResponse.json(
        { success: false, error: { code: "CITY_NOT_FOUND", message: "City not found." } },
        { status: 404 }
      );
    }

    // 1. Fetch Agricultural Businesses (Fertilizer, Seed, Machinery)
    const businesses = await prisma.business.findMany({
      where: {
        cityId: city.id,
        status: "APPROVED",
        OR: [
          { category: { slug: "agriculture" } },
          { category: { slug: "hardware" } },
          { name: { contains: "Khad" } },
          { name: { contains: "Seed" } },
          { name: { contains: "Solar" } },
          { name: { contains: "Zari" } },
        ],
      },
      include: {
        category: true,
        locations: true,
      },
      orderBy: [{ ratingAverage: "desc" }],
    });

    // 2. Fetch Agri & Veterinary Specialists
    const providers = await prisma.serviceProvider.findMany({
      where: {
        cityId: city.id,
        status: "APPROVED",
        OR: [
          { categorySlug: "hardware" },
          { primarySkill: { contains: "Solar" } },
          { primarySkill: { contains: "Motor" } },
          { primarySkill: { contains: "Doctor" } },
          { primarySkill: { contains: "Vet" } },
        ],
      },
      include: {
        user: { select: { fullName: true, phoneNumber: true, avatarUrl: true } },
      },
      orderBy: [{ ratingAverage: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: {
        city: city.name,
        businesses: businesses.map((b) => ({
          id: b.id,
          name: b.name,
          nameUr: b.nameUr,
          category: b.category.name,
          phone: b.phone,
          whatsapp: b.whatsapp,
          address: b.locations[0]?.addressLine || "Jampur",
          area: b.locations[0]?.area || "Main Bazaar",
          rating: b.ratingAverage,
          reviews: b.reviewCount,
          verified: b.isVerified,
        })),
        experts: providers.map((p) => ({
          id: p.id,
          name: p.user.fullName,
          skill: p.primarySkill,
          experience: p.experienceYears,
          phone: p.user.phoneNumber,
          visitFee: p.baseVisitFee,
          rating: p.ratingAverage,
          jobsCompleted: p.jobsCompleted,
          verified: p.isVerified,
        })),
      },
    });
  } catch (error) {
    console.error("Farmer directory error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch agriculture directory." } },
      { status: 500 }
    );
  }
}
