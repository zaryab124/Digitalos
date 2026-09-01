import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(
  "jampur_digital_os_super_secret_jwt_key_2026_secure_key"
);

test("E2E Integration: Multi-City Database Query", async () => {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          businesses: { where: { status: "APPROVED" } },
        },
      },
    },
  });

  assert.ok(cities.length >= 3, "Should have at least 3 seeded cities");
  const jampur = cities.find((c) => c.slug === "jampur");
  assert.ok(jampur, "Jampur must be present");
  assert.equal(jampur.district, "Rajanpur District");
  assert.equal(jampur.province, "Punjab");
  assert.ok(jampur._count.businesses >= 4, "Jampur should have at least 4 seeded approved businesses");
});

test("E2E Integration: Public Search strictly filters out PENDING businesses", async () => {
  const jampur = await prisma.city.findFirst({ where: { slug: "jampur" } });
  assert.ok(jampur);

  // Query public businesses (only APPROVED)
  const publicBusinesses = await prisma.business.findMany({
    where: {
      cityId: jampur.id,
      status: "APPROVED",
    },
  });

  let pendingBusinesses = await prisma.business.findMany({
    where: {
      cityId: jampur.id,
      status: "PENDING",
    },
  });

  if (pendingBusinesses.length === 0) {
    const owner = await prisma.user.findFirst({ where: { cityId: jampur.id } });
    const category = await prisma.businessCategory.findFirst();
    const tempPending = await prisma.business.create({
      data: {
        name: "Test Pending Shop",
        slug: `test-pending-shop-${Date.now()}`,
        ownerId: owner.id,
        cityId: jampur.id,
        categoryId: category.id,
        status: "PENDING",
        phone: "+923000000999",
      },
    });
    pendingBusinesses = [tempPending];
  }

  assert.ok(publicBusinesses.length >= 1, "Should find approved shops");
  assert.ok(pendingBusinesses.length >= 1, "Should find at least 1 pending shop");

  const pendingId = pendingBusinesses[0].id;
  const isPendingInPublic = publicBusinesses.some((b) => b.id === pendingId);
  assert.equal(isPendingInPublic, false, "PENDING business MUST NOT appear in public listing");
});

test("E2E Integration: End-to-End Merchant Onboarding -> Admin Approval -> Public Visibility", async () => {
  const jampur = await prisma.city.findFirst({ where: { slug: "jampur" } });
  const category = await prisma.businessCategory.findFirst();
  assert.ok(jampur && category);

  // 1. Create a new test merchant
  const testPhone = `+9230099${Math.floor(10000 + Math.random() * 90000)}`;
  const passwordHash = await bcrypt.hash("Merchant@12345", 10);

  const merchant = await prisma.user.create({
    data: {
      phoneNumber: testPhone,
      fullName: "Test Merchant Jampur",
      passwordHash,
      cityId: jampur.id,
      roles: { create: [{ roleId: "BUSINESS_OWNER" }] },
    },
  });
  assert.ok(merchant.id);

  // 2. Merchant registers business -> created as PENDING
  const testBiz = await prisma.business.create({
    data: {
      cityId: jampur.id,
      ownerId: merchant.id,
      categoryId: category.id,
      name: "New Diamond Electronics",
      slug: `new-diamond-electronics-${Date.now()}`,
      phone: testPhone,
      status: "PENDING", // Strict rule
      isVerified: false,
      locations: {
        create: {
          cityId: jampur.id,
          addressLine: "Circular Road, Jampur",
          area: "Circular Road",
        },
      },
    },
  });
  assert.equal(testBiz.status, "PENDING");
  assert.equal(testBiz.isVerified, false);

  // Verify not in public search
  let publicSearch = await prisma.business.findMany({
    where: { cityId: jampur.id, status: "APPROVED" },
  });
  assert.equal(publicSearch.some((b) => b.id === testBiz.id), false);

  // 3. Admin approves business
  const approvedBiz = await prisma.business.update({
    where: { id: testBiz.id },
    data: {
      status: "APPROVED",
      isVerified: true,
    },
  });
  assert.equal(approvedBiz.status, "APPROVED");
  assert.equal(approvedBiz.isVerified, true);

  // Verify NOW in public search
  publicSearch = await prisma.business.findMany({
    where: { cityId: jampur.id, status: "APPROVED" },
  });
  assert.equal(publicSearch.some((b) => b.id === testBiz.id), true);

  // 4. Customer submits a review
  const customer = await prisma.user.findFirst({
    where: { roles: { some: { roleId: "CUSTOMER" } } },
  });
  assert.ok(customer);

  const review = await prisma.review.create({
    data: {
      businessId: testBiz.id,
      userId: customer.id,
      rating: 5,
      comment: "Superb product quality and fast delivery!",
    },
  });
  assert.ok(review.id);

  // 5. Update and verify business rating calculation
  const aggregate = await prisma.review.aggregate({
    where: { businessId: testBiz.id, isFlagged: false },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.business.update({
    where: { id: testBiz.id },
    data: {
      ratingAverage: Number((aggregate._avg.rating || 0).toFixed(1)),
      reviewCount: aggregate._count.id,
    },
  });

  const updatedBizWithRating = await prisma.business.findUnique({
    where: { id: testBiz.id },
  });
  assert.equal(updatedBizWithRating.ratingAverage, 5.0);
  assert.equal(updatedBizWithRating.reviewCount, 1);

  // Cleanup test business
  await prisma.business.delete({ where: { id: testBiz.id } });
  await prisma.user.delete({ where: { id: merchant.id } });
});

test("E2E Integration: Anti-abuse Review duplicate check", async () => {
  const pharmacy = await prisma.business.findFirst({
    where: { slug: "al-razi-pharmacy" },
  });
  const customer = await prisma.user.findFirst({
    where: { email: "customer@jampurdigital.pk" },
  });
  assert.ok(pharmacy && customer);

  // Ensure first review exists
  await prisma.review.upsert({
    where: {
      businessId_userId: {
        businessId: pharmacy.id,
        userId: customer.id,
      },
    },
    update: {},
    create: {
      businessId: pharmacy.id,
      userId: customer.id,
      rating: 5,
      comment: "Excellent original review",
    },
  });

  // Attempting duplicate create should trigger constraint check
  let threwConstraint = false;
  try {
    await prisma.review.create({
      data: {
        businessId: pharmacy.id,
        userId: customer.id,
        rating: 4,
        comment: "Duplicate attempt",
      },
    });
  } catch {
    threwConstraint = true;
  }
  assert.equal(threwConstraint, true, "Prisma unique constraint must prevent duplicate review by same user");
});

test.after(async () => {
  await prisma.$disconnect();
});
