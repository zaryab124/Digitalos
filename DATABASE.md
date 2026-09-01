# JAMPUR DIGITAL OS — DATABASE MASTER SPECIFICATION (DATABASE.md)

> **Enterprise PostgreSQL Relational Schema & Data Architecture**  
> *Fully Normalized, Multi-Tenant, High-Performance Database Design.*

---

## 1. Database Philosophy & Architecture Guidelines

1. **Relational Engine**: PostgreSQL 16+ with extensions:
   - `uuid-ossp` / `pgcrypto` for cryptographic UUID primary keys.
   - `postgis` for spatial geolocation and rider proximity queries.
   - `pg_trgm` for fuzzy and multilingual search in Urdu/English shop names.
2. **Explicit Multi-City Tenancy**: All municipal domain tables maintain a foreign key `city_id REFERENCES cities(id)`.
3. **Data Integrity & Immutability**: Financial transactions, audit logs, and status transitions use strict constraints, foreign keys, and immutable event logs.
4. **Phased Schema Implementation Rule**:
   > **CRITICAL RULE**: The full master schema is documented below for architectural completeness. However, **NO migration or table is created in the database until its specific phase is actively executed**.

---

## 2. Entity Relationship Overview (ERD)

```
                    ┌─────────────────────────┐
                    │         cities          │
                    └────────────┬────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐           ┌───────────────┐
│     users     │         │  businesses   │           │ market_prices │
└───────┬───────┘         └───────┬───────┘           └───────────────┘
        │                         │
 ┌──────┴──────┐           ┌──────┴──────┐
 ▼             ▼           ▼             ▼
┌────────┐ ┌────────┐ ┌─────────┐   ┌─────────┐
│ roles  │ │ orders │ │products │   │ offers  │
└────────┘ └───┬────┘ └─────────┘   └─────────┘
               ▼
        ┌──────────────┐
        │  deliveries  │
        └──────┬───────┘
               ▼
        ┌──────────────┐
        │    riders    │
        └──────────────┘
```

---

## 3. Comprehensive Master Data Dictionary (34 Core Entities)

### Core Tenancy & Identity (Phase 1)

#### 1. `cities`
Master registry of supported administrative cities/tehsils.
- `id` (UUID, PK)
- `name` (VARCHAR(100), NOT NULL) — e.g. "Jampur"
- `name_ur` (VARCHAR(100)) — e.g. "جام پور"
- `slug` (VARCHAR(100), UNIQUE, NOT NULL) — e.g. "jampur"
- `district` (VARCHAR(100), NOT NULL) — e.g. "Rajanpur"
- `province` (VARCHAR(100), NOT NULL) — e.g. "Punjab"
- `latitude` (DECIMAL(10, 8), NOT NULL) — 29.6433
- `longitude` (DECIMAL(11, 8), NOT NULL) — 70.5950
- `radius_km` (DECIMAL(5, 2), DEFAULT 15.0)
- `is_active` (BOOLEAN, DEFAULT true)
- `config` (JSONB, DEFAULT '{}') — Local currency, tax rates, delivery fee baselines
- `created_at` / `updated_at` (TIMESTAMPTZ)

#### 2. `roles`
Role-Based Access Control definitions.
- `id` (VARCHAR(50), PK) — `CUSTOMER`, `BUSINESS_OWNER`, `SERVICE_PROVIDER`, `STUDENT`, `FARMER`, `RIDER`, `ADMIN`, `SUPER_ADMIN`
- `name` (VARCHAR(100), NOT NULL)
- `description` (TEXT)
- `permissions` (JSONB, NOT NULL) — Array of granular permission strings
- `created_at` (TIMESTAMPTZ)

