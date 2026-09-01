# JAMPUR DIGITAL OS — SECURITY SPECIFICATION (SECURITY.md)

> **Enterprise Security Architecture, RBAC & Data Protection Blueprint**  
> *Defense-in-depth protection for citizens, merchants, and community data.*

---

## 1. Zero-Trust Security Philosophy

Jampur Digital OS serves as the digital backbone for vital local economic transactions, personal identities, and municipal services. Security is implemented with a **Zero-Trust Defense-in-Depth** model across every layer:

```
[Edge WAF & DDoS Shield] ──► [Rate Limiter & IP Throttler] ──► [HttpOnly Auth Middleware] ──► [Zod Payload Validator] ──► [RBAC Policy Engine] ──► [Parameterized DB Queries] ──► [Audit Logger]
```

---

## 2. Authentication & Identity Management

### A. Phone OTP Authentication (Primary Channel)
Given the mobile-first nature of South Punjab, Phone Number OTP (SMS / WhatsApp) is the primary authentication path for Citizens, Farmers, Riders, and Artisans:
1. **Cryptographic OTP Generation**: 6-digit random token generated via `crypto.randomInt(100000, 999999)`.
2. **Short TTL**: Token expires in strictly **300 seconds (5 minutes)**.
3. **Storage Security**: OTP is hashed using Argon2id/SHA-256 before storing in Redis (`SETEX otp:+923001234567 300 <hash>`). The raw OTP is never stored in plain text.
4. **Brute-Force Lockout**: Max 3 invalid verification attempts allowed. Subsequent attempts trigger a 15-minute phone lockout.

### B. Password Authentication (Merchants & Admins)
- **Hashing Standard**: `Argon2id` (Memory cost: 64MB, Iterations: 3, Parallelism: 4).
- **Password Complexity**: Minimum 10 characters, requiring uppercase, lowercase, numeric, and special characters.

### C. Session & Token Storage
- **Token Type**: JSON Web Tokens (JWT) signed with `Ed25519` / `RS256` private keys (2048-bit).
- **Storage**: Stored exclusively in **`HttpOnly`**, **`Secure`**, **`SameSite=Lax`** cookies.
- **Zero Token in LocalStorage**: Access tokens are strictly inaccessible to client-side JavaScript, completely neutralizing Cross-Site Scripting (XSS) token theft.

---

## 3. Role-Based Access Control (RBAC) Matrix

```
+-------------------+----------+----------+----------+----------+----------+----------+----------+
| PERMISSION / ROLE | CUSTOMER | MERCHANT | PROVIDER | FARMER   | RIDER    | ADMIN    | S_ADMIN  |
+-------------------+----------+----------+----------+----------+----------+----------+----------+
| profile:manage    |    ✓     |    ✓     |    ✓     |    ✓     |    ✓     |    ✓     |    ✓     |
| shop:create       |    -     |    ✓     |    -     |    -     |    -     |    ✓     |    ✓     |
| catalog:manage    |    -     |    ✓     |    -     |    -     |    -     |    -     |    ✓     |
| service:quote     |    -     |    -     |    ✓     |    -     |    -     |    -     |    ✓     |
| order:place       |    ✓     |    -     |    -     |    ✓     |    -     |    -     |    ✓     |
| order:fulfill     |    -     |    ✓     |    -     |    -     |    -     |    -     |    ✓     |
| delivery:claim    |    -     |    -     |    -     |    -     |    ✓     |    -     |    ✓     |
| crop:diagnose     |    ✓     |    -     |    -     |    ✓     |    -     |    -     |    ✓     |
| mandi:publish     |    -     |    -     |    -     |    -     |    -     |    ✓     |    ✓     |
| entity:verify_kyc |    -     |    -     |    -     |    -     |    -     |    ✓     |    ✓     |
| audit_logs:read   |    -     |    -     |    -     |    -     |    -     |    ✓     |    ✓     |
| system:provision  |    -     |    -     |    -     |    -     |    -     |    -     |    ✓     |
+-------------------+----------+----------+----------+----------+----------+----------+----------+
```

---

## 4. Input Validation & Injection Defenses

1. **Strict Zod Schemas**: Every API payload is validated before reaching business logic handlers. Extraneous fields are automatically stripped.
2. **Zero Raw SQL Policy**: All database access executes via parameterized ORM queries (Prisma/Drizzle), completely eliminating SQL injection vectors.
3. **HTML Sanitization**: User-generated content (reviews, shop descriptions, service notes) is sanitized via `DOMPurify` to prevent Stored XSS.
4. **Header Hardening**:
   - `Content-Security-Policy: default-src 'self' ...`
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

---

## 5. Rate Limiting & Abuse Prevention (Redis Leaky-Bucket)

| Endpoint Category | Limit Threshold | Action on Breach |
| :--- | :--- | :--- |
| **OTP Request** | 3 requests / 10 mins per phone / IP | 429 Too Many Requests + 15m Cooldown |
| **Login Attempts** | 5 failed attempts / 15 mins per IP | Account temporary lock + Admin alert |
| **Public Search / Directory** | 60 requests / minute per IP | Throttled with standard 429 retry headers |
| **AI Vision / Crop Doctor** | 10 scans / hour per user | Throttled to prevent LLM quota exhaustion |
| **General Authenticated API**| 180 requests / minute per user token | Sliding window throttle |

---

## 6. Secure Uploads & Document Confidentiality

### CNIC & Business License Isolation
- **Private S3 Bucket**: Identity documents (CNIC scans, driving licenses, municipal tax certificates) are stored in a **Private Non-Public Bucket**.
- **Presigned URLs**: Access is granted only via short-lived presigned URLs (TTL: 60 seconds), accessible solely to verified Administrators during the KYC review process.
- **Upload Validation**:
  - File signature (Magic Bytes) verified on upload (not just file extension).
  - Maximum upload size strictly capped (5MB for images, 10MB for PDFs).

---

## 7. Sensitive Data & PII Exposure Rules

```
+-------------------------------------------------------------------------------+
|                       STRICT NEVER-EXPOSE SECURITY RULE                       |
+-------------------------------------------------------------------------------+
| 1. NEVER return `password_hash` in any API response or serialization.         |
| 2. NEVER return raw OTP codes in API responses or console logs.              |
| 3. NEVER expose raw CNIC numbers to general users (Mask: `32402-*******-1`).   |
| 4. NEVER log customer home addresses in public analytics.                     |
| 5. NEVER allow rider to view customer phone number after delivery is complete.|
+-------------------------------------------------------------------------------+
```

---

## 8. Immutable Audit Trail

Every sensitive mutation automatically commits an immutable record into the `audit_logs` table:
- User role changes & administrative elevations
- Shop verification and KYC approvals/rejections
- Order cancellations and financial refunds
- Manual price updates in Mandi rates

---

*Document Status: APPROVED BASELINE FOR PHASE 0*
