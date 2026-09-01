export interface CropDiagnosisResult {
  cropName: string;
  symptoms: string;
  diseaseDetected: string;
  diseaseDetectedUr: string;
  confidenceScore: number;
  explanation: string;
  explanationUr: string;
  treatmentRecommendations: string[];
  treatmentRecommendationsUr: string[];
  preventiveMeasures: string[];
  disclaimer: string;
}

interface DiseaseProfile {
  name: string;
  nameUr: string;
  keywords: string[];
  explanation: string;
  explanationUr: string;
  treatments: string[];
  treatmentsUr: string[];
  prevention: string[];
  confidence: number;
}

const CROP_PATHOLOGY_DATABASE: Record<string, DiseaseProfile[]> = {
  cotton: [
    {
      name: "Cotton Whitefly (Safaid Makhi) & CLCuV Vector",
      nameUr: "کپاس کا سفید مکھی حملہ اور پتہ مروڑ وائرس",
      keywords: ["whitefly", "safaid", "makhi", "white", "leaf curl", "curling", "honeydew", "yellow spots"],
      explanation: "Whiteflies are phloem-feeding insects that colonize the undersides of cotton leaves. They excrete sticky honeydew causing sooty mold and are the primary vector for Cotton Leaf Curl Virus (CLCuV).",
      explanationUr: "سفید مکھی پتوں کے نچلے حصے سے رس چوستی ہے اور چپچپا مادہ خارج کرتی ہے جس سے کالی پھپھوندی جمتی ہے اور پتہ مروڑ وائرس پھیلتا ہے۔",
      treatments: [
        "Spray Pyriproxyfen 10.8% EC @ 400-500 ml/acre to break nymph cycles.",
        "For adult knock-down, spray Diafenthiuron 500 SC @ 200 ml/acre or Spirotetramat @ 125 ml/acre.",
        "Ensure fine hollow-cone nozzle spray reaching the lower leaves.",
      ],
      treatmentsUr: [
        "پائری پروکسی فن 400 سے 500 ملی لٹر فی ایکڑ سپرے کریں۔",
        "بالغ مکھی کے خاتمے کیلئے ڈایا فینتھیوران 200 ملی لٹر فی ایکڑ استعمال کریں۔",
        "پتوں کے نچلے حصے تک سپرے پہنچانے کیلئے ہولو کون نوزل استعمال کریں۔",
      ],
      prevention: ["Eradicate alternate weed hosts (Kangi Buti, Peeli Buti).", "Avoid excessive nitrogenous fertilizer application."],
      confidence: 0.92,
    },
    {
      name: "Pink Bollworm (Gulabi Sundi)",
      nameUr: "گلابی سنڈی (پنک بول ورم)",
      keywords: ["pink bollworm", "gulabi", "sundi", "bollworm", "flower rosette", "boll damage", "caterpillar"],
      explanation: "Pink bollworm larvae enter developing flower buds (forming rosette flowers) and burrow directly into bolls, eating seeds and staining lint.",
      explanationUr: "گلابی سنڈی کے بچے ڈوڈوں اور گلاب کے پھولوں میں داخل ہو کر بنولے کو کھاتے ہیں اور روئی کا معیار خراب کرتے ہیں۔",
      treatments: [
        "Install Delta Pheromone Traps @ 5-8 traps per acre for population monitoring.",
        "Spray Emamectin Benzoate 1.9% EC @ 200 ml/acre or Chlorantraniliprole 20% SC @ 50 ml/acre.",
        "Rotate chemical modes of action to prevent pesticide resistance.",
      ],
      treatmentsUr: [
        "جنس رساں تلے (فیرومون ٹریپس) 5 سے 8 فی ایکڑ لگائیں۔",
        "ایما میکٹن بینزوئیٹ 200 ملی لٹر فی ایکڑ یا کوراجن 50 ملی لٹر سپرے کریں۔",
      ],
      prevention: ["Shred and burn old cotton sticks before next sowing.", "Deep plow fields in winter to expose pupae."],
      confidence: 0.9,
    },
  ],
  wheat: [
    {
      name: "Wheat Yellow / Stripe Rust (Peeli Kangi)",
      nameUr: "گندم کی پیلی / پٹی دار کنگی",
      keywords: ["rust", "kangi", "yellow", "stripes", "powder", "pustules", "orange"],
      explanation: "Yellow rust (Puccinia striiformis) forms bright yellow stripe pustules along wheat leaf veins, severely impairing photosynthesis and grain fill.",
      explanationUr: "پیلی کنگی پتوں کی رگوں کے ساتھ پیلے رنگ کی لکیروں اور سفوف کی صورت میں ظاہر ہوتی ہے جس سے سٹے میں دانہ کمزور رہ جاتا ہے۔",
      treatments: [
        "Spray Propiconazole (Tilt 250 EC) @ 200 ml/acre immediately upon spotting initial foci.",
        "Alternatively, apply Tebuconazole + Trifloxystrobin (Nativo 75 WG) @ 65 g/acre.",
      ],
      treatmentsUr: [
        "پروپیکونازول (ٹلٹ) 200 ملی لٹر فی ایکڑ سپرے کریں۔",
        "یا نیٹیوو 65 گرام فی ایکڑ کے حساب سے فوری سپرے کریں۔",
      ],
      prevention: ["Cultivate approved rust-resistant varieties (e.g. Akbar-2019, Dilkash-20).", "Avoid high humidity microclimates with balanced spacing."],
      confidence: 0.89,
    },
    {
      name: "Wheat Aphid / Greenfly (Sust Tela)",
      nameUr: "گندم کا سست تیلا",
      keywords: ["aphid", "sust tela", "tela", "green insect", "ears sap"],
      explanation: "Aphids cluster on wheat flag leaves and ears during grain filling stage, sucking sugary sap and reducing 1000-grain weight.",
      explanationUr: "سست تیلا گندم کے خوشوں اور پتوں پر حملہ آور ہو کر رس چوستا ہے اور دانے کو پچکا دیتا ہے۔",
      treatments: [
        "If population exceeds Economic Threshold Level (ETL: >15-20 aphids/tiller), spray Imidacloprid 200 SL @ 250 ml/acre.",
        "Conserve natural predators like Coccinellid Ladybird beetles and Chrysoperla.",
      ],
      treatmentsUr: [
        "معاشی حد عبور ہونے پر امیڈا کلوپرڈ 250 ملی لٹر فی ایکڑ سپرے کریں۔",
        "لیڈی برڈ بیٹل (دوست کیڑوں) کا تحفظ کریں۔",
      ],
      prevention: ["Balanced irrigation during heading stage.", "Avoid late sowing."],
      confidence: 0.88,
    },
  ],
  sugarcane: [
    {
      name: "Sugarcane Red Rot (Ratta Rog)",
      nameUr: "کماد کا رتا روگ (ریڈ راٹ)",
      keywords: ["red rot", "ratta", "red stalk", "smell", "wilting", "cane"],
      explanation: "Colletotrichum falcatum causes internal pith reddening with white cross-bands and characteristic alcoholic odor, leading to cane drying.",
      explanationUr: "ریڈ راٹ میں گنے کے اندر کا گودا سرخ ہو جاتا ہے اور الکحل جیسی بو آتی ہے جس سے پودا سوکھ جاتا ہے۔",
      treatments: [
        "Rogue out and burn severely infected clumps immediately.",
        "Drench soil surrounding patches with Carbendazim 50% WP @ 2g/L.",
      ],
      treatmentsUr: [
        "متاثرہ گنے کے مڈھوں کو اکھاڑ کر جلا دیں۔",
        "کاربینڈازم کا محلول بنا کر زمین کو تر کریں۔",
      ],
      prevention: ["Treat seed setts in hot water (52°C for 30 mins) or fungicide slurry.", "Rotate with non-host crops like pulses."],
      confidence: 0.87,
    },
  ],
  mango: [
    {
      name: "Mango Anthracnose & Powdery Mildew",
      nameUr: "آم کا بھبھکا اور اینتھریکنوز",
      keywords: ["mango", "anthracnose", "powdery mildew", "bhabka", "flower drop", "black spots"],
      explanation: "Fungal infection attacking blossoms and young mango fruitlets, resulting in blossom blight and dark sunken fruit lesions.",
      explanationUr: "آم کے بور اور کیری پر حملہ کر کے بور کو کالا کرتا ہے جس سے پھل گر جاتا ہے۔",
      treatments: [
        "Apply Difenoconazole @ 0.5 ml/L or Nativo @ 0.65 g/L during bloom pre-opening.",
        "Spray Micronized Sulfur 80% WP @ 2 g/L for powdery mildew suppression.",
      ],
      treatmentsUr: [
        "بور کھلنے سے پہلے ڈائی فینوکونازول یا نیٹیوو کا سپرے کریں۔",
        "سلفر 80 فیصد 2 گرام فی لٹر پانی میں ملا کر سپرے کریں۔",
      ],
      prevention: ["Prune dead twigs and open tree canopy for sun penetration.", "Sanitize dropped leaves in winter."],
      confidence: 0.91,
    },
  ],
};