#### 3. `users`
Central user accounts with multi-role support.
- `id` (UUID, PK)
- `city_id` (UUID, FK -> cities.id, NOT NULL)
- `phone_number` (VARCHAR(20), UNIQUE, NOT NULL) — E.164 format (+923001234567)
- `email` (VARCHAR(255), UNIQUE, NULLABLE)
- `password_hash` (VARCHAR(255), NULLABLE) — Argon2id hash for email/password users
- `full_name` (VARCHAR(150), NOT NULL)
- `full_name_ur` (VARCHAR(150))
- `avatar_url` (TEXT)
- `preferred_language` (VARCHAR(10), DEFAULT 'ur') — 'en', 'ur', 'skr' (Saraiki)
- `is_phone_verified` (BOOLEAN, DEFAULT false)
- `is_active` (BOOLEAN, DEFAULT true)
- `created_at` / `updated_at` (TIMESTAMPTZ)

#### 4. `user_roles`
Many-to-many relationship between users and roles.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, NOT NULL)
- `role_id` (VARCHAR(50), FK -> roles.id, NOT NULL)
- `created_at` (TIMESTAMPTZ)
- *Unique Constraint*: `(user_id, role_id)`

#### 5. `audit_logs`
Immutable audit log for security, administrative actions, and data changes.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, NULLABLE)
- `action` (VARCHAR(100), NOT NULL) — e.g. "BUSINESS_VERIFIED", "ROLE_ASSIGNED"
- `entity_type` (VARCHAR(50), NOT NULL)
- `entity_id` (VARCHAR(100), NOT NULL)
- `old_values` (JSONB)
- `new_values` (JSONB)
- `ip_address` (VARCHAR(45))
- `user_agent` (TEXT)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

---

### Local Businesses & Commerce Directory (Phases 1 & 3)

#### 6. `business_categories`
Hierarchical taxonomy for local businesses and shops.
- `id` (UUID, PK)
- `parent_id` (UUID, FK -> business_categories.id, NULLABLE)
- `slug` (VARCHAR(100), UNIQUE, NOT NULL)
- `name` (VARCHAR(100), NOT NULL) — e.g. "Pharmacies"
- `name_ur` (VARCHAR(100)) — e.g. "میڈیکل سٹورز"
- `icon_url` (TEXT)
- `is_active` (BOOLEAN, DEFAULT true)

#### 7. `businesses`
Verified local shops, clinics, wholesalers, and restaurants.
- `id` (UUID, PK)
- `city_id` (UUID, FK -> cities.id, NOT NULL)
- `owner_id` (UUID, FK -> users.id, NOT NULL)
- `category_id` (UUID, FK -> business_categories.id, NOT NULL)
- `name` (VARCHAR(200), NOT NULL)
- `name_ur` (VARCHAR(200))
- `slug` (VARCHAR(200), NOT NULL)
- `description` (TEXT)
- `description_ur` (TEXT)
- `phone` (VARCHAR(20), NOT NULL)
- `whatsapp` (VARCHAR(20))
- `banner_url` (TEXT)
- `logo_url` (TEXT)
- `is_verified` (BOOLEAN, DEFAULT false)
- `is_featured` (BOOLEAN, DEFAULT false)
- `rating_average` (DECIMAL(3, 2), DEFAULT 0.0)
- `review_count` (INTEGER, DEFAULT 0)
- `created_at` / `updated_at` (TIMESTAMPTZ)
- *Unique Constraint*: `(city_id, slug)`

#### 8. `business_locations`
Physical shop addresses with spatial coordinates.
- `id` (UUID, PK)
- `business_id` (UUID, FK -> businesses.id, NOT NULL)
- `address_line` (TEXT, NOT NULL) — e.g. "Main Indus Highway, Near Al-Razi Hospital"
- `landmark` (VARCHAR(150))
- `latitude` (DECIMAL(10, 8), NOT NULL)
- `longitude` (DECIMAL(11, 8), NOT NULL)
- `geom` (GEOMETRY(Point, 4326)) — PostGIS Spatial index

#### 9. `business_hours`
Weekly operating hours and open/closed status.
- `id` (UUID, PK)
- `business_id` (UUID, FK -> businesses.id, NOT NULL)
- `day_of_week` (INTEGER, NOT NULL) — 0 (Sunday) to 6 (Saturday)
- `open_time` (TIME, NOT NULL)
- `close_time` (TIME, NOT NULL)
- `is_closed` (BOOLEAN, DEFAULT false)

