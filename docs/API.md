# JAMPUR DIGITAL OS — API ARCHITECTURE & SPECIFICATION (API.md)

> **Enterprise RESTful & Real-Time API Master Specification**  
> *Consistent, Type-Safe, Multi-Tenant API Contract for Jampur Digital OS.*

---

## 1. Global API Standards & Conventions

### Base URL & Versioning
All API endpoints follow semantic versioning under the `/api/v1` namespace:
```
Production: https://api.jampurdigital.pk/api/v1
Development: http://localhost:3000/api/v1
```

### City Tenancy Header
Every municipal request must include either:
- HTTP Header: `X-City-Slug: jampur` (Default fallback: `jampur`)
- Query Parameter: `?city=jampur`

---

## 2. Standardized Response Formats

### Standard Success Envelope
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-09-01T10:00:00.000Z",
    "city_id": "city_jampur_01",
    "city_slug": "jampur",
    "version": "v1.0.0"
  },
  "pagination": {
    "cursor": "eyJpZCI6ImJpel8xMDIifQ==",
    "has_more": true,
    "limit": 20,
    "total_count": 145
  }
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The provided phone number is invalid.",
    "details": [
      {
        "field": "phone_number",
        "issue": "Must be valid Pakistani format (+923XXXXXXXXX)"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-09-01T10:00:00.000Z",
    "city_slug": "jampur",
    "version": "v1.0.0"
  }
}
```

### Standard HTTP Status Codes
| Code | Meaning | Usage Scenario |
| :--- | :--- | :--- |
| `200 OK` | Request Succeeded | Read queries, successful mutations |
| `201 Created` | Resource Created | Order placed, quote submitted, user registered |
| `400 Bad Request` | Validation Error | Malformed body, missing required fields |
| `401 Unauthorized` | Missing / Invalid Token | Authentication missing or expired |
| `403 Forbidden` | Insufficient Permissions | Citizen attempting to access Merchant or Admin route |
| `404 Not Found` | Resource Absent | Shop, crop rate, or order ID not found in target city |
| `429 Too Many Requests`| Rate Limit Exceeded | OTP spamming, aggressive search scraping |
| `500 Internal Error` | Server Exception | Unhandled backend failure (alert triggered) |

---

## 3. Rate Limiting Headers
Every response includes token-bucket metadata:
- `X-RateLimit-Limit`: Maximum requests per window (e.g. `100`)
- `X-RateLimit-Remaining`: Remaining allowance in current window (e.g. `87`)
- `X-RateLimit-Reset`: Unix timestamp when bucket refills

---

## 4. Master Endpoint Catalog by Module

```
+---------------------------------------------------------------------------------------------------+
| METHOD | ENDPOINT URI                          | ACCESS CONTROL    | DESCRIPTION                  |
+--------+---------------------------------------+-------------------+------------------------------+
```

### Module 1: Authentication & Identity
```
| POST   | /api/v1/auth/request-otp              | Public (Rate Limit| Sends SMS/WhatsApp OTP code   |
| POST   | /api/v1/auth/verify-otp               | Public            | Verifies OTP & returns token |
| POST   | /api/v1/auth/login-password           | Public            | Password login for merchants |
| POST   | /api/v1/auth/logout                   | Authenticated     | Clears HttpOnly session      |
| GET    | /api/v1/users/me                      | Authenticated     | Current user profile & roles |
| PUT    | /api/v1/users/me                      | Authenticated     | Updates profile & language   |
```

### Module 2: Multi-City Configuration
```
| GET    | /api/v1/cities                        | Public            | List all active cities       |
| GET    | /api/v1/cities/:slug                  | Public            | City info, bounds & config   |
| POST   | /api/v1/admin/cities                  | Super Admin Only  | Provision a new city/tehsil  |
```

### Module 3: Businesses & Directory
```
| GET    | /api/v1/categories                    | Public            | Directory category tree      |
| GET    | /api/v1/businesses                    | Public            | Search businesses with filters|
| GET    | /api/v1/businesses/:id                | Public            | Complete business details    |
| POST   | /api/v1/businesses                    | Merchant / Admin  | Register a new local shop    |
| PUT    | /api/v1/businesses/:id                | Merchant Owner    | Update shop info & hours     |
| GET    | /api/v1/businesses/:id/products       | Public            | Shop product catalog         |
| POST   | /api/v1/businesses/:id/products       | Merchant Owner    | Add a product to catalog     |
```

### Module 4: Services Marketplace
```
| GET    | /api/v1/services                      | Public            | Master list of home services |
| GET    | /api/v1/providers                     | Public            | Verified artisans & ratings  |
| POST   | /api/v1/service-requests              | Customer          | Post a repair/service request|
| GET    | /api/v1/service-requests/:id/quotes   | Request Owner     | View quotes submitted by pros|
| POST   | /api/v1/quotes                        | Service Provider  | Submit a price quotation     |
| POST   | /api/v1/quotes/:id/accept             | Customer          | Accept a quote & book pro    |
```

### Module 5: Commerce Orders & Logistics Dispatch
```
| POST   | /api/v1/orders                        | Customer          | Place local checkout order   |
| GET    | /api/v1/orders/:id                    | Order Stakeholders| Order status & line items    |
| PUT    | /api/v1/orders/:id/status             | Merchant / Admin  | Transition status (Accept etc)|
| GET    | /api/v1/orders/:id/track              | SSE Stream        | Real-time live order stream  |
| GET    | /api/v1/deliveries/available          | Active Rider      | Unassigned delivery orders   |
| POST   | /api/v1/deliveries/:id/claim          | Active Rider      | Claim order for delivery     |
| POST   | /api/v1/deliveries/:id/verify-otp     | Active Rider      | Verify pickup/delivery OTP   |
```

### Module 6: Agri & Mandi Hub
```
| GET    | /api/v1/agri/crops                    | Public            | Master crop taxonomy         |
| GET    | /api/v1/agri/mandi-rates              | Public            | Daily mandi prices by city   |
| POST   | /api/v1/agri/mandi-rates              | City Admin / Agri | Publish verified daily rates |
| POST   | /api/v1/agri/diagnose-crop            | Farmer / Public   | Upload crop leaf photo for AI|
```

### Module 7: Student & Career Hub
```
| GET    | /api/v1/jobs                          | Public            | Local job & apprentice board |
| POST   | /api/v1/jobs                          | Verified Employer | Post a local job opening     |
| GET    | /api/v1/scholarships                  | Public            | Verified scholarship alerts  |
| POST   | /api/v1/students/profile              | Student           | Update student bio & resume  |
```

### Module 8: AI Concierge & Voice Services
```
| POST   | /api/v1/ai/chat                       | Public / Auth     | Natural language concierge   |
| POST   | /api/v1/ai/voice-transcribe           | Public / Auth     | Whisper Urdu/Saraiki voice   |
```

### Module 9: Governance, Moderation & Audit Logs
```
| GET    | /api/v1/admin/audit-logs              | Admin / SuperAdmin| Immutable system audit trail |
| POST   | /api/v1/admin/verify-entity           | Admin             | Approve shop / provider KYC  |
| POST   | /api/v1/reports                       | Customer / Public | File complaint or fraud alert|
```

---

*Document Status: APPROVED BASELINE FOR PHASE 0*
