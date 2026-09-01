import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

test("Phase 2 Marketplace E2E: Full Lifecycle from Request to Quote, Acceptance, Completion & Review", async () => {
  const jampur = await prisma.city.findFirst({ where: { slug: "jampur" } });
  assert.ok(jampur, "Jampur city must exist");

  // 1. Create a test customer & test provider user
  const customerPhone = `+9230077${Math.floor(10000 + Math.random() * 90000)}`;
  const providerPhone = `+9230088${Math.floor(10000 + Math.random() * 90000)}`;
  const passwordHash = await bcrypt.hash("Pass@12345", 10);

  const customer = await prisma.user.create({
    data: {
      phoneNumber: customerPhone,
      fullName: "E2E Test Customer",
      passwordHash,
      cityId: jampur.id,
      roles: { create: [{ roleId: "CUSTOMER" }] },
    },
  });

  const providerUser = await prisma.user.create({
    data: {
      phoneNumber: providerPhone,
      fullName: "E2E Test Electrician",
      passwordHash,
      cityId: jampur.id,
      roles: { create: [{ roleId: "SERVICE_PROVIDER" }] },
    },
  });

  // 2. Provider Registration -> initial status must be PENDING
  const provider = await prisma.serviceProvider.create({
    data: {
      userId: providerUser.id,
      cityId: jampur.id,
      categorySlug: "electronics",
      primarySkill: "Master Solar & Inverter Tech",
      primarySkillUr: "ماسٹر سولر ٹیکنیشن",
      secondarySkills: JSON.stringify(["Solar Panels", "UPS"]),
      cnicNumber: "32402-0000000-1",
      experienceYears: 5,
      baseVisitFee: 600,
      serviceAreas: JSON.stringify(["Indus Highway", "Shahi Bazaar"]),
      status: "PENDING", // Strict check
      isVerified: false,
      isAvailable: false,
    },
  });

  assert.equal(provider.status, "PENDING");
  assert.equal(provider.isVerified, false);

  // Verify NOT visible in public search
  let publicProviders = await prisma.serviceProvider.findMany({
    where: { cityId: jampur.id, status: "APPROVED" },
  });
  assert.equal(publicProviders.some((p) => p.id === provider.id), false, "Pending provider must not be visible publicly");

  // 3. Admin Approves Provider
  const approvedProvider = await prisma.serviceProvider.update({
    where: { id: provider.id },
    data: {
      status: "APPROVED",
      isVerified: true,
      isAvailable: true,
    },
  });
  assert.equal(approvedProvider.status, "APPROVED");
  assert.equal(approvedProvider.isVerified, true);
  assert.equal(approvedProvider.isAvailable, true);

  // Now visible in public directory
  publicProviders = await prisma.serviceProvider.findMany({
    where: { cityId: jampur.id, status: "APPROVED" },
  });
  assert.equal(publicProviders.some((p) => p.id === provider.id), true, "Approved provider must be in directory");

  // 4. Customer Submits Service Request
  const request = await prisma.serviceRequest.create({
    data: {
      cityId: jampur.id,
      customerId: customer.id,
      categorySlug: "electronics",
      title: "Short Circuit & Solar Tripping",
      description: "Solar inverter trip kar raha hai aur load nahi utha raha.",
      urgency: "HIGH",
      addressLine: "Street # 2, Near Ghalla Mandi",
      area: "Ghalla Mandi",
      status: "OPEN",
    },
  });
  assert.equal(request.status, "OPEN");

  // Create notification for provider
  const leadNotification = await prisma.notification.create({
    data: {
      userId: providerUser.id,
      title: `New Service Request in ${jampur.name}`,
      message: `${request.title} — Tap to submit quote.`,
      type: "SERVICE_REQUEST",
      link: `/services/requests/${request.id}`,
    },
  });
  assert.ok(leadNotification.id);

  // 5. Provider Submits Quotation
  const quote = await prisma.quote.create({
    data: {
      requestId: request.id,
      providerId: provider.id,
      estimatedAmount: 2500,
      estimatedArrival: "Within 30 minutes",
      estimatedDuration: "1 hour",
      notes: "Full breaker testing and solar inverter calibration with 1-month warranty.",
      status: "PENDING",
    },
  });
  assert.ok(quote.id);
  assert.equal(quote.estimatedAmount, 2500);

  // Request transitions to QUOTED
  await prisma.serviceRequest.update({
    where: { id: request.id },
    data: { status: "QUOTED" },
  });

  // 6. Customer Accepts Quotation
  await prisma.quote.update({
    where: { id: quote.id },
    data: { status: "ACCEPTED" },
  });

  const assignedRequest = await prisma.serviceRequest.update({
    where: { id: request.id },
    data: {
      status: "ASSIGNED",
      assignedProviderId: provider.id,
      finalPrice: quote.estimatedAmount,
    },
  });
  assert.equal(assignedRequest.status, "ASSIGNED");
  assert.equal(assignedRequest.assignedProviderId, provider.id);
  assert.equal(assignedRequest.finalPrice, 2500);

  // Notification for winning provider
  const acceptNotification = await prisma.notification.create({
    data: {
      userId: providerUser.id,
      title: "Quote Accepted",
      message: `${customer.fullName} accepted your quote for PKR 2500.`,
      type: "QUOTE_ACCEPTED",
    },
  });
  assert.ok(acceptNotification.id);

  // 7. Provider Fulfills Job: IN_PROGRESS -> COMPLETED
  await prisma.serviceRequest.update({
    where: { id: request.id },
    data: { status: "IN_PROGRESS" },
  });

  const completedRequest = await prisma.serviceRequest.update({
    where: { id: request.id },
    data: { status: "COMPLETED" },
  });
  assert.equal(completedRequest.status, "COMPLETED");

  // 8. Customer Leaves 5-Star Review
  const review = await prisma.providerReview.create({
    data: {
      requestId: request.id,
      providerId: provider.id,
      customerId: customer.id,
      rating: 5,
      comment: "Bohat zabardast kaam kiya, time par pohanchay aur solar theek ho gaya!",
    },
  });
  assert.ok(review.id);
  assert.equal(review.rating, 5);

  // Update provider rating & metrics
  const aggregate = await prisma.providerReview.aggregate({
    where: { providerId: provider.id },
    _avg: { rating: true },
    _count: { id: true },
  });

  const updatedProvider = await prisma.serviceProvider.update({
    where: { id: provider.id },
    data: {
      ratingAverage: Number((aggregate._avg.rating || 0).toFixed(1)),
      reviewCount: aggregate._count.id,
      jobsCompleted: { increment: 1 },
      totalEarnings: { increment: 2500 },
    },
  });

  assert.equal(updatedProvider.ratingAverage, 5.0);
  assert.equal(updatedProvider.reviewCount, 1);
  assert.equal(updatedProvider.jobsCompleted, 1);
  assert.equal(updatedProvider.totalEarnings, 2500);

  // Cleanup test entities
  await prisma.providerReview.delete({ where: { id: review.id } });
  await prisma.quote.delete({ where: { id: quote.id } });
  await prisma.notification.deleteMany({ where: { userId: providerUser.id } });
  await prisma.serviceRequest.delete({ where: { id: request.id } });
  await prisma.serviceProvider.delete({ where: { id: provider.id } });
  await prisma.user.delete({ where: { id: customer.id } });
  await prisma.user.delete({ where: { id: providerUser.id } });
});

test.after(async () => {
  await prisma.$disconnect();
});
