import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

const signupSchema = z.object({
  phoneNumber: z
    .string()
    .min(10)
    .regex(/^[0-9+]+$/),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6),
  fullName: z.string().min(2),
  fullNameUr: z.string().optional(),
  cityId: z.string().min(1),
  role: z.enum(["CUSTOMER", "BUSINESS_OWNER"]).default("CUSTOMER"),
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(1000),
});

const businessRegistrationSchema = z.object({
  name: z.string().min(2),
  categoryId: z.string().min(1),
  cityId: z.string().min(1),
  phone: z.string().min(10),
  addressLine: z.string().min(3),
});

test("Validation: Valid Signup payload passes", () => {
  const validData = {
    phoneNumber: "+923001234567",
    email: "test@example.com",
    password: "Password123",
    fullName: "Muhammad Aslam",
    cityId: "city_jampur_01",
    role: "CUSTOMER",
  };
  const res = signupSchema.safeParse(validData);
  assert.equal(res.success, true);
});

test("Validation: Invalid phone number in signup fails", () => {
  const invalidData = {
    phoneNumber: "invalid-phone",
    password: "Password123",
    fullName: "Muhammad Aslam",
    cityId: "city_jampur_01",
  };
  const res = signupSchema.safeParse(invalidData);
  assert.equal(res.success, false);
});

test("Validation: Short password fails", () => {
  const invalidData = {
    phoneNumber: "+923001234567",
    password: "123",
    fullName: "Muhammad Aslam",
    cityId: "city_jampur_01",
  };
  const res = signupSchema.safeParse(invalidData);
  assert.equal(res.success, false);
});

test("Validation: Rating out of 1-5 range fails", () => {
  assert.equal(reviewSchema.safeParse({ rating: 6, comment: "Awesome shop" }).success, false);
  assert.equal(reviewSchema.safeParse({ rating: 0, comment: "Terrible" }).success, false);
  assert.equal(reviewSchema.safeParse({ rating: 5, comment: "Top quality service!" }).success, true);
  assert.equal(reviewSchema.safeParse({ rating: 1, comment: "Too short" }).success, true);
  assert.equal(reviewSchema.safeParse({ rating: 1, comment: "no" }).success, false); // Less than 3 chars
});

test("Validation: Business registration requires name, category, city, phone, and address", () => {
  const validBiz = {
    name: "Al-Razi Pharmacy",
    categoryId: "cat_pharmacy_01",
    cityId: "city_jampur_01",
    phone: "+923008765432",
    addressLine: "Indus Highway",
  };
  assert.equal(businessRegistrationSchema.safeParse(validBiz).success, true);

  const missingAddress = {
    name: "Al-Razi Pharmacy",
    categoryId: "cat_pharmacy_01",
    cityId: "city_jampur_01",
    phone: "+923008765432",
  };
  assert.equal(businessRegistrationSchema.safeParse(missingAddress).success, false);
});
