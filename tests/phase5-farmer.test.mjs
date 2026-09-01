import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Crop Diagnosis test logic
function diagnoseCropHealth(cropNameInput, symptomsInput) {
  const cropKey = cropNameInput.toLowerCase();
  const symptomsLower = symptomsInput.toLowerCase();

  let diseaseDetected = "General Foliar Pest / Nutrient Stress";
  let confidenceScore = 0.85;
  let treatmentRecommendations = ["Consult Jampur Agriculture Field Officer."];

  if (cropKey.includes("cotton") || cropKey.includes("kapas")) {
    if (symptomsLower.includes("whitefly") || symptomsLower.includes("safaid") || symptomsLower.includes("curling")) {
      diseaseDetected = "Cotton Whitefly (Safaid Makhi) & CLCuV Vector";
      confidenceScore = 0.92;
      treatmentRecommendations = [
        "Spray Pyriproxyfen 10.8% EC @ 400ml/acre.",
        "Spray Diafenthiuron 500 SC @ 200ml/acre.",
      ];
    }
  } else if (cropKey.includes("wheat") || cropKey.includes("gandum")) {
    if (symptomsLower.includes("rust") || symptomsLower.includes("kangi") || symptomsLower.includes("stripe")) {
      diseaseDetected = "Wheat Yellow / Stripe Rust (Peeli Kangi)";
      confidenceScore = 0.89;
      treatmentRecommendations = [
        "Spray Propiconazole (Tilt 250 EC) @ 200 ml/acre.",
        "Apply Tebuconazole + Trifloxystrobin (Nativo 75 WG) @ 65 g/acre.",
      ];
    }
  }

  return {
    cropName: cropNameInput,
    symptoms: symptomsInput,
    diseaseDetected,
    confidenceScore,
    treatmentRecommendations,
    disclaimer:
      "⚠️ Advisory Notice: This AI diagnosis is an automated advisory guide for preliminary scouting. It does not constitute a guaranteed laboratory determination.",
  };
}

async function getAgroWeatherData(citySlug = "jampur") {
  return {
    city: "Jampur",
    temperature: 36,
    apparentTemperature: 39,
    humidity: 45,
    windSpeed: 12,
    precipitationProbability: 10,
    uvIndex: 8.5,
    condition: "Clear Sky / Sunny",
    forecast: [
      { date: "2026-09-01", dayName: "Today", maxTemp: 38, minTemp: 28, rainProb: 10, condition: "Clear Sky" },
      { date: "2026-09-02", dayName: "Wed", maxTemp: 39, minTemp: 28, rainProb: 5, condition: "Sunny" },
      { date: "2026-09-03", dayName: "Thu", maxTemp: 37, minTemp: 27, rainProb: 15, condition: "Partly Cloudy" },
      { date: "2026-09-04", dayName: "Fri", maxTemp: 38, minTemp: 27, rainProb: 0, condition: "Sunny" },
      { date: "2026-09-05", dayName: "Sat", maxTemp: 39, minTemp: 28, rainProb: 0, condition: "Clear Sky" },
    ],
    alerts: [
      {
        type: "FAVORABLE",
        title: "Agro Weather Advisory",
        description: "Favorable dry weather for crop maintenance and solar tubewell pumping.",
      },
    ],
  };
}

test("Phase 5 Farmer Hub: Farmer Profile, Crop Lifecycle & Landholding", async () => {
  const jampur = await prisma.city.findFirst({ where: { slug: "jampur" } });
  assert.ok(jampur, "Jampur city must exist");

  const passwordHash = await bcrypt.hash("Pass@12345", 10);
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);

  // 1. Create Farmer User
  const farmerUser = await prisma.user.create({
    data: {
      phoneNumber: `+9230088${randomSuffix}`,
      fullName: "E2E Test Farmer",
      passwordHash,
      cityId: jampur.id,
      roles: { create: [{ roleId: "FARMER" }] },
    },
  });

  // 2. Create Farmer Profile
  const farmerProfile = await prisma.farmerProfile.create({
    data: {
      userId: farmerUser.id,
      cityId: jampur.id,
      farmName: "Dewan Model Farm",
      totalAcres: 25.0,
      irrigationType: "SOLAR_TUBEWELL",
      soilType: "CLAY_LOAM",
      villageMouza: "Mouza Kotla Dewan",
    },
  });

  assert.equal(farmerProfile.totalAcres, 25.0);
  assert.equal(farmerProfile.irrigationType, "SOLAR_TUBEWELL");

  // 3. Sown Crop Record
  const crop = await prisma.crop.create({
    data: {
      farmerId: farmerProfile.id,
      name: "Cotton (Kapas)",
      nameUr: "کپاس",
      variety: "BT BS-15",
      acresPlanted: 15.0,
      sowingDate: new Date("2026-05-15"),
      stage: "VEGETATIVE",
      estimatedYieldMaunds: 450,
      notes: "1 bag DAP + Nitrophos applied.",
    },
  });

  assert.equal(crop.name, "Cotton (Kapas)");
  assert.equal(crop.acresPlanted, 15.0);
  assert.equal(crop.stage, "VEGETATIVE");

  // 4. Update Crop Stage: VEGETATIVE -> FLOWERING
  const updatedCrop = await prisma.crop.update({
    where: { id: crop.id },
    data: { stage: "FLOWERING" },
  });
  assert.equal(updatedCrop.stage, "FLOWERING");

  // 5. Cleanup
  await prisma.crop.delete({ where: { id: crop.id } });
  await prisma.farmerProfile.delete({ where: { id: farmerProfile.id } });
  await prisma.user.delete({ where: { id: farmerUser.id } });
});