#### 10. `products`
Items sold by local businesses.
- `id` (UUID, PK)
- `business_id` (UUID, FK -> businesses.id, NOT NULL)
- `name` (VARCHAR(200), NOT NULL)
- `name_ur` (VARCHAR(200))
- `description` (TEXT)
- `price` (DECIMAL(12, 2), NOT NULL)
- `compare_at_price` (DECIMAL(12, 2))
- `unit` (VARCHAR(50), DEFAULT 'piece') — 'kg', 'liter', 'piece', 'box'
- `stock_quantity` (INTEGER, DEFAULT 0)
- `images` (TEXT[], DEFAULT '{}')
- `is_available` (BOOLEAN, DEFAULT true)
- `created_at` / `updated_at` (TIMESTAMPTZ)

---

### Services Marketplace (Phase 2)

#### 11. `services`
Master catalog of standardized home and technical services.
- `id` (UUID, PK)
- `category_id` (UUID, FK -> business_categories.id, NOT NULL)
- `name` (VARCHAR(150), NOT NULL) — e.g. "Solar Inverter Installation"
- `name_ur` (VARCHAR(150)) — e.g. "سولر انورٹر فٹنگ"
- `base_price_estimate` (DECIMAL(10, 2))

#### 12. `service_providers`
Artisan and technician professional profiles.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, NOT NULL)
- `city_id` (UUID, FK -> cities.id, NOT NULL)
- `primary_skill` (VARCHAR(100), NOT NULL)
- `secondary_skills` (TEXT[], DEFAULT '{}')
- `cnic_number` (VARCHAR(20), NOT NULL)
- `cnic_document_url` (TEXT) — Private S3 object
- `experience_years` (INTEGER, DEFAULT 1)
- `is_cnic_verified` (BOOLEAN, DEFAULT false)
- `is_available` (BOOLEAN, DEFAULT true)
- `rating_average` (DECIMAL(3, 2), DEFAULT 0.0)
- `jobs_completed` (INTEGER, DEFAULT 0)

#### 13. `service_requests`
Customer lead requests for repairs and technical work.
- `id` (UUID, PK)
- `customer_id` (UUID, FK -> users.id, NOT NULL)
- `city_id` (UUID, FK -> cities.id, NOT NULL)
- `service_id` (UUID, FK -> services.id, NOT NULL)
- `status` (VARCHAR(50), DEFAULT 'OPEN') — OPEN, QUOTED, ASSIGNED, COMPLETED, CANCELLED
- `title` (VARCHAR(200), NOT NULL)
- `description` (TEXT, NOT NULL)
- `audio_note_url` (TEXT) — Saraiki/Urdu voice recording of problem
- `photos` (TEXT[], DEFAULT '{}')
- `address` (TEXT, NOT NULL)
- `preferred_date` (DATE)
- `created_at` / `updated_at` (TIMESTAMPTZ)

#### 14. `quotes`
Bid/quotation submitted by a service provider to a customer.
- `id` (UUID, PK)
- `request_id` (UUID, FK -> service_requests.id, NOT NULL)
- `provider_id` (UUID, FK -> service_providers.id, NOT NULL)
- `estimated_amount` (DECIMAL(10, 2), NOT NULL)
- `notes` (TEXT)
- `earliest_arrival` (TIMESTAMPTZ)
- `status` (VARCHAR(50), DEFAULT 'PENDING') — PENDING, ACCEPTED, REJECTED, EXPIRED
- `created_at` (TIMESTAMPTZ)

---

### Commerce Orders, Payments & Logistics (Phase 3)

