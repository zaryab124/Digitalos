export type IntentType =
  | "SERVICE_SEARCH"
  | "SERVICE_REQUEST"
  | "PRODUCT_SEARCH"
  | "BUSINESS_SEARCH"
  | "OFFER_SEARCH"
  | "SCHOLARSHIP_JOB_SEARCH"
  | "GENERAL_QUERY";

export type DetectedLanguage = "en" | "ur" | "roman_ur";

export interface ExtractedIntent {
  intent: IntentType;
  language: DetectedLanguage;
  rawQuery: string;
  categorySlug?: string;
  serviceTrade?: string;
  searchTerm?: string;
  maxBudget?: number;
  urgency?: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  problemDescription?: string;
  isRepairProblem?: boolean;
}

export function detectLanguage(text: string): DetectedLanguage {
  // Check for Arabic/Urdu unicode script range
  const urduRegex = /[\u0600-\u06FF]/;
  if (urduRegex.test(text)) {
    return "ur";
  }

  // Common Roman Urdu keywords
  const romanUrduWords = [
    "mujhe", "chahiye", "kaha", "kahan", "hai", "hain", "mera", "mere", "ghar",
    "ka", "ki", "ke", "andar", "mil", "sakta", "kharab", "wala", "banda",
    "theek", "karna", "karo", "paisa", "rupees", "kitne", "rate", "batao",
    "dokan", "dukan", "sasta", "sab", "se", "aaj", "jaldi", "zaroorat",
  ];

  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const matchedRomanWords = words.filter((w) => romanUrduWords.includes(w));

  if (matchedRomanWords.length >= 1) {
    return "roman_ur";
  }

  return "en";
}

