import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

test("Phase 6 Student Ecosystem: Student Profile & Qualifications", async () => {
  const jampur = await prisma.city.findFirst({ where: { slug: "jampur" } });
  assert.ok(jampur, "Jampur city must exist");

  const passwordHash = await bcrypt.hash("Pass@12345", 10);
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);

  // 1. Create Student User
  const studentUser = await prisma.user.create({
    data: {
      phoneNumber: `+9230077${randomSuffix}`,
      fullName: "E2E Test Student",
      passwordHash,
      cityId: jampur.id,
      roles: { create: [{ roleId: "STUDENT" }] },
    },
  });

  // 2. Create Student Profile
  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      cityId: jampur.id,
      educationLevel: "BACHELORS",
      institutionName: "Govt Post Graduate College Jampur",
      fieldOfStudy: "BS Information Technology",
      skills: JSON.stringify(["React", "Node.js", "Python"]),
      interests: JSON.stringify(["Software Development", "Scholarships"]),
      graduationYear: 2027,
      bio: "Aspiring developer from Jampur.",
      cgpaOrMarks: "3.80 CGPA",
    },
  });

  assert.equal(studentProfile.educationLevel, "BACHELORS");
  assert.equal(studentProfile.fieldOfStudy, "BS Information Technology");
  assert.equal(studentProfile.graduationYear, 2027);

  // 3. Cleanup
  await prisma.studentProfile.delete({ where: { id: studentProfile.id } });
  await prisma.user.delete({ where: { id: studentUser.id } });
});

test("Phase 6 Opportunities & Applications: Posting, Verification & Submission", async () => {
  const jampur = await prisma.city.findFirst({ where: { slug: "jampur" } });
  assert.ok(jampur);

  const passwordHash = await bcrypt.hash("Pass@12345", 10);
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);

  const applicantUser = await prisma.user.create({
    data: {
      phoneNumber: `+9230066${randomSuffix}`,
      fullName: "Applicant Student",
      passwordHash,
      cityId: jampur.id,
      roles: { create: [{ roleId: "STUDENT" }] },
    },
  });

  const applicantProfile = await prisma.studentProfile.create({
    data: {
      userId: applicantUser.id,
      cityId: jampur.id,
      institutionName: "Govt College Jampur",
    },
  });

  // 1. Post an approved Opportunity
  const opportunity = await prisma.opportunity.create({
    data: {
      cityId: jampur.id,
      title: "PEEF Special Merit Scholarship 2026",
      type: "SCHOLARSHIP",
      organizationName: "Punjab Educational Endowment Fund",
      description: "Full grant for needy and meritorious students.",
      stipendOrSalary: "PKR 5,000 / month",
      applicationDeadline: new Date("2026-11-30"),
      status: "APPROVED",
      isVerified: true,
    },
  });

  assert.equal(opportunity.status, "APPROVED");
  assert.equal(opportunity.isVerified, true);

  // 2. Submit Application
  const application = await prisma.opportunityApplication.create({
    data: {
      opportunityId: opportunity.id,
      studentId: applicantProfile.id,
      coverLetter: "I am a high-achieving student in need of educational financial support.",
      status: "SUBMITTED",
    },
  });

  assert.equal(application.status, "SUBMITTED");

  // 3. Duplicate Prevention Test
  await assert.rejects(
    async () => {
      await prisma.opportunityApplication.create({
        data: {
          opportunityId: opportunity.id,
          studentId: applicantProfile.id,
          coverLetter: "Duplicate submission",
        },
      });
    },
    /Unique constraint failed/
  );

  // Cleanup
  await prisma.opportunityApplication.delete({ where: { id: application.id } });
  await prisma.opportunity.delete({ where: { id: opportunity.id } });
  await prisma.studentProfile.delete({ where: { id: applicantProfile.id } });
  await prisma.user.delete({ where: { id: applicantUser.id } });
});

test("Phase 6 Student Marketplace: Peer-to-Peer Listings & Lifecycle", async () => {
  const jampur = await prisma.city.findFirst({ where: { slug: "jampur" } });
  assert.ok(jampur);

  const passwordHash = await bcrypt.hash("Pass@12345", 10);
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);

  const sellerUser = await prisma.user.create({
    data: {
      phoneNumber: `+9230055${randomSuffix}`,
      fullName: "Seller Student",
      passwordHash,
      cityId: jampur.id,
    },
  });

  const sellerProfile = await prisma.studentProfile.create({
    data: {
      userId: sellerUser.id,
      cityId: jampur.id,
    },
  });

  // 1. Create Listing
  const listing = await prisma.studentListing.create({
    data: {
      studentId: sellerProfile.id,
      cityId: jampur.id,
      title: "MDCAT Biology & Chemistry Solved Past Papers",
      category: "BOOKS",
      price: 1200,
      condition: "GOOD",
      description: "Complete solved past papers 2018-2025.",
      contactPhone: sellerUser.phoneNumber,
      status: "ACTIVE",
    },
  });

  assert.equal(listing.category, "BOOKS");
  assert.equal(listing.price, 1200);
  assert.equal(listing.status, "ACTIVE");

  // 2. Mark as SOLD
  const soldListing = await prisma.studentListing.update({
    where: { id: listing.id },
    data: { status: "SOLD" },
  });
  assert.equal(soldListing.status, "SOLD");

  // Cleanup
  await prisma.studentListing.delete({ where: { id: listing.id } });
  await prisma.studentProfile.delete({ where: { id: sellerProfile.id } });
  await prisma.user.delete({ where: { id: sellerUser.id } });
});

test("Phase 6 Community & Organizations: Study Circles & Verified Colleges", async () => {
  const jampur = await prisma.city.findFirst({ where: { slug: "jampur" } });
  assert.ok(jampur);

  // 1. Check Seeded Educational Organization
  const orgs = await prisma.educationalOrganization.findMany({
    where: { cityId: jampur.id },
  });
  assert.ok(orgs.length >= 1, "Must have seeded colleges in Jampur");
  assert.ok(orgs.some((o) => o.name.includes("Govt Post Graduate College")));

  // 2. Check Seeded Study Circle
  const groups = await prisma.studentGroup.findMany({
    where: { cityId: jampur.id, isActive: true },
  });
  assert.ok(groups.length >= 1, "Must have active student study circles");
});

test.after(async () => {
  await prisma.$disconnect();
});