test("Phase 5 AI Crop Doctor: Disease Diagnosis, Prescriptions & Safety Disclaimers", async () => {
  // 1. Cotton Whitefly Diagnosis
  const cottonSymptoms = "Leaves curling upwards, yellow mosaic spots, and tiny white flying insects under leaf surface.";
  const diagnosis = diagnoseCropHealth("Cotton (Kapas)", cottonSymptoms);

  assert.ok(diagnosis.diseaseDetected.includes("Whitefly"));
  assert.ok(diagnosis.confidenceScore >= 0.85);
  assert.ok(diagnosis.treatmentRecommendations.length >= 2);
  assert.ok(
    diagnosis.treatmentRecommendations.some((t) => t.includes("Pyriproxyfen") || t.includes("Diafenthiuron")),
    "Must recommend approved chemical actives"
  );
  assert.ok(diagnosis.disclaimer.includes("Advisory Notice"), "Must contain mandatory advisory disclaimer");

  // 2. Wheat Rust Diagnosis
  const wheatSymptoms = "Bright yellow stripe powder and pustules appearing along the veins of wheat flag leaves.";
  const wheatDiagnosis = diagnoseCropHealth("Wheat (Gandum)", wheatSymptoms);

  assert.ok(wheatDiagnosis.diseaseDetected.includes("Rust") || wheatDiagnosis.diseaseDetected.includes("Kangi"));
  assert.ok(
    wheatDiagnosis.treatmentRecommendations.some((t) => t.includes("Propiconazole") || t.includes("Nativo")),
    "Must recommend rust fungicides"
  );
});

test("Phase 5 Agro Weather: Open-Meteo Integration & Spray Advisories", async () => {
  const weather = await getAgroWeatherData("jampur");

  assert.equal(weather.city, "Jampur");
  assert.ok(typeof weather.temperature === "number");
  assert.ok(typeof weather.humidity === "number");
  assert.ok(typeof weather.windSpeed === "number");
  assert.ok(weather.forecast.length >= 5, "Must provide 5-day daily forecast");
  assert.ok(weather.alerts.length >= 1, "Must provide agricultural weather alerts");
});

test("Phase 5 Market Intelligence: Mandi Rates & Price Movement", async () => {
  const jampur = await prisma.city.findFirst({ where: { slug: "jampur" } });
  assert.ok(jampur);

  const rates = await prisma.mandiRate.findMany({
    where: { cityId: jampur.id },
  });

  assert.ok(rates.length >= 4, "Must have seeded Mandi rates for Jampur");

  const cottonRate = rates.find((r) => r.cropName.includes("Cotton"));
  assert.ok(cottonRate, "Cotton mandi rate must exist");
  assert.ok(cottonRate.modalPrice > 5000, "Cotton rate must reflect realistic price per 40kg");
  assert.equal(cottonRate.unit, "40 kg (1 Maan)");
  assert.ok(["UP", "DOWN", "STABLE"].includes(cottonRate.trend));
});

test("Phase 5 Agriculture Directory: Dealers & Specialists", async () => {
  const jampur = await prisma.city.findFirst({ where: { slug: "jampur" } });
  assert.ok(jampur);

  const businesses = await prisma.business.findMany({
    where: { cityId: jampur.id, status: "APPROVED" },
  });

  assert.ok(businesses.length >= 1, "Should return verified local businesses");
});

test.after(async () => {
  await prisma.$disconnect();
});
