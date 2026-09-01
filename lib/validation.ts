import { z } from "zod";

// Phase 1 Auth & Profile Schemas
export const signupSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+]+$/, "Phone number must contain only numbers and optional leading +"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  fullNameUr: z.string().optional(),
  cityId: z.string().min(1, "City selection is required"),
  role: z.enum(["CUSTOMER", "BUSINESS_OWNER", "SERVICE_PROVIDER", "RIDER"]).default("CUSTOMER"),
  preferredLanguage: z.enum(["en", "ur", "skr"]).default("ur"),
});

export const loginSchema = z.object({
  identifier: z.string().min(3, "Phone number or email is required"),
  password: z.string().min(1, "Password is required"),
});

// Phase 1 Business Schemas
export const businessRegistrationSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  nameUr: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  cityId: z.string().min(1, "City is required"),
  phone: z.string().min(10, "Contact phone is required"),
  whatsapp: z.string().optional(),
  description: z.string().optional(),
  descriptionUr: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  addressLine: z.string().min(3, "Address is required"),
  addressLineUr: z.string().optional(),
  area: z.string().default("City Center"),
  landmark: z.string().optional(),
  latitude: z.number().optional().default(29.6433),
  longitude: z.number().optional().default(70.5950),
  hours: z
    .array(
      z.object({
        dayOfWeek: z.number().min(0).max(6),
        openTime: z.string().default("09:00"),
        closeTime: z.string().default("21:00"),
        isClosed: z.boolean().default(false),
      })
    )
    .optional(),
});

export const businessUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  nameUr: z.string().optional(),
  categoryId: z.string().optional(),
  phone: z.string().min(10).optional(),
  whatsapp: z.string().optional(),
  description: z.string().optional(),
  descriptionUr: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  addressLine: z.string().min(3).optional(),
  addressLineUr: z.string().optional(),
  area: z.string().optional(),
  landmark: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  hours: z
    .array(
      z.object({
        dayOfWeek: z.number().min(0).max(6),
        openTime: z.string(),
        closeTime: z.string(),
        isClosed: z.boolean(),
      })
    )
    .optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product or service name is required"),
  nameUr: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  compareAtPrice: z.number().positive().optional().nullable(),
  unit: z.string().default("piece"),
  stockQuantity: z.number().int().min(0).default(100),
  sku: z.string().optional().nullable(),
  isAvailable: z.boolean().default(true),
  isDeliveryAvailable: z.boolean().default(true),
  imageUrl: z.string().optional().nullable(),
  discountPercentage: z.number().min(0).max(100).default(0),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(1000),
});

export const reviewReportSchema = z.object({
  reason: z.string().min(5, "Please provide a valid reason for reporting this review"),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  nameUr: z.string().optional(),
  slug: z.string().min(2, "Slug is required"),
  icon: z.string().default("store"),
  description: z.string().optional(),
});

// Phase 2 Services Marketplace Schemas
export const serviceRequestSchema = z.object({
  cityId: z.string().min(1, "City selection is required"),
  serviceId: z.string().optional().nullable(),
  categorySlug: z.string().min(1, "Category is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Please describe the problem clearly (at least 5 characters)"),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "EMERGENCY"]).default("MEDIUM"),
  addressLine: z.string().min(3, "Address is required"),
  area: z.string().default("City Center"),
  preferredDate: z.string().optional().nullable(),
  preferredTimeSlot: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
});

export const providerRegistrationSchema = z.object({
  cityId: z.string().min(1, "City selection is required"),
  categorySlug: z.string().min(1, "Service category is required"),
  primarySkill: z.string().min(3, "Primary skill is required"),
  primarySkillUr: z.string().optional(),
  secondarySkills: z.array(z.string()).optional().default([]),
  cnicNumber: z.string().min(13, "Valid 13-digit CNIC is required (e.g. 32402-1234567-1)"),
  experienceYears: z.number().int().min(1, "At least 1 year experience required"),
  baseVisitFee: z.number().min(0, "Base fee must be zero or positive"),
  serviceAreas: z.array(z.string()).optional().default(["All Jampur"]),
  portfolioPhotos: z.array(z.string()).optional().default([]),
});

export const quoteSubmissionSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  estimatedAmount: z.number().positive("Estimated amount must be a positive number"),
  estimatedArrival: z.string().min(2, "Estimated arrival time is required"),
  estimatedDuration: z.string().default("1-2 hours"),
  notes: z.string().optional(),
});

export const providerReviewSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(1000),
});

// ----------------------------------------------------
// PHASE 3: COMMERCE, ORDERS & DELIVERY SCHEMAS
// ----------------------------------------------------

export const checkoutSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  cityId: z.string().min(1, "City is required"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "At least one item is required in cart"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  deliveryArea: z.string().default("City Center"),
  deliveryNotes: z.string().optional().nullable(),
  paymentMethod: z
    .enum(["COD", "RAAST", "JAZZCASH", "EASYPAISA", "BANK_TRANSFER"])
    .default("COD"),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "ACCEPTED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
  ]),
  riderId: z.string().optional().nullable(),
  deliveryPin: z.string().optional().nullable(),
});

export const riderRegistrationSchema = z.object({
  cityId: z.string().min(1, "City selection is required"),
  vehicleType: z.enum(["MOTORCYCLE", "RICKSHAW", "BICYCLE"]).default("MOTORCYCLE"),
  vehicleNumber: z.string().min(3, "Vehicle registration number is required"),
  cnicNumber: z.string().min(13, "Valid CNIC number is required"),
});

export const offerSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  title: z.string().min(3, "Offer title is required"),
  titleUr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  discountPercentage: z.number().min(1).max(99),
  minOrderAmount: z.number().min(0).default(0),
  bannerUrl: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string(),
});

export const orderReviewSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, "Please write a comment"),
  riderRating: z.number().int().min(1).max(5).optional().nullable(),
});