#### 15. `orders`
E-commerce orders placed with local merchants.
- `id` (UUID, PK)
- `city_id` (UUID, FK -> cities.id, NOT NULL)
- `customer_id` (UUID, FK -> users.id, NOT NULL)
- `business_id` (UUID, FK -> businesses.id, NOT NULL)
- `order_number` (VARCHAR(30), UNIQUE, NOT NULL) — e.g. "JD-2609-8472"
- `status` (VARCHAR(50), DEFAULT 'PENDING') — PENDING, ACCEPTED, PREPARING, READY_FOR_PICKUP, IN_TRANSIT, DELIVERED, CANCELLED
- `subtotal` (DECIMAL(12, 2), NOT NULL)
- `delivery_fee` (DECIMAL(10, 2), NOT NULL)
- `discount_amount` (DECIMAL(10, 2), DEFAULT 0.0)
- `total_amount` (DECIMAL(12, 2), NOT NULL)
- `payment_status` (VARCHAR(50), DEFAULT 'UNPAID') — UNPAID, PAID, REFUNDED
- `payment_method` (VARCHAR(50), DEFAULT 'COD') — COD, RAAST, JAZZCASH, EASYPAISA
- `delivery_address` (TEXT, NOT NULL)
- `delivery_latitude` (DECIMAL(10, 8))
- `delivery_longitude` (DECIMAL(11, 8))
- `customer_notes` (TEXT)
- `created_at` / `updated_at` (TIMESTAMPTZ)

#### 16. `order_items`
Line items within an order.
- `id` (UUID, PK)
- `order_id` (UUID, FK -> orders.id, NOT NULL)
- `product_id` (UUID, FK -> products.id, NOT NULL)
- `quantity` (INTEGER, NOT NULL)
- `unit_price` (DECIMAL(12, 2), NOT NULL)
- `total_price` (DECIMAL(12, 2), NOT NULL)

#### 17. `payments`
Digital ledger of payment transactions.
- `id` (UUID, PK)
- `order_id` (UUID, FK -> orders.id, NULLABLE)
- `user_id` (UUID, FK -> users.id, NOT NULL)
- `amount` (DECIMAL(12, 2), NOT NULL)
- `gateway` (VARCHAR(50), NOT NULL) — 'RAAST', 'JAZZCASH', 'EASYPAISA', 'MANUAL_COD'
- `gateway_reference` (VARCHAR(150))
- `status` (VARCHAR(50), NOT NULL) — INITIATED, SUCCESS, FAILED, REFUNDED
- `raw_response` (JSONB)
- `created_at` (TIMESTAMPTZ)

#### 18. `riders`
Delivery couriers and dispatch fleet.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, NOT NULL)
- `city_id` (UUID, FK -> cities.id, NOT NULL)
- `vehicle_type` (VARCHAR(50), DEFAULT 'BIKE') — BIKE, RICKSHAW, LOADER
- `vehicle_reg_number` (VARCHAR(50), NOT NULL)
- `cnic_number` (VARCHAR(20), NOT NULL)
- `is_active` (BOOLEAN, DEFAULT false)
- `current_latitude` (DECIMAL(10, 8))
- `current_longitude` (DECIMAL(11, 8))
- `rating_average` (DECIMAL(3, 2), DEFAULT 0.0)
- `total_deliveries` (INTEGER, DEFAULT 0)

#### 19. `deliveries`
Fulfillment dispatch assignment connecting order to rider.
- `id` (UUID, PK)
- `order_id` (UUID, FK -> orders.id, NOT NULL)
- `rider_id` (UUID, FK -> riders.id, NULLABLE)
- `pickup_otp` (VARCHAR(6), NOT NULL)
- `delivery_otp` (VARCHAR(6), NOT NULL)
- `pickup_time` (TIMESTAMPTZ)
- `delivery_time` (TIMESTAMPTZ)
- `rider_payout` (DECIMAL(10, 2), NOT NULL)
- `status` (VARCHAR(50), DEFAULT 'ASSIGNING') — ASSIGNING, ACCEPTED, PICKED_UP, DELIVERED, FAILED

#### 20. `reviews`
Verified customer ratings for businesses and service providers.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, NOT NULL)
- `target_type` (VARCHAR(50), NOT NULL) — 'BUSINESS', 'SERVICE_PROVIDER', 'RIDER'
- `target_id` (UUID, NOT NULL)
- `order_id` (UUID, FK -> orders.id, NULLABLE)
- `rating` (INTEGER, NOT NULL) — 1 to 5
- `comment` (TEXT)
- `created_at` (TIMESTAMPTZ)