const DEFAULT_GENERAL_DIAGNOSIS: DiseaseProfile = {
  name: "General Foliar Pest / Nutrient Stress",
  nameUr: "پتوں کی خرابی یا غذائی قلت",
  keywords: [],
  explanation: "Symptoms indicate early foliage stress, leaf spot, or localized insect feeding.",
  explanationUr: "پودے پر کیڑوں کے حملے یا غذائی قلت کے ابتدائی اثرات ظاہر ہو رہے ہیں۔",
  treatments: [
    "Collect physical sample and show to local Jampur Agriculture Extension Field Assistant.",
    "Apply balanced NPK foliar spray with micronutrients (Zinc/Boron) to rejuvenate crop vigor.",
    "Avoid pesticide tank-mixing without compatibility testing.",
  ],
  treatmentsUr: [
    "متاثرہ پتے کا نمونہ لے کر قریبی محکمہ زراعت توسیع جام پور کے دفتر تشریف لے جائیں۔",
    "فصل کی بحالی کیلئے متوازن این پی کے مائیکرو نیوٹرینٹ کا سپرے کریں۔",
  ],
  prevention: ["Inspect field twice weekly in early morning.", "Maintain regular soil health checks."],
  confidence: 0.75,
};

export function diagnoseCropHealth(cropNameInput: string, symptomsInput: string): CropDiagnosisResult {
  const cropKey = cropNameInput.toLowerCase();
  const symptomsLower = symptomsInput.toLowerCase();

  // Find crop category
  let profiles: DiseaseProfile[] = [];
  if (cropKey.includes("cotton") || cropKey.includes("kapas") || cropKey.includes("کپاس")) {
    profiles = CROP_PATHOLOGY_DATABASE.cotton;
  } else if (cropKey.includes("wheat") || cropKey.includes("gandum") || cropKey.includes("گندم")) {
    profiles = CROP_PATHOLOGY_DATABASE.wheat;
  } else if (cropKey.includes("sugarcane") || cropKey.includes("kamad") || cropKey.includes("کماد") || cropKey.includes("گنا")) {
    profiles = CROP_PATHOLOGY_DATABASE.sugarcane;
  } else if (cropKey.includes("mango") || cropKey.includes("aam") || cropKey.includes("آم")) {
    profiles = CROP_PATHOLOGY_DATABASE.mango;
  }

  let bestMatch: DiseaseProfile = DEFAULT_GENERAL_DIAGNOSIS;
  let highestScore = 0;

  for (const p of profiles) {
    let matchCount = 0;
    for (const kw of p.keywords) {
      if (symptomsLower.includes(kw)) {
        matchCount++;
      }
    }
    if (matchCount > highestScore) {
      highestScore = matchCount;
      bestMatch = p;
    }
  }

  // If no specific keyword matched within crop, use first profile of that crop
  if (highestScore === 0 && profiles.length > 0) {
    bestMatch = profiles[0];
  }

  return {
    cropName: cropNameInput,
    symptoms: symptomsInput,
    diseaseDetected: bestMatch.name,
    diseaseDetectedUr: bestMatch.nameUr,
    confidenceScore: bestMatch.confidence,
    explanation: bestMatch.explanation,
    explanationUr: bestMatch.explanationUr,
    treatmentRecommendations: bestMatch.treatments,
    treatmentRecommendationsUr: bestMatch.treatmentsUr,
    preventiveMeasures: bestMatch.prevention,
    disclaimer:
      "⚠️ Advisory Notice: This AI diagnosis is an automated advisory guide for preliminary scouting. It does not constitute a guaranteed laboratory determination or commercial recommendation. Always consult the local Jampur Agriculture Extension Department or a certified agronomist before purchasing or applying commercial agricultural chemicals.",
  };
}