export function extractIntent(query: string): ExtractedIntent {
  const q = query.trim();
  const lower = q.toLowerCase();
  const lang = detectLanguage(q);

  // 1. Extract Budget if mentioned (e.g. "500 rupees ke andar", "under 1000", "500 rs", "500 tak")
  let maxBudget: number | undefined;
  const budgetMatch = lower.match(/(\d+)\s*(?:rupees|rs|pkr|tak|ke andar|under)/i) ||
    lower.match(/(?:under|below|less than|within)\s*(\d+)/i);
  if (budgetMatch && budgetMatch[1]) {
    maxBudget = parseInt(budgetMatch[1], 10);
  }

  // 2. Extract Urgency (e.g. "aaj", "today", "emergency", "urgent", "abhi", "fauri")
  let urgency: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY" = "MEDIUM";
  if (
    lower.includes("emergency") ||
    lower.includes("fauri") ||
    lower.includes("emergency") ||
    lower.includes("abhi")
  ) {
    urgency = "EMERGENCY";
  } else if (
    lower.includes("today") ||
    lower.includes("aaj") ||
    lower.includes("urgent") ||
    lower.includes("jaldi")
  ) {
    urgency = "HIGH";
  }

  // 3. Match Services & Artisans (Electrician, AC, Solar, Plumber, Mechanic, Carpenter)
  const serviceKeywords: Record<string, { category: string; trade: string }> = {
    electrician: { category: "electronics", trade: "Electrician & Wiring" },
    bijli: { category: "electronics", trade: "Electrician & Wiring" },
    fan: { category: "electronics", trade: "Electrician & Wiring" },
    "short circuit": { category: "electronics", trade: "Electrician & Wiring" },
    wiring: { category: "electronics", trade: "Electrician & Wiring" },
    الیکٹریشن: { category: "electronics", trade: "Electrician & Wiring" },
    پنکھا: { category: "electronics", trade: "Electrician & Wiring" },

    ac: { category: "electronics", trade: "AC Repair & Cooling" },
    "air conditioner": { category: "electronics", trade: "AC Repair & Cooling" },
    cooling: { category: "electronics", trade: "AC Repair & Cooling" },
    "gas refill": { category: "electronics", trade: "AC Repair & Cooling" },
    "اے سی": { category: "electronics", trade: "AC Repair & Cooling" },

    solar: { category: "electronics", trade: "Solar & Inverter Setup" },
    inverter: { category: "electronics", trade: "Solar & Inverter Setup" },
    battery: { category: "electronics", trade: "Solar & Inverter Setup" },
    سولر: { category: "electronics", trade: "Solar & Inverter Setup" },
    انورٹر: { category: "electronics", trade: "Solar & Inverter Setup" },

    plumber: { category: "hardware", trade: "Plumber & Sanitary" },
    plumbing: { category: "hardware", trade: "Plumber & Sanitary" },
    nal: { category: "hardware", trade: "Plumber & Sanitary" },
    leakage: { category: "hardware", trade: "Plumber & Sanitary" },
    motor: { category: "hardware", trade: "Plumber & Sanitary" },
    پلمبر: { category: "hardware", trade: "Plumber & Sanitary" },
    سینیٹری: { category: "hardware", trade: "Plumber & Sanitary" },

    mechanic: { category: "automotive", trade: "Auto Mechanic & Tuning" },
    bike: { category: "automotive", trade: "Auto Mechanic & Tuning" },
    motorcycle: { category: "automotive", trade: "Auto Mechanic & Tuning" },
    tuning: { category: "automotive", trade: "Auto Mechanic & Tuning" },
    میکینک: { category: "automotive", trade: "Auto Mechanic & Tuning" },
    موٹرسائیکل: { category: "automotive", trade: "Auto Mechanic & Tuning" },

    carpenter: { category: "hardware", trade: "Carpenter & Furniture" },
    furniture: { category: "hardware", trade: "Carpenter & Furniture" },
    carpentry: { category: "hardware", trade: "Carpenter & Furniture" },
    بڑھئی: { category: "hardware", trade: "Carpenter & Furniture" },
    فرنیچر: { category: "hardware", trade: "Carpenter & Furniture" },
  };

  // Check if repair problem or service request is described
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
        problemDescription: q,
      };
    }
  }

  // 4. Match Opportunities / Scholarships / Jobs
  if (
    lower.includes("scholarship") ||
    lower.includes("internship") ||
    lower.includes("job") ||
    lower.includes("mulazmat") ||
    lower.includes("nokri") ||
    lower.includes("وظیفہ") ||
    lower.includes("ملازمت") ||
    lower.includes("نوکری")
  ) {
    return {
      intent: "SCHOLARSHIP_JOB_SEARCH",
      language: lang,
      rawQuery: q,
      searchTerm: q,
    };
  }

  // 5. Match Offers / Discounts
  if (
    lower.includes("offer") ||
    lower.includes("discount") ||
    lower.includes("deal") ||
    lower.includes("sale") ||
    lower.includes("sasta") ||
    lower.includes("رعایت") ||
    lower.includes("سیل")
  ) {
    return {
      intent: "OFFER_SEARCH",
      language: lang,
      rawQuery: q,
      searchTerm: q,
      maxBudget,
    };
  }

  // 6. Match Business Categories (Food/Dinner, Pharmacy, Grocery, Cloth, Hardware, Mobile repair)
  const businessCatKeywords: Record<string, string> = {
    dinner: "food",
    food: "food",
    restaurant: "food",
    biryani: "food",
    khana: "food",
    sweets: "food",
    mithai: "food",
    کھانے: "food",
    مٹھائی: "food",

    pharmacy: "pharmacies",
    medicine: "pharmacies",
    dawa: "pharmacies",
    dawakhana: "pharmacies",
    doctor: "pharmacies",
    hospital: "pharmacies",
    فارمیسی: "pharmacies",
    ادویات: "pharmacies",

    grocery: "grocery",
    karyana: "grocery",
    store: "grocery",
    ration: "grocery",
    superstore: "grocery",
    کریانہ: "grocery",

    cloth: "textiles",
    kapra: "textiles",
    fabric: "textiles",
    tailor: "textiles",
    suit: "textiles",
    کپڑا: "textiles",

    fertilizer: "agriculture",
    khad: "agriculture",
    seed: "agriculture",
    beej: "agriculture",
    kheti: "agriculture",
    زرعی: "agriculture",
    کھاد: "agriculture",

    mobile: "electronics",
    phone: "electronics",
    موبائل: "electronics",
  };

  for (const [kw, slug] of Object.entries(businessCatKeywords)) {
    if (lower.includes(kw) || q.includes(kw)) {
      return {
        intent: maxBudget ? "PRODUCT_SEARCH" : "BUSINESS_SEARCH",
        language: lang,
        rawQuery: q,
        categorySlug: slug,
        searchTerm: kw,
        maxBudget,
      };
    }
  }

  // 7. General fallback: if budget specified, treat as product search
  if (maxBudget) {
    return {
      intent: "PRODUCT_SEARCH",
      language: lang,
      rawQuery: q,
      searchTerm: q,
      maxBudget,
    };
  }

  return {
    intent: "GENERAL_QUERY",
    language: lang,
    rawQuery: q,
    searchTerm: q,
  };
}
