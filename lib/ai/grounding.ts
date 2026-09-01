import { prisma } from "@/lib/prisma";
import { ExtractedIntent } from "./intent";
import { formatPKR } from "@/lib/utils";

export interface GroundedResponse {
  message: string;
  messageUr?: string;
  source: "VERIFIED_DATABASE" | "NO_DATA_AVAILABLE" | "SYSTEM_DISCLAIMER";
  entities: Array<{
    type: "BUSINESS" | "PROVIDER" | "PRODUCT" | "OFFER" | "SERVICE_ACTION" | "OPPORTUNITY";
    id: string;
    title: string;
    titleUr?: string | null;
    subtitle?: string | null;
    price?: number;
    phone?: string | null;
    link: string;
    badge?: string | null;
    rating?: number | null;
  }>;
  serviceRequestPreFill?: {
    categorySlug: string;
    title: string;
    description: string;
    urgency: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  };
  disclaimer?: string;
  status: "SUCCESS" | "NO_RESULTS" | "ERROR";
}

export async function processGroundedQuery(
  intent: ExtractedIntent,
  citySlug = "jampur"
): Promise<GroundedResponse> {
  const city = await prisma.city.findFirst({
    where: { slug: citySlug, isActive: true },
  });

  if (!city) {
    return {
      message: `City "${citySlug}" is not currently configured in Jampur Digital OS.`,
      source: "NO_DATA_AVAILABLE",
      entities: [],
      status: "NO_RESULTS",
    };
  }

  const lang = intent.language;

  // ----------------------------------------------------
  // 1. SERVICE SEARCH / SERVICE REPAIR REQUEST
  // ----------------------------------------------------
  if (intent.intent === "SERVICE_SEARCH" || intent.intent === "SERVICE_REQUEST") {
    const providers = await prisma.serviceProvider.findMany({
      where: {
        cityId: city.id,
        status: "APPROVED", // Strict check: only verified, approved artisans
        ...(intent.categorySlug ? { categorySlug: intent.categorySlug } : {}),
      },
      include: {
        user: { select: { fullName: true, phoneNumber: true, avatarUrl: true } },
      },
      orderBy: [{ ratingAverage: "desc" }, { jobsCompleted: "desc" }],
    });

    if (providers.length === 0) {
      return {
        message: `Currently, there are no approved ${intent.serviceTrade || "technicians"} registered in ${city.name} on the portal. You can post an open service request so newly registering providers can submit quotes.`,
        messageUr: `فی الوقت ${city.name} میں کوئی منظور شدہ کاریگر رجسٹر نہیں ہے۔ آپ اپنی مرمتی درخواست پوسٹ کر سکتے ہیں۔`,
        source: "NO_DATA_AVAILABLE",
        entities: [],
        serviceRequestPreFill: {
          categorySlug: intent.categorySlug || "electronics",
          title: intent.serviceTrade ? `${intent.serviceTrade} Needed` : "Repair Service Needed",
          description: intent.rawQuery,
          urgency: intent.urgency || "MEDIUM",
        },
        status: "NO_RESULTS",
      };
    }

    const entities = providers.map((p) => ({
      type: "PROVIDER" as const,
      id: p.id,
      title: p.user.fullName,
      subtitle: `${p.primarySkill} • ${p.experienceYears} Years Exp • Inspection Fee: ${formatPKR(p.baseVisitFee)}`,
      phone: p.user.phoneNumber,
      link: `/provider/${p.id}`,
      badge: p.isVerified ? "Verified Artisan" : "Artisan",
      rating: p.ratingAverage,
    }));

    const responseMsg =
      lang === "ur"
        ? `ہمیں ${city.name} میں ${providers.length} تصدیق شدہ کاریگر ملے۔ آپ براہ راست رابطہ کر سکتے ہیں یا کوٹیشن کیلئے درخواست جمع کر سکتے ہیں۔`
        : lang === "roman_ur"
        ? `Hum ne ${city.name} mein ${providers.length} verified ${intent.serviceTrade || "technicians"} dhoond liye hain. Aap direct call kar sakte hain ya quote ke liye request post kar sakte hain.`
        : `Found ${providers.length} verified ${intent.serviceTrade || "technicians"} in ${city.name}. You can contact them directly or post a service request for quotations.`;

    return {
      message: responseMsg,
      messageUr: `ہمیں ${city.name} میں ${providers.length} تصدیق شدہ کاریگر ملے۔`,
      source: "VERIFIED_DATABASE",
      entities,
      serviceRequestPreFill: {
        categorySlug: intent.categorySlug || "electronics",
        title: intent.serviceTrade ? `Repair: ${intent.serviceTrade}` : "Service Request",
        description: intent.rawQuery,
        urgency: intent.urgency || "MEDIUM",
      },
      status: "SUCCESS",
    };
  }

  // ----------------------------------------------------
  // 2. PRODUCT SEARCH (WITH BUDGET OR KEYWORD)
  // ----------------------------------------------------
  if (intent.intent === "PRODUCT_SEARCH") {
    const where: any = {
      business: {
        cityId: city.id,
        status: "APPROVED",
        ...(intent.categorySlug ? { category: { slug: intent.categorySlug } } : {}),
      },
      isAvailable: true,
      ...(intent.maxBudget ? { price: { lte: intent.maxBudget } } : {}),
    };

    const products = await prisma.product.findMany({
      where,
      include: {
        business: {
          select: { id: true, name: true, phone: true, locations: true },
        },
      },
      orderBy: { price: "asc" },
      take: 8,
    });

    if (products.length === 0) {
      return {
        message: intent.maxBudget
          ? `No verified products found in ${city.name} shops under PKR ${intent.maxBudget}.`
          : `No matching verified products found in ${city.name} database.`,
        messageUr: `${city.name} کی دکانوں میں کوئی ایسی پراڈکٹ فی الوقت دستیاب نہیں۔`,
        source: "NO_DATA_AVAILABLE",
        entities: [],
        status: "NO_RESULTS",
      };
    }

    const entities = products.map((prod) => ({
      type: "PRODUCT" as const,
      id: prod.id,
      title: prod.name,
      titleUr: prod.nameUr,
      subtitle: `Store: ${prod.business.name} (${prod.business.locations[0]?.area || "Jampur"})`,
      price: prod.price,
      phone: prod.business.phone,
      link: `/business/${prod.business.id}`,
      badge: prod.isDeliveryAvailable ? "Delivery Available" : "In Store",
    }));

    const responseMsg =
      lang === "ur"
        ? `ہمیں ${city.name} کی تصدیق شدہ دکانوں میں ${products.length} اشیاء ملیں:`
        : lang === "roman_ur"
        ? `Hum ne ${city.name} ki verified shops mein ${products.length} products dhoondi hain${intent.maxBudget ? ` jo PKR ${intent.maxBudget} ke andar hain` : ""}:`
        : `Found ${products.length} verified products in ${city.name} stores${intent.maxBudget ? ` under PKR ${intent.maxBudget}` : ""}:`;

    return {
      message: responseMsg,
      source: "VERIFIED_DATABASE",
      entities,
      status: "SUCCESS",
    };
  }

  // ----------------------------------------------------
  // 3. BUSINESS / SHOP SEARCH
  // ----------------------------------------------------
  if (intent.intent === "BUSINESS_SEARCH") {
    const businesses = await prisma.business.findMany({
      where: {
        cityId: city.id,
        status: "APPROVED",
        ...(intent.categorySlug ? { category: { slug: intent.categorySlug } } : {}),
      },
      include: {
        locations: true,
        category: true,
      },
      orderBy: [{ ratingAverage: "desc" }, { reviewCount: "desc" }],
    });

    let disclaimer: string | undefined;
    if (intent.categorySlug === "pharmacies") {
      disclaimer =
        "⚠️ Medical Advisory: Pharmacy directory listings are for informational access. Always consult a certified healthcare professional before purchasing prescription drugs.";
    } else if (intent.categorySlug === "agriculture") {
      disclaimer =
        "⚠️ Agricultural Advisory: Fertilizer & chemical applications should follow approved extension guidelines. Consult local agriculture department officers.";
    }

    if (businesses.length === 0) {
      return {
        message: `No approved shops currently listed in ${city.name} for this category.`,
        messageUr: `${city.name} میں اس کیٹیگری کی کوئی دکان رجسٹرڈ نہیں ہے۔`,
        source: "NO_DATA_AVAILABLE",
        entities: [],
        disclaimer,
        status: "NO_RESULTS",
      };
    }

    const entities = businesses.map((b) => ({
      type: "BUSINESS" as const,
      id: b.id,
      title: b.name,
      titleUr: b.nameUr,
      subtitle: `${b.category.name} • ${b.locations[0]?.addressLine || b.cityId}`,
      phone: b.phone,
      link: `/business/${b.id}`,
      badge: b.isVerified ? "Verified Shop" : "Local Business",
      rating: b.ratingAverage,
    }));

    const responseMsg =
      lang === "ur"
        ? `${city.name} میں ${businesses.length} تصدیق شدہ دکانیں دستیاب ہیں:`
        : lang === "roman_ur"
        ? `${city.name} mein ${businesses.length} verified shops milli hain:`
        : `Found ${businesses.length} verified shops in ${city.name}:`;

    return {
      message: responseMsg,
      source: "VERIFIED_DATABASE",
      entities,
      disclaimer,
      status: "SUCCESS",
    };
  }

  // ----------------------------------------------------
  // 4. PROMOTIONS & BUMPER OFFERS
  // ----------------------------------------------------
  if (intent.intent === "OFFER_SEARCH") {
    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        endDate: { gte: new Date() },
        business: { cityId: city.id, status: "APPROVED" },
      },
      include: {
        business: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { discountPercentage: "desc" },
    });

    if (offers.length === 0) {
      return {
        message: `There are currently no active promotional discount deals listed in ${city.name}.`,
        messageUr: `فی الوقت ${city.name} میں کوئی رعایت یا ڈیل فعال نہیں ہے۔`,
        source: "NO_DATA_AVAILABLE",
        entities: [],
        status: "NO_RESULTS",
      };
    }

    const entities = offers.map((off) => ({
      type: "OFFER" as const,
      id: off.id,
      title: off.title,
      titleUr: off.titleUr,
      subtitle: `${off.discountPercentage}% OFF at ${off.business.name} (Min Order: ${formatPKR(off.minOrderAmount)})`,
      phone: off.business.phone,
      link: `/business/${off.business.id}`,
      badge: `${off.discountPercentage}% OFF`,
    }));

    return {
      message: `Active promotional offers in ${city.name}:`,
      messageUr: `${city.name} میں فعال خصوصی ڈسکاؤنٹ آفرز:`,
      source: "VERIFIED_DATABASE",
      entities,
      status: "SUCCESS",
    };
  }

  // ----------------------------------------------------
  // 5. SCHOLARSHIP / JOB SEARCH (GROUNDED IN OPPORTUNITIES)
  // ----------------------------------------------------
  if (intent.intent === "SCHOLARSHIP_JOB_SEARCH") {
    const opps = await prisma.opportunity.findMany({
      where: {
        cityId: city.id,
        status: "APPROVED",
        isVerified: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    if (opps.length === 0) {
      return {
        message: `There are currently no verified student scholarships or job vacancies registered in ${city.name}.`,
        messageUr: `اس وقت ${city.name} میں کوئی مصدقہ وظیفہ یا ملازمت درج نہیں ہے۔`,
        source: "NO_DATA_AVAILABLE",
        entities: [],
        status: "NO_RESULTS",
      };
    }

    const entities = opps.map((opp) => ({
      type: "OPPORTUNITY" as const,
      id: opp.id,
      title: opp.title,
      titleUr: opp.titleUr,
      subtitle: `${opp.organizationName} • ${opp.type} (${opp.stipendOrSalary || "Free"})`,
      link: `/students/opportunities`,
      badge: opp.type,
    }));

    return {
      message: `Found ${opps.length} verified educational scholarships, internships, and jobs in ${city.name}:`,
      messageUr: `${city.name} میں ${opps.length} مصدقہ وظائف اور روزگار کے مواقع دستیاب ہیں:`,
      source: "VERIFIED_DATABASE",
      entities,
      status: "SUCCESS",
    };
  }

  // ----------------------------------------------------
  // 6. GENERAL FALLBACK (DATABASE CITY STATS)
  // ----------------------------------------------------
  const [shopCount, providerCount, productCount] = await Promise.all([
    prisma.business.count({ where: { cityId: city.id, status: "APPROVED" } }),
    prisma.serviceProvider.count({ where: { cityId: city.id, status: "APPROVED" } }),
    prisma.product.count({ where: { business: { cityId: city.id, status: "APPROVED" } } }),
  ]);

  const generalMsg =
    lang === "ur"
      ? `جام پور ڈیجیٹل او ایس میں خوش آمدید۔ ${city.name} میں اس وقت ${shopCount} تصدیق شدہ دکانیں، ${providerCount} کاریگر، اور ${productCount} اشیاء پبلک پورٹل پر دستیاب ہیں۔ آپ دکان، کاریگر یا اشیاء تلاش کر سکتے ہیں۔`
      : lang === "roman_ur"
      ? `Jampur Digital OS mein khush amdeed! ${city.name} mein is waqt ${shopCount} verified shops, ${providerCount} electricians/technicians aur ${productCount} products listed hain. Aap kisi bhi shop, repair service ya product ke baare mein pooch sakte hain.`
      : `Welcome to Jampur Digital OS. Currently, ${city.name} has ${shopCount} verified businesses, ${providerCount} approved artisans/technicians, and ${productCount} listed products. How can I help you find services or shops today?`;

  return {
    message: generalMsg,
    messageUr: `جام پور ڈیجیٹل او ایس میں خوش آمدید۔`,
    source: "VERIFIED_DATABASE",
    entities: [],
    status: "SUCCESS",
  };
}
