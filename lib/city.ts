import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const CITY_COOKIE_NAME = "jdos_city_slug";
export const DEFAULT_CITY_SLUG = "jampur";

export async function getSelectedCitySlug(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const cityCookie = cookieStore.get(CITY_COOKIE_NAME)?.value;
    return cityCookie || DEFAULT_CITY_SLUG;
  } catch {
    return DEFAULT_CITY_SLUG;
  }
}

export async function getSelectedCity() {
  try {
    const slug = await getSelectedCitySlug();
    const city = await prisma.city.findFirst({
      where: {
        slug,
        isActive: true,
      },
    });

    if (city) return city;

    // Fallback to first active city in DB
    const fallbackCity = await prisma.city.findFirst({
      where: { isActive: true },
    });

    if (fallbackCity) return fallbackCity;
  } catch {
    // Database fallback
  }

  // Guaranteed static fallback
  return {
    id: "city_jampur_default",
    name: "Jampur",
    nameUr: "جام پور",
    slug: "jampur",
    country: "Pakistan",
    province: "Punjab",
    division: "D.G. Khan Division",
    district: "Rajanpur District",
    latitude: 29.6433,
    longitude: 70.595,
    radiusKm: 15.0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getAllActiveCities() {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    if (cities.length > 0) return cities;
  } catch {
    // Fallback
  }

  return [
    {
      id: "city_jampur_default",
      name: "Jampur",
      nameUr: "جام پور",
      slug: "jampur",
      country: "Pakistan",
      province: "Punjab",
      division: "D.G. Khan Division",
      district: "Rajanpur District",
      latitude: 29.6433,
      longitude: 70.595,
      radiusKm: 15.0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}
