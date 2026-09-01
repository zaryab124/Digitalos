import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper intent extraction & language detection functions
function detectLanguage(text) {
  const urduRegex = /[\u0600-\u06FF]/;
  if (urduRegex.test(text)) return "ur";

  const romanUrduWords = [
    "mujhe", "chahiye", "kaha", "kahan", "hai", "hain", "mera", "mere", "ghar",
    "ka", "ki", "ke", "andar", "mil", "sakta", "kharab", "wala", "banda",
    "theek", "karna", "karo", "paisa", "rupees", "kitne", "rate", "batao",
    "dokan", "dukan", "sasta", "sab", "se", "aaj", "jaldi", "zaroorat",
  ];
  const words = text.toLowerCase().split(/\s+/);
  const matched = words.filter((w) => romanUrduWords.includes(w));
  return matched.length >= 1 ? "roman_ur" : "en";
}

function extractIntent(query) {
  const q = query.trim();
  const lower = q.toLowerCase();
  const lang = detectLanguage(q);

  let maxBudget;
  const budgetMatch = lower.match(/(\d+)\s*(?:rupees|rs|pkr|tak|ke andar|under)/i) ||
    lower.match(/(?:under|below|less than|within)\s*(\d+)/i);
  if (budgetMatch && budgetMatch[1]) {
    maxBudget = parseInt(budgetMatch[1], 10);
  }

  let urgency = "MEDIUM";
  if (lower.includes("emergency") || lower.includes("fauri") || lower.includes("abhi")) {
    urgency = "EMERGENCY";
  } else if (lower.includes("today") || lower.includes("aaj") || lower.includes("urgent") || lower.includes("jaldi")) {
    urgency = "HIGH";
  }

  const serviceKeywords = {
    electrician: { category: "electronics", trade: "Electrician & Wiring" },
    bijli: { category: "electronics", trade: "Electrician & Wiring" },
    fan: { category: "electronics", trade: "Electrician & Wiring" },
    "short circuit": { category: "electronics", trade: "Electrician & Wiring" },
    wiring: { category: "electronics", trade: "Electrician & Wiring" },
    الیکٹریشن: { category: "electronics", trade: "Electrician & Wiring" },
    ac: { category: "electronics", trade: "AC Repair & Cooling" },
    "air conditioner": { category: "electronics", trade: "AC Repair & Cooling" },
    "اے سی": { category: "electronics", trade: "AC Repair & Cooling" },
    solar: { category: "electronics", trade: "Solar & Inverter Setup" },
    inverter: { category: "electronics", trade: "Solar & Inverter Setup" },
    plumber: { category: "hardware", trade: "Plumber & Sanitary" },
    mechanic: { category: "automotive", trade: "Auto Mechanic & Tuning" },
    carpenter: { category: "hardware", trade: "Carpenter & Furniture" },
  };

  const isRepair =
    lower.includes("need") ||
    lower.includes("require") ||
    lower.includes("kharab") ||
    lower.includes("broken") ||
    lower.includes("repair") ||
    lower.includes("theek") ||
    lower.includes("chahiye") ||
    lower.includes("issue") ||
    lower.includes("problem") ||
    lower.includes("today") ||
    lower.includes("aaj") ||
    lower.includes("خراب") ||
    lower.includes("مرمت") ||
    lower.includes("چاہیے");

  for (const [kw, val] of Object.entries(serviceKeywords)) {
    const isMatched =
      kw.length <= 3
        ? new RegExp(`(?:^|\\s|[.,!?;])${kw}(?:$|\\s|[.,!?;])`, "i").test(q)
        : lower.includes(kw) || q.includes(kw);

    if (isMatched) {
      return {
        intent: isRepair ? "SERVICE_REQUEST" : "SERVICE_SEARCH",
        language: lang,
        rawQuery: q,
        categorySlug: val.category,
        serviceTrade: val.trade,
        searchTerm: kw,
        urgency,
        isRepairProblem: isRepair,
      };
    }
  }

  if (lower.includes("scholarship") || lower.includes("job") || lower.includes("وظیفہ")) {
    return {
      intent: "SCHOLARSHIP_JOB_SEARCH",
      language: lang,
      rawQuery: q,
    };
  }

  const businessCatKeywords = {
    dinner: "food",
    food: "food",
    pharmacy: "pharmacies",
    medicine: "pharmacies",
    dawa: "pharmacies",
    grocery: "grocery",
    cloth: "textiles",
    solar: "electronics",
    mobile: "electronics",
  };

  for (const [kw, slug] of Object.entries(businessCatKeywords)) {
    if (lower.includes(kw) || q.includes(kw)) {
      return {
        intent: maxBudget ? "PRODUCT_SEARCH" : "BUSINESS_SEARCH",
        language: lang,
        rawQuery: q,
        categorySlug: slug,
        maxBudget,
      };
    }
  }

  return {
    intent: "GENERAL_QUERY",
    language: lang,
    rawQuery: q,
    maxBudget,
  };
}

