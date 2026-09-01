# JAMPUR DIGITAL OS — MASTER ARCHITECTURE (ARCHITECTURE.md)

> **Enterprise System Architecture & Infrastructure Blueprint**  
> *Scalable, Resilient, and Data-Driven Architecture for Hyperlocal Community Operating Systems.*

---

## 1. Architectural Principles

1. **City as Data, Not Logic**: Every operational domain is tenant-isolated by `city_id`. Expanding to Rajanpur, D.G. Khan, or any new tehsil requires zero codebase changes—only a new record in the `cities` table and associated configuration tables.
2. **Unified Core with Modular Boundaries**: The system consists of distinct, high-cohesion domain modules (Commerce, Services, Agri, Education, Logistics, AI) sharing a centralized database, authentication, and event pipeline.
3. **Mobile-First & Bandwidth Conscious**: Optimized for 3G/4G connectivity, low-latency client rendering, aggressive edge caching for static catalogs, and progressive asset loading.
4. **Multimodal AI Integration**: AI is not an isolated gimmick; it is natively embedded across the database and API pipeline (Voice transcription, Urdu/Saraiki natural language translation, vision-based crop disease diagnosis, and intelligent merchant matching).
5. **Strict Security & Zero-Trust Data Access**: Role-Based Access Control (RBAC) enforced at both the API middleware and database query layers. PII data (CNIC, phone, financial details) is strictly protected.

---

## 2. High-Level System Architecture

```
+---------------------------------------------------------------------------------------------------+
|                                      CLIENT APPLICATION LAYER                                     |
|  +---------------------------------------------------------------------------------------------+  |
|  |     Citizen Web/PWA     |  Merchant Dashboard  |  Service Provider Portal |  Rider Dispatch  |  |
|  |     Farmer Agri Hub     |  Student Career Hub  |  City Admin Console      |  Super Admin     |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
                                                │
                                    HTTPS / WSS / REST / SSE
                                                ▼
+---------------------------------------------------------------------------------------------------+
|                                  EDGE & REVERSE PROXY LAYER                                       |
|  Cloudflare Edge CDN / NGINX Ingress | SSL Termination | WAF | Geo-DNS | Static Asset Cache        |
+---------------------------------------------------------------------------------------------------+
                                                │
                                                ▼
+---------------------------------------------------------------------------------------------------+
|                                    APPLICATION / API LAYER                                        |
|  Next.js 15 App Router & API Route Handlers (Node.js LTS / TypeScript)                            |
|  ┌───────────────────┬───────────────────┬───────────────────┬───────────────────┐                |
|  │  Auth & RBAC      │  City Tenancy     │  Commerce Engine  │  Services Engine  │                |
|  ├───────────────────┼───────────────────┼───────────────────┼───────────────────┤                |
|  │  Agri/Mandi Hub   │  Student Hub      │  Logistics Router │  AI Multimodal    │                |
|  └───────────────────┴───────────────────┴───────────────────┴───────────────────┘                |
+---------------------------------------------------------------------------------------------------+
        │                             │                            │                    │
        ▼                             ▼                            ▼                    ▼
+─────────────────+         +───────────────────+         +─────────────────+  +─────────────────+
|   DATA LAYER    |         |   CACHE & QUEUES  |         |   STORAGE & S3  |  |  EXTERNAL APIS  |
|  PostgreSQL 16+ |         |   Redis / Upstash |         |   Cloudflare R2 |  |  - Gemini AI    |
|  - Relational   |         |   - Rate Limiting |         |   / MinIO / S3  |  |  - SMS Gateway  |
|  - PostGIS      |         |   - BullMQ Jobs   |         |   - Encrypted   |  |  - WhatsApp API |
|  - PgBouncer    |         |   - Session Store |         |     Doc Bucket  |  |  - Raast/1Link  |
|  - Full-Text    |         |   - Real-time Loc |         |   - Media Store |  |  - Weather API  |
+─────────────────+         +───────────────────+         +─────────────────+  +─────────────────+
```

---

## 3. Technology Stack Breakdown & Rationale