#### 21. `offers`
Promotional deals and seasonal discount coupons.
- `id` (UUID, PK)
- `business_id` (UUID, FK -> businesses.id, NOT NULL)
- `code` (VARCHAR(50), NOT NULL)
- `discount_percentage` (INTEGER)
- `discount_amount` (DECIMAL(10, 2))
- `start_date` (TIMESTAMPTZ, NOT NULL)
- `end_date` (TIMESTAMPTZ, NOT NULL)
- `is_active` (BOOLEAN, DEFAULT true)

---

### Agri & Farmer Hub (Phase 5)

#### 22. `farmers`
Agricultural producer profiles.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, NOT NULL)
- `city_id` (UUID, FK -> cities.id, NOT NULL)
- `total_acreage` (DECIMAL(8, 2), NOT NULL)
- `canal_water_zone` (VARCHAR(100)) — e.g. "Dajal Branch Canal"
- `primary_crops` (TEXT[], DEFAULT '{}')

#### 23. `crops`
Master agricultural taxonomy of crops and varieties.
- `id` (UUID, PK)
- `name` (VARCHAR(100), NOT NULL) — e.g. "Cotton"
- `name_ur` (VARCHAR(100)) — e.g. "کپاس"
- `season` (VARCHAR(50)) — 'RABI', 'KHARIF'

#### 24. `crop_diagnoses`
AI-powered leaf and plant pathology scans.
- `id` (UUID, PK)
- `farmer_id` (UUID, FK -> farmers.id, NOT NULL)
- `crop_id` (UUID, FK -> crops.id, NOT NULL)
- `leaf_image_url` (TEXT, NOT NULL)
- `detected_disease` (VARCHAR(200), NOT NULL)
- `confidence_score` (DECIMAL(5, 4), NOT NULL)
- `recommendation_ur` (TEXT, NOT NULL)
- `treatment_summary` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

#### 25. `market_prices` (Mandi Rates)
Daily wholesale commodity prices across regional markets.
- `id` (UUID, PK)
- `city_id` (UUID, FK -> cities.id, NOT NULL)
- `crop_id` (UUID, FK -> crops.id, NOT NULL)
- `market_name` (VARCHAR(100), NOT NULL) — e.g. "Ghalla Mandi Jampur"
- `min_price_per_maund` (DECIMAL(10, 2), NOT NULL) — 40 kg unit
- `max_price_per_maund` (DECIMAL(10, 2), NOT NULL)
- `avg_price_per_maund` (DECIMAL(10, 2), NOT NULL)
- `price_date` (DATE, NOT NULL)
- `verified_by_admin` (BOOLEAN, DEFAULT false)
- *Unique Constraint*: `(city_id, crop_id, market_name, price_date)`

---

### Student & Career Hub (Phase 6)

#### 26. `students`
Student and youth academic profiles.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, NOT NULL)
- `city_id` (UUID, FK -> cities.id, NOT NULL)
- `institution_name` (VARCHAR(200), NOT NULL)
- `degree_program` (VARCHAR(150), NOT NULL)
- `graduation_year` (INTEGER)
- `skills` (TEXT[], DEFAULT '{}')
- `resume_url` (TEXT)

#### 27. `jobs`
Local employment listings.
- `id` (UUID, PK)
- `city_id` (UUID, FK -> cities.id, NOT NULL)
- `employer_id` (UUID, FK -> users.id, NOT NULL)
- `title` (VARCHAR(200), NOT NULL)
- `job_type` (VARCHAR(50), NOT NULL) — FULL_TIME, PART_TIME, APPRENTICE
- `salary_range` (VARCHAR(100))
- `requirements` (TEXT)
- `is_active` (BOOLEAN, DEFAULT true)
- `created_at` / `expires_at` (TIMESTAMPTZ)

#### 28. `internships`
Work-learning placements for students.
- `id` (UUID, PK)
- `city_id` (UUID, FK -> cities.id, NOT NULL)
- `organization_name` (VARCHAR(200), NOT NULL)
- `role_title` (VARCHAR(200), NOT NULL)
- `stipend_amount` (DECIMAL(10, 2), DEFAULT 0.0)
- `duration_months` (INTEGER, NOT NULL)
- `application_deadline` (DATE, NOT NULL)