async function processGroundedQuery(intent, citySlug = "jampur") {
  const city = await prisma.city.findFirst({
    where: { slug: citySlug, isActive: true },
  });

  if (!city) {
    return { source: "NO_DATA_AVAILABLE", entities: [], status: "NO_RESULTS" };
  }

  if (intent.intent === "SERVICE_SEARCH" || intent.intent === "SERVICE_REQUEST") {
    const providers = await prisma.serviceProvider.findMany({
      where: {
        cityId: city.id,
        status: "APPROVED",
        ...(intent.categorySlug ? { categorySlug: intent.categorySlug } : {}),
      },
      include: { user: true },
    });

    if (providers.length === 0) {
      return {
        message: `Currently, no approved technicians registered in ${city.name}.`,
        source: "NO_DATA_AVAILABLE",
        entities: [],
        status: "NO_RESULTS",
      };
    }

    return {
      message: `Found ${providers.length} approved technicians in ${city.name}.`,
      source: "VERIFIED_DATABASE",
      entities: providers.map((p) => ({
        type: "PROVIDER",
        id: p.id,
        title: p.user.fullName,
        phone: p.user.phoneNumber,
        link: `/provider/${p.id}`,
      })),
      serviceRequestPreFill: {
        categorySlug: intent.categorySlug || "electronics",
        title: intent.serviceTrade || "Repair Service",
        urgency: intent.urgency || "MEDIUM",
      },
      status: "SUCCESS",
    };
  }

  if (intent.intent === "SCHOLARSHIP_JOB_SEARCH") {
    return {
      message: "Scholarship & job opportunities are currently in administrative verification.",
      source: "SYSTEM_DISCLAIMER",
      entities: [],
      status: "SUCCESS",
    };
  }

  if (intent.intent === "BUSINESS_SEARCH") {
    const businesses = await prisma.business.findMany({
      where: {
        cityId: city.id,
        status: "APPROVED",
        ...(intent.categorySlug ? { category: { slug: intent.categorySlug } } : {}),
      },
    });

    const disclaimer = intent.categorySlug === "pharmacies" ? "Medical Advisory: Consult a doctor." : undefined;

    return {
      message: `Found ${businesses.length} verified shops.`,
      source: businesses.length > 0 ? "VERIFIED_DATABASE" : "NO_DATA_AVAILABLE",
      entities: businesses.map((b) => ({ type: "BUSINESS", id: b.id, title: b.name })),
      disclaimer,
      status: businesses.length > 0 ? "SUCCESS" : "NO_RESULTS",
    };
  }

  return { source: "NO_DATA_AVAILABLE", entities: [], status: "NO_RESULTS" };
}