```
+---------------------------------------------------------------------------------------------------+
| LAYER               | TECHNOLOGY SELECTION                 | ARCHITECTURAL JUSTIFICATION          |
+---------------------+--------------------------------------+--------------------------------------+
| Web Client & PWA    | Next.js 15 (React 19, TypeScript)    | SSR for SEO-indexed local shops;     |
|                     | Tailwind CSS v4, Lucide Icons        | lightning-fast initial byte delivery |
+---------------------+--------------------------------------+--------------------------------------+
| State & Network     | TanStack Query (React Query) + Zustand| Declarative server-state caching,     |
|                     |                                      | offline optimistic mutation updates  |
+---------------------+--------------------------------------+--------------------------------------+
| Backend Runtime     | Node.js 20 LTS (Next.js Handlers)    | Shared TypeScript types end-to-end;   |
|                     | Edge runtime for geolocation filters | zero context-switching overhead      |
+---------------------+--------------------------------------+--------------------------------------+
| Primary Database    | PostgreSQL 16+ with PostGIS          | ACID reliability, relational schemas,|
|                     |                                      | spatial distance queries for riders  |
+---------------------+--------------------------------------+--------------------------------------+
| ORM & Data Layer    | Prisma ORM / Drizzle ORM             | Type-safe queries, deterministic     |
|                     |                                      | migrations, zero SQL injections      |
+---------------------+--------------------------------------+--------------------------------------+
| Caching & Queues    | Redis 7 (Upstash / Redis Cluster)    | Token-bucket rate limiting, realtime |
|                     | BullMQ for background worker queues  | dispatch state, async job execution  |
+---------------------+--------------------------------------+--------------------------------------+
| Real-Time Events    | Server-Sent Events (SSE) & WebSocket | Instant push notifications, live     |
|                     |                                      | rider movement, order status stream  |
+---------------------+--------------------------------------+--------------------------------------+
| AI & LLM Engine     | Google Gemini 1.5 Pro / Flash        | Crop disease image diagnosis, Urdu/  |
|                     | Whisper Speech-to-Text               | Saraiki voice intent classification  |
+---------------------+--------------------------------------+--------------------------------------+
| Object Storage      | S3-Compatible (Cloudflare R2 / S3)   | Presigned URLs, strict ACLs for CNIC |
|                     |                                      | and trade license verification files |
+---------------------+--------------------------------------+--------------------------------------+
| Auth & Security     | Custom Secure Session / Lucia Auth   | HttpOnly secure cookie JWTs, phone   |
|                     | Argon2id password hashing            | OTP verification, RBAC middleware    |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. Multi-City Tenancy & Data Isolation Model

To guarantee seamless multi-city expansion, Jampur Digital OS adopts a **Shared Database, Shared Schema with Explicit Foreign Key Tenancy** model.

```
                  ┌──────────────────────┐
                  │    cities table      │
                  ├──────────────────────┤
                  │ id: "city_jampur"    │
                  │ name: "Jampur"       │
                  │ slug: "jampur"       │
                  │ lat: 29.6433         │
                  │ lng: 70.5950         │
                  │ is_active: true      │
                  └──────────┬───────────┘
                             │ 1-to-Many
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌──────────────────┐┌──────────────────┐┌──────────────────┐
│ businesses table ││ providers table  ││ market_prices    │
├──────────────────┤├──────────────────┤├──────────────────┤
│ id: "biz_101"    ││ id: "prv_202"    ││ id: "mkt_303"    │
│ city_id: jampur  ││ city_id: jampur  ││ city_id: jampur  │
│ name: "Al-Madina"││ name: "Tariq AC" ││ crop: "Wheat"    │
└──────────────────┘└──────────────────┘└──────────────────┘
```

### Tenancy Resolution Rules:
1. **Header / Route Extraction**: API requests pass either a `X-City-Slug` header or the URL route prefix `/{city_slug}/...`.
2. **Context Middleware**: Backend middleware validates `city_id` and attaches the validated city context to the request pipeline.
3. **Scoped Queries**: Every search, product catalog, mandi rate, and service provider listing automatically appends `WHERE city_id = :current_city_id` at the query builder layer.
4. **Cross-City Super Admin Mode**: Super Admins can query aggregate cross-city metrics using tenant-agnostic administrative flags.

---

## 5. Domain Subsystems & Data Flow Lifecycles

### A. Commerce & On-Demand Delivery Lifecycle
```
[Customer Places Order] ──► [Cart Validated against Merchant Inventory]
                                        │
                                        ▼
[PostgreSQL Transaction: Order Created (Status: PENDING_ACCEPTANCE)]
                                        │
                                        ▼
