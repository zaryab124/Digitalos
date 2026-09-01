import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

test("Phase 7 Multi-City: Geographic Hierarchy & Area Structure", async () => {
  const jampur = await prisma.city.findFirst({
    where: { slug: "jampur" },
    include: { areas: true },
  });
  assert.ok(jampur, "Jampur must exist");
  assert.equal(jampur.country, "Pakistan");
  assert.equal(jampur.province, "Punjab");
  assert.equal(jampur.division, "D.G. Khan Division");
  assert.equal(jampur.district, "Rajanpur District");
  assert.ok(jampur.areas.length >= 4, "Must have configured areas for Jampur");
});

test("Phase 7 Multi-City: Dynamic City & Area Provisioning without Code Changes", async () => {
  const randomSlug = `taunsa-e2e-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Create 4th Dynamic City
  const newCity = await prisma.city.create({
    data: {
      name: "Taunsa Sharif",
      nameUr: "تونسہ شریف",
      slug: randomSlug,
      country: "Pakistan",
      province: "Punjab",
      division: "D.G. Khan Division",
      district: "Taunsa District",
      tehsil: "Taunsa",
      latitude: 30.7042,
      longitude: 70.6515,
      radiusKm: 12.0,
      isActive: true,
    },
  });

  assert.equal(newCity.name, "Taunsa Sharif");
  assert.equal(newCity.district, "Taunsa District");

  // 2. Add Area to New City
  const newArea = await prisma.area.create({
    data: {
      cityId: newCity.id,
      name: "Katchery Road",
      nameUr: "کچہری روڈ",
      postalCode: "32100",
      isActive: true,
    },
  });

  assert.equal(newArea.name, "Katchery Road");
  assert.equal(newArea.cityId, newCity.id);

  // 3. Cleanup
  await prisma.area.delete({ where: { id: newArea.id } });
  await prisma.city.delete({ where: { id: newCity.id } });
});

test("Phase 7 Multi-City: Strict Cross-City Tenant Data Isolation", async () => {
  const [jampur, rajanpur, dgKhan] = await Promise.all([
    prisma.city.findFirst({ where: { slug: "jampur" } }),
    prisma.city.findFirst({ where: { slug: "rajanpur" } }),
    prisma.city.findFirst({ where: { slug: "dg-khan" } }),
  ]);

  assert.ok(jampur && rajanpur && dgKhan, "All three baseline cities must exist");

  const passwordHash = await bcrypt.hash("Pass@12345", 10);
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);

  // 1. Create a merchant in Jampur and another in Rajanpur
  const category = await prisma.businessCategory.findFirst();
  assert.ok(category);

  const jampurMerchantUser = await prisma.user.create({
    data: {
      phoneNumber: `+9230011${randomSuffix}`,
      fullName: "Jampur Local Merchant",
      passwordHash,
      cityId: jampur.id,
      roles: { create: [{ roleId: "BUSINESS_OWNER" }] },
    },
  });

  const jampurBiz = await prisma.business.create({
    data: {
      cityId: jampur.id,
      ownerId: jampurMerchantUser.id,
      categoryId: category.id,
      name: `Jampur Local Sweets ${randomSuffix}`,
      slug: `jampur-local-sweets-${randomSuffix}`,
      phone: jampurMerchantUser.phoneNumber,
      status: "APPROVED",
      isVerified: true,
    },
  });

  const rajanpurMerchantUser = await prisma.user.create({
    data: {
      phoneNumber: `+9230022${randomSuffix}`,
      fullName: "Rajanpur Local Merchant",
      passwordHash,
      cityId: rajanpur.id,
      roles: { create: [{ roleId: "BUSINESS_OWNER" }] },
    },
  });

  const rajanpurBiz = await prisma.business.create({
    data: {
      cityId: rajanpur.id,
      ownerId: rajanpurMerchantUser.id,
      categoryId: category.id,
      name: `Rajanpur Auto Care ${randomSuffix}`,
      slug: `rajanpur-auto-care-${randomSuffix}`,
      phone: rajanpurMerchantUser.phoneNumber,
      status: "APPROVED",
      isVerified: true,
    },
  });

  // 2. Query Jampur Businesses
  const jampurQuery = await prisma.business.findMany({
    where: { cityId: jampur.id, status: "APPROVED" },
  });

  assert.ok(
    jampurQuery.some((b) => b.id === jampurBiz.id),
    "Jampur query must include Jampur business"
  );
  assert.ok(
    !jampurQuery.some((b) => b.id === rajanpurBiz.id),
    "Jampur query must NEVER include Rajanpur business"
  );

  // 3. Query Rajanpur Businesses
  const rajanpurQuery = await prisma.business.findMany({
    where: { cityId: rajanpur.id, status: "APPROVED" },
  });

  assert.ok(
    rajanpurQuery.some((b) => b.id === rajanpurBiz.id),
    "Rajanpur query must include Rajanpur business"
  );
  assert.ok(
    !rajanpurQuery.some((b) => b.id === jampurBiz.id),
    "Rajanpur query must NEVER include Jampur business"
  );

  // Cleanup
  await prisma.business.delete({ where: { id: jampurBiz.id } });
  await prisma.business.delete({ where: { id: rajanpurBiz.id } });
  await prisma.user.delete({ where: { id: jampurMerchantUser.id } });
  await prisma.user.delete({ where: { id: rajanpurMerchantUser.id } });
});

test.after(async () => {
  await prisma.$disconnect();
});