test("Phase 4 AI: Multi-Lingual Intent & Language Detection", async () => {
  // 1. Language Detection Tests
  assert.equal(detectLanguage("I need an electrician in Jampur"), "en");
  assert.equal(detectLanguage("جام پور میں الیکٹریشن چاہیے"), "ur");
  assert.equal(detectLanguage("Mujhe Jampur mein electrician chahiye."), "roman_ur");
  assert.equal(detectLanguage("500 rupees ke andar dinner kaha mil sakta hai?"), "roman_ur");

  // 2. English Intent Extraction
  const enIntent = extractIntent("I need an electrician in Jampur today");
  assert.equal(enIntent.intent, "SERVICE_REQUEST");
  assert.equal(enIntent.categorySlug, "electronics");
  assert.equal(enIntent.urgency, "HIGH");

  // 3. Roman Urdu Intent Extraction: "Mujhe Jampur mein electrician chahiye."
  const ruIntent1 = extractIntent("Mujhe Jampur mein electrician chahiye.");
  assert.equal(ruIntent1.intent, "SERVICE_REQUEST");
  assert.equal(ruIntent1.categorySlug, "electronics");
  assert.equal(ruIntent1.serviceTrade, "Electrician & Wiring");

  // 4. Roman Urdu with Budget: "500 rupees ke andar dinner kaha mil sakta hai?"
  const ruIntent2 = extractIntent("500 rupees ke andar dinner kaha mil sakta hai?");
  assert.equal(ruIntent2.intent, "PRODUCT_SEARCH");
  assert.equal(ruIntent2.categorySlug, "food");
  assert.equal(ruIntent2.maxBudget, 500);

  // 5. Roman Urdu Complex Urgency: "Mere ghar ka fan kharab hai aur mujhe aaj electrician chahiye."
  const ruIntent3 = extractIntent("Mere ghar ka fan kharab hai aur mujhe aaj electrician chahiye.");
  assert.equal(ruIntent3.intent, "SERVICE_REQUEST");
  assert.equal(ruIntent3.categorySlug, "electronics");
  assert.equal(ruIntent3.urgency, "HIGH");
  assert.equal(ruIntent3.isRepairProblem, true);

  // 6. Scholarship Intent: "Mujhe scholarship chahiye."
  const schIntent = extractIntent("Mujhe scholarship chahiye.");
  assert.equal(schIntent.intent, "SCHOLARSHIP_JOB_SEARCH");
});

test("Phase 4 AI: Database Grounding & Anti-Hallucination", async () => {
  const jampur = await prisma.city.findFirst({ where: { slug: "jampur" } });
  assert.ok(jampur, "Jampur city must exist in DB");

  // 1. Query for Electrician -> Should return seeded approved electricians from real DB
  const electricianIntent = extractIntent("Mujhe Jampur mein electrician chahiye.");
  const electricianResult = await processGroundedQuery(electricianIntent, "jampur");

  assert.equal(electricianResult.source, "VERIFIED_DATABASE");
  assert.ok(electricianResult.entities.length > 0, "Must return approved electricians from database");
  assert.equal(electricianResult.entities[0].type, "PROVIDER");
  assert.ok(electricianResult.serviceRequestPreFill, "Should provide 1-click service pre-fill");

  // 2. Query for Scholarships -> Strict Anti-Hallucination: Must NOT fabricate fake scholarships
  const schIntent = extractIntent("Mujhe scholarship chahiye.");
  const schResult = await processGroundedQuery(schIntent, "jampur");

  assert.equal(schResult.source, "SYSTEM_DISCLAIMER");
  assert.equal(schResult.entities.length, 0, "Must not hallucinate fake scholarships");

  // 3. Query for Non-Existent Trade -> Anti-Hallucination: Must return NO_DATA_AVAILABLE
  const fakeTradeIntent = {
    intent: "SERVICE_SEARCH",
    language: "en",
    rawQuery: "astronaut spaceship repair",
    categorySlug: "space-travel",
    serviceTrade: "Rocket Propulsion",
  };
  const fakeResult = await processGroundedQuery(fakeTradeIntent, "jampur");
  assert.equal(fakeResult.source, "NO_DATA_AVAILABLE");
  assert.equal(fakeResult.entities.length, 0, "Must not hallucinate non-existent service providers");

  // 4. Pharmacy Query -> Safety Medical Disclaimer Attached
  const pharmacyIntent = extractIntent("Mujhe pharmacy aur medicine chahiye");
  const pharmacyResult = await processGroundedQuery(pharmacyIntent, "jampur");
  assert.ok(pharmacyResult.disclaimer, "Must include safety medical disclaimer for health queries");
});

test("Phase 4 AI: Telemetry Interaction Logging", async () => {
  const jampur = await prisma.city.findFirst({ where: { slug: "jampur" } });
  assert.ok(jampur);

  const testLog = await prisma.aiInteractionLog.create({
    data: {
      cityId: jampur.id,
      query: "Mere ghar ka fan kharab hai",
      detectedLanguage: "roman_ur",
      extractedIntent: "SERVICE_REQUEST",
      parameters: JSON.stringify({ categorySlug: "electronics", urgency: "HIGH" }),
      entityCount: 2,
      status: "SUCCESS",
      latencyMs: 45,
    },
  });

  assert.ok(testLog.id);
  assert.equal(testLog.detectedLanguage, "roman_ur");
  assert.equal(testLog.extractedIntent, "SERVICE_REQUEST");

  // Cleanup
  await prisma.aiInteractionLog.delete({ where: { id: testLog.id } });
});

test.after(async () => {
  await prisma.$disconnect();
});