[Merchant Dashboard Alerted via SSE] ──► [Merchant Accepts Order (Status: PREPARING)]
                                        │
                                        ▼
[Redis BullMQ Dispatch Engine: Finds Available Riders within 5km radius via PostGIS]
                                        │
                                        ▼
[Rider Accepts Assignment] ──► [Rider Picks Up (Status: IN_TRANSIT)]
                                        │
                                        ▼
[Real-Time PostGIS Coordinate Broadcast to Customer Web Map via SSE]
                                        │
                                        ▼
[Rider Completes Delivery + Digital OTP Verification (Status: DELIVERED)]
                                        │
                                        ▼
[Financial Ledger Balance Released to Merchant & Rider Wallets]
```

---

### B. Service Provider Request & Quotation Lifecycle
```
[Customer Submits Service Request (Category, Issue Description, Photos/Audio)]
                                        │
                                        ▼
[Matching Vetted Providers in Jampur Alerted via SMS / App Notification]
                                        │
                                        ▼
[Providers Submit Digital Quotations (Estimated Cost, Earliest Time Slot)]
                                        │
                                        ▼
[Customer Compares Quotes & Reviews ──► Accepts Quotation]
                                        │
                                        ▼
[Provider Arrives & Performs Service ──► Marks Job Completed]
                                        │
                                        ▼
[Customer Verifies & Submits Star Rating + Public Review]
```

---

### C. Farmer AI Crop Diagnostics Lifecycle
```
[Farmer Captures Image of Diseased Crop Leaf (Wheat / Cotton / Mango)]
                                        │
                                        ▼
[Secure Presigned S3 Upload + Image Preprocessing (Auto-contrast & Compression)]
                                        │
                                        ▼
[Multimodal Gemini Vision Pipeline Analyzes Pathological Markers]
                                        │
                                        ▼
[AI Response Formulated with Disease Classification, Severity & Treatment Protocol]
                                        │
                                        ▼
[Response Translated into Urdu & Saraiki + Audio Text-to-Speech Output]
                                        │
                                        ▼
[Recommended Pesticide / Fertilizer Linked to Verified Jampur Agri Dealers in Directory]
```

---

## 6. Real-Time Logistics & Geolocation Engine

```
+─────────────────────────────────────────────────────────────────────────+
|                           RIDER GEOLOCATION STREAM                      |
+─────────────────────────────────────────────────────────────────────────+
| 1. Rider Device transmits GPS ping (lat, lng, heading) every 5s via WSS |
| 2. Next.js WebSocket Gateway writes coordinate to Redis GeoSet:         |
|    GEOADD riders:active:jampur <lng> <lat> <rider_id>                   |
| 3. Customer SSE channel reads location and renders smooth map marker    |
| 4. Delivery complete -> Coordinates archived to PostGIS trip log        |
+─────────────────────────────────────────────────────────────────────────+
```

---

## 7. Scalability, Resilience & High Availability (HA)

```
                       ┌─────────────────────────┐
                       │   Cloudflare Anycast    │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │     NGINX Load Balancer │
                       └──────┬───────────┬──────┘
                              │           │
                 ┌────────────▼──┐     ┌──▼────────────┐
                 │  Next.js Web  │     │  Next.js Web  │
                 │   Node #1     │     │   Node #2     │
                 └────────────┬──┘     └──┬────────────┘
                              │           │
                              ▼           ▼
                       ┌─────────────────────────┐
                       │    PgBouncer Pooler     │
                       └──────┬───────────┬──────┘
                              │           │
                 ┌────────────▼──┐     ┌──▼────────────┐
                 │ PostgreSQL 16 │     │ PostgreSQL 16 │
                 │ Primary (R/W) │────►│ Read Replica  │
                 └───────────────┘     └───────────────┘
```

1. **Connection Pooling**: PgBouncer sits before PostgreSQL to handle thousands of concurrent short-lived serverless connections without exhausting database sockets.
2. **Stateless App Nodes**: Next.js servers maintain zero local state. All sessions, cache, and queue states reside in Redis.
3. **Database Read Replicas**: Heavy read traffic (browsing shops, searching directory, reading mandi rates) is offloaded to read replicas, keeping the primary instance dedicated to ACID transactions.
4. **Graceful Degradation**: If third-party SMS or AI APIs experience external downtime, fallback queues capture transactions for asynchronous retry without blocking user workflows.

---

*Document Status: APPROVED BASELINE FOR PHASE 0*