#### 29. `scholarships`
Verified regional and national scholarship directory.
- `id` (UUID, PK)
- `title` (VARCHAR(250), NOT NULL)
- `sponsor_organization` (VARCHAR(200), NOT NULL)
- `eligibility_criteria` (TEXT, NOT NULL)
- `amount_description` (VARCHAR(150), NOT NULL)
- `deadline` (DATE, NOT NULL)
- `application_url` (TEXT, NOT NULL)

---

### AI, Communications & Governance (Phases 1, 4 & 7)

#### 30. `conversations` & `messages`
Chat threads between users, merchants, and providers.
- `conversations.id` (UUID, PK), `type` (DIRECT, ORDER_SUPPORT), `created_at`
- `messages.id` (UUID, PK), `conversation_id` (FK), `sender_id` (FK), `content` (TEXT), `audio_url` (TEXT), `created_at`

#### 31. `ai_interactions`
Audit log of all LLM and voice prompts.
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, NULLABLE)
- `module` (VARCHAR(50), NOT NULL) — 'CROP_DOC', 'CONCIERGE', 'VOICE_SEARCH'
- `prompt_raw` (TEXT, NOT NULL)
- `detected_intent` (VARCHAR(100))
- `response_text` (TEXT, NOT NULL)
- `token_count` (INTEGER)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

#### 32. `notifications`
Multi-channel notification log (In-app, SMS, WhatsApp, WebPush).
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id, NOT NULL)
- `title` (VARCHAR(200), NOT NULL)
- `body` (TEXT, NOT NULL)
- `channel` (VARCHAR(50), NOT NULL) — 'IN_APP', 'SMS', 'WHATSAPP'
- `is_read` (BOOLEAN, DEFAULT false)
- `created_at` (TIMESTAMPTZ)

#### 33. `reports_complaints`
Civic complaints, merchant fraud reports, and dispute tickets.
- `id` (UUID, PK)
- `city_id` (UUID, FK -> cities.id, NOT NULL)
- `complainant_id` (UUID, FK -> users.id, NOT NULL)
- `target_type` (VARCHAR(50), NOT NULL) — 'BUSINESS', 'PROVIDER', 'RIDER', 'CIVIC_ISSUE'
- `target_id` (UUID, NULLABLE)
- `category` (VARCHAR(100), NOT NULL) — e.g. "OVERCHARGING", "MISSED_DELIVERY", "SANITATION"
- `status` (VARCHAR(50), DEFAULT 'OPEN') — OPEN, UNDER_REVIEW, RESOLVED, DISMISSED
- `resolution_notes` (TEXT)
- `created_at` / `updated_at` (TIMESTAMPTZ)

#### 34. `advertisements`
Sponsored business banners and local announcements.
- `id` (UUID, PK)
- `city_id` (UUID, FK -> cities.id, NOT NULL)
- `business_id` (UUID, FK -> businesses.id, NULLABLE)
- `banner_image_url` (TEXT, NOT NULL)
- `target_url` (TEXT)
- `placement` (VARCHAR(50), NOT NULL) — 'HOME_HERO', 'CATEGORY_TOP', 'MANDI_SIDEBAR'
- `start_date` / `end_date` (TIMESTAMPTZ, NOT NULL)
- `is_active` (BOOLEAN, DEFAULT true)

---

## 4. Indexing & Partitioning Strategy

1. **Spatial Indexes**:
   ```sql
   CREATE INDEX idx_business_locations_geom ON business_locations USING GIST (geom);
   ```
2. **Multi-Tenant Composite Indexes**:
   ```sql
   CREATE INDEX idx_businesses_city_verified ON businesses (city_id, is_verified, is_featured);
   CREATE INDEX idx_orders_city_status ON orders (city_id, status, created_at DESC);
   CREATE INDEX idx_market_prices_city_date ON market_prices (city_id, price_date DESC);
   ```
3. **Multilingual Trigram Search**:
   ```sql
   CREATE INDEX idx_businesses_name_trgm ON businesses USING GIN (name gin_trgm_ops);
   ```

---

*Document Status: APPROVED MASTER SPECIFICATION (Zero tables created in Phase 0 as per rule).*
