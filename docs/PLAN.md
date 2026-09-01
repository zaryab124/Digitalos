# JAMPUR DIGITAL OS — EXECUTION PLAN (PLAN.md)

> **Phase 0 Completion Audit & Phase 1 (Core MVP) Execution Playbook**  
> *Strict adherence to the 11-Step Lifecycle. Zero premature implementations.*

---

## 1. Phase 0 Audit & Baseline Summary

### Inspection Report
* **Project Directory**: `c:\THE Digital ERA`
* **Pre-existing Code**: Greenfield repository (0 legacy code files, 0 obsolete dependencies).
* **Technical Debt / Existing Bugs**: None detected.
* **Master Architectural Artifacts Produced**:
  1. `README.md` — Repository overview, tech stack, modular layout, quickstart.
  2. `PRODUCT.md` — Full vision, user personas, localized UX, feature matrix.
  3. `ARCHITECTURE.md` — High-level architecture, C4 container diagram, multi-city tenancy.
  4. `DATABASE.md` — Master 34-entity data dictionary, ERD, indexing, phased table strategy.
  5. `API.md` — RESTful & real-time API specifications, response envelopes, endpoint catalog.
  6. `SECURITY.md` — Zero-trust model, RBAC matrix, OTP hashing, PII protection, audit trail.
  7. `BUSINESS_MODEL.md` — Regional economic model, 80/20 delivery split, payment gateways.
  8. `ROADMAP.md` — 9-phase master roadmap with clear milestones and exit gates.
  9. `PLAN.md` — This document.

---

## 2. Phase 1 — Core MVP Detailed Implementation Plan

When authorized to commence Phase 1, execution will strictly follow the **11-Step Engineering Lifecycle**:

$$\boxed{\text{ANALYZE}} \longrightarrow \boxed{\text{PLAN}} \longrightarrow \boxed{\text{DATABASE}} \longrightarrow \boxed{\text{API}} \longrightarrow \boxed{\text{UI}} \longrightarrow \boxed{\text{IMPLEMENT}} \longrightarrow \boxed{\text{TEST}} \longrightarrow \boxed{\text{FIX}} \longrightarrow \boxed{\text{SECURITY REVIEW}} \longrightarrow \boxed{\text{DOCUMENT}} \longrightarrow \boxed{\text{VERIFY}}$$

---

### Step 1 & 2: System Scaffolding & Environment
* **Framework**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + Lucide Icons + Shadcn UI component primitives.
* **Configuration Files**:
  - `package.json` with exact, secure production dependencies.
  - `tsconfig.json` with strict type checking (`strict: true`).
  - `tailwind.config.ts` configured with regional high-contrast theme tokens.
  - `.env.example` defining all required environment variables.

---

### Step 3: Database & ORM Setup (Phase 1 Entities Only)
* Configure Prisma ORM with PostgreSQL.
* Implement only the **Phase 1 Tables**:
  1. `cities` (Pre-seeded with Jampur, Rajanpur, D.G. Khan)
  2. `roles` (Pre-seeded with `CUSTOMER`, `BUSINESS_OWNER`, `SERVICE_PROVIDER`, `STUDENT`, `FARMER`, `RIDER`, `ADMIN`, `SUPER_ADMIN`)
  3. `users`
  4. `user_roles`
  5. `audit_logs`
  6. `business_categories` (Pre-seeded with local categories: Pharmacies, General Stores, Agri Chemicals, Electronics, Textiles, Food)
  7. `businesses`
  8. `business_locations` (with PostGIS coordinates)
  9. `business_hours`
* Run initial deterministic migration and seed script.

---

### Step 4: Authentication & Security Engine
* **Phone Number OTP Generator**:
  - Cryptographic 6-digit OTP stored in Redis with 5-minute TTL.
  - Rate limited to 3 attempts / 10 mins.
* **Session Management**:
  - Ed25519-signed JWT tokens stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
* **RBAC & Tenancy Middleware**:
  - Validates active session and enforces role-based endpoint access.
  - Resolves `city_id` from request headers or subdomain/route.

---

### Step 5: Core API Routes
* **Authentication**:
  - `POST /api/v1/auth/request-otp`
  - `POST /api/v1/auth/verify-otp`
  - `POST /api/v1/auth/login-password`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/users/me`
  - `PUT /api/v1/users/me`
* **Cities & Navigation**:
  - `GET /api/v1/cities`
  - `GET /api/v1/cities/:slug`
* **Directory & Businesses**:
  - `GET /api/v1/categories`
  - `GET /api/v1/businesses` (Filter by `city_id`, `category_id`, search query, verification status)
  - `GET /api/v1/businesses/:id`
  - `POST /api/v1/businesses` (Merchant registration)
  - `PUT /api/v1/businesses/:id` (Merchant update)
* **Admin Verification**:
  - `GET /api/v1/admin/businesses/pending`
  - `POST /api/v1/admin/businesses/:id/verify`

---

### Step 6: User Interface & Frontend Components
* **Global Layout & Navigation**:
  - Sticky Header with City Switcher dropdown (`Jampur` selected by default).
  - Language Toggle (`English` / `اردو` / `سرائیکی`).
  - Mobile Bottom Navigation Bar (Home, Directory, Services, Agri, Profile).
* **City Directory Pages**:
  - Homepage Hero: Fast search bar + Category pill grid.
  - Business Listing View: Filterable grid with verified badge, distance, rating, and open/closed indicator.
  - Business Detail Page: Photo gallery, call/WhatsApp buttons, location map, opening hours, business summary.
* **Authentication Modals & Views**:
  - Seamless Phone OTP login modal with countdown timer.
  - Merchant claim/registration workflow wizard.
* **City Admin Moderation Dashboard**:
  - Pending business approvals table with one-click verification and audit logging.

---

### Step 7 & 8: Testing & Security Verification
* **Automated Unit & Integration Tests**:
  - Vitest / Jest test suites for OTP generator, rate limiter, and JWT cookie parsing.
  - API endpoint integration tests verifying multi-city tenant scoping (Jampur records isolated from other cities).
  - RBAC security tests verifying unauthorized users are blocked with 403 Forbidden.
* **Security Audit**:
  - Confirm zero PII leakage in API responses.
  - Verify Zod schema sanitization across all request bodies.

---

## 3. Phase 1 Exit Criteria
1. PostgreSQL schema migrated with Phase 1 tables and initial seed data for Jampur.
2. Complete Phone OTP and Password authentication operational with HttpOnly cookies.
3. City Directory fully browsable with verified filtering, category navigation, and responsive mobile-first UI.
4. City switching functioning seamlessly via data configuration.
5. All test suites passing with zero security vulnerabilities.

---

## 🛑 Current Status: PHASE 0 COMPLETE

> **STOP**: Phase 0 architectural foundation and implementation planning are complete.  
> As per instructions, Phase 1 will NOT begin automatically. Awaiting explicit user confirmation.
