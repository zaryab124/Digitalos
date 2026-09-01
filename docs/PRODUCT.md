# JAMPUR DIGITAL OS — PRODUCT SPECIFICATION (PRODUCT.md)

> **Master Product Requirements & Specification Document**  
> *Empowering regional economies through a unified, multi-persona digital operating system.*

---

## 1. Executive Summary & Vision

**Jampur Digital OS** is an integrated community and economic operating platform tailored to the socio-economic realities of tier-2, tier-3, and rural hubs in Pakistan, commencing in **Jampur (District Rajanpur, South Punjab)**. 

Unlike conventional metropolitan gig-economy apps that focus solely on food delivery or cab hailing in mega-cities, Jampur Digital OS provides a **holistic municipal and economic backbone** that bridges local commerce, artisan services, agricultural supply chains, educational opportunities, and real-time civic updates into a single, cohesive digital ecosystem.

### Core Mission
> *To eliminate local information asymmetry, formalize artisan and merchant reputations, unlock direct-to-consumer farm trade, empower youth with digital careers, and create sustainable localized economic circulation.*

---

## 2. Problem Statement & Regional Context

### The Challenge in Regional Cities (Jampur & South Punjab)
1. **Hyper-Fragmented Informal Commerce**: Over 85% of local transactions occur via unrecorded cash or informal credit (*khaata*). Local shopkeepers lack digital storefronts and discoverability beyond their physical bazaar street.
2. **Invisible Artisans & Service Technicians**: Skilled electricians, plumbers, and mechanics rely entirely on word-of-mouth. Customers face erratic pricing and unvetted reliability.
3. **Agri Middlemen Exploitation (*Aarthi System*)**: Farmers are forced to accept depressed crop prices due to lack of real-time mandi rate transparency and direct buyer access.
4. **Brain Drain & Youth Unemployment**: Students and graduates in Jampur lack centralized access to regional internships, remote job opportunities, and verified scholarship programs.
5. **Logistical Inefficiency**: No centralized on-demand parcel or food delivery dispatch exists; shops manage informal, uncoordinated delivery boys.
6. **Digital Literacy & Language Barriers**: Most existing software ignores regional languages (**Saraiki** and **Urdu**) and assumes high textual literacy, excluding a massive demographic.

---

## 3. Target Personas & User Journeys

```
+---------------------------------------------------------------------------------------------------+
|                                   JDOS USER PERSONA ECOSYSTEM                                     |
+---------------------------------------------------------------------------------------------------+
|  [👤 Customer]          [🏪 Merchant]          [🛠️ Service Provider]     [🌾 Farmer/Grower]       |
|  - Browse city bazaar    - Manage catalog       - Skill profile & badge   - Real-time Mandi rates  |
|  - Book verified techs   - Inventory & orders   - Lead notifications      - AI Crop Doctor scan    |
|  - Farm-fresh orders     - Run local promos     - Instant quote builder   - Machinery rent/share   |
|  - Track deliveries      - Digital receipts     - Customer rating book    - Direct bulk listings   |
+---------------------------------------------------------------------------------------------------+
|  [🎓 Student/Youth]     [🛵 Rider/Courier]     [🛡️ City Admin]           [👑 Super Admin]         |
|  - Local job board       - Live route dispatch  - KYC & Shop verification - Multi-city deployment  |
|  - Verified scholarships - Instant cashout      - Dispute resolution      - Global commission rules|
|  - Skill bootcamps       - Fair transparent pay - City alerts broadcast   - Platform analytics     |
+---------------------------------------------------------------------------------------------------+
```

### Persona 1: The Local Customer / Citizen
- **Profile**: Resident of Jampur (or neighboring union councils like Kotla Dewan, Dajal, Muhammadpur).
- **Needs**: Quick discovery of reliable local businesses, transparently priced home repair services, home delivery of groceries/medicines, and verified local news.
- **Key Pain Points**: Unfair service pricing, inability to compare shop inventory without walking through crowded bazaars, lack of delivery options during heatwaves or rain.

### Persona 2: The Local Business Owner / Merchant
- **Profile**: Retailer running a pharmacy on Indus Highway, a cloth merchant in Shahi Bazaar, or a general store owner.
- **Needs**: Simple digital catalog creation via mobile camera, receiving online orders with flexible payment options (Cash-on-Delivery, Raast, JazzCash, EasyPaisa), and promotional broadcasting.
- **Key Pain Points**: Competition from unregulated imports, inability to reach customers outside their immediate lane, manual paper bookkeeping errors.

### Persona 3: The Skilled Service Provider / Artisan
- **Profile**: Electrician, plumber, AC technician, carpenter, tailor, solar installer, or home appliance repairer.
- **Needs**: Verified digital identity badge, customer lead generation without relying on commission-hungry intermediaries, instant quoting tool, digital invoice generation.
- **Key Pain Points**: Irregular daily income, customer payment disputes, lack of formal reputation tracking.

### Persona 4: The Farmer / Agricultural Grower
- **Profile**: Small-to-medium landholder cultivating wheat, cotton, sugarcane, mangoes, or livestock in the Jampur canal belt.
- **Needs**: Instant mandi commodity prices (Jampur, Rajanpur, D.G. Khan, Multan), AI camera diagnosis for leaf blight/pests, renting tractors/harvesters during peak season, weather alerts.
- **Key Pain Points**: Fraudulent market brokers, delayed crop disease identification leading to yield loss, expensive machinery rental monopolies.

### Persona 5: The Student & Career Aspirant
- **Profile**: College/university student or recent graduate in Jampur seeking technical skills, local internships, or remote freelance gigs.
- **Needs**: Verified scholarship alerts (HEC, PEEF, private trusts), local job board (teaching, accounting, clinic assistant, digital marketing), mentorship connections.
- **Key Pain Points**: Fraudulent job postings, lack of localized career guidance, high cost of traveling to Lahore/Multan for job interviews.

### Persona 6: The Delivery Rider / Courier
- **Profile**: Motorcycle or auto-rickshaw owner seeking flexible daily earnings through local parcel and order fulfillment.
- **Needs**: Clean dispatch interface with voice instructions, transparent per-kilometer and base fare earnings, daily digital cashouts.
- **Key Pain Points**: Long waiting times at merchant outlets, unreasonable customer cancellations, unfair commission deductions.

### Persona 7: The City Administrator / Community Coordinator
- **Profile**: Local platform operational manager based in Jampur.
- **Needs**: Merchant and service provider KYC verification tools, dispute resolution queue, complaint tracking system, emergency city broadcast dashboard.
- **Key Pain Points**: Fraudulent accounts, fake reviews, unresolved merchant-customer payment conflicts.

### Persona 8: The Super Administrator
- **Profile**: Executive leadership and technical platform operators.
- **Needs**: Multi-city onboarding console, system-wide analytics, financial reconciliation reports, dynamic feature flags, AI model performance monitoring.

---

## 4. Multi-City Architecture: Data-Driven Tenancy

A core architectural tenet of Jampur Digital OS is that **geography is data, not code**.

```
+-------------------------------------------------------------------------------+
|                       DATABASE TENANCY: MULTI-CITY                            |
+-------------------------------------------------------------------------------+
|   [City: Jampur]      [City: Rajanpur]     [City: D.G. Khan]     [City: ...]  |
|   - slug: jampur      - slug: rajanpur     - slug: dg-khan       - slug: ...  |
|   - is_active: true   - is_active: true    - is_active: true     - ...        |
|   - currency: PKR     - currency: PKR      - currency: PKR       - ...        |
|   - lat/lng bounds    - lat/lng bounds     - lat/lng bounds      - ...        |
+-------------------------------------------------------------------------------+
|   All domain models (Businesses, Providers, Jobs, Mandi Rates) inherit        |
|   a mandatory `city_id` foreign key.                                          |
+-------------------------------------------------------------------------------+
```

### City Scalability Path:
1. **Pilot Phase**: Jampur City & adjoining union councils (Dajal, Kot Tahir, Kotla Dewan, Tibbi Lundan).
2. **Phase 7 Expansion**: District Headquarters Rajanpur, Rojhan, Fazilpur.
3. **Regional Hub**: Dera Ghazi Khan, Taunsa, Kot Chutta.
4. **South Punjab Corridor**: Muzaffargarh, Multan, Bahawalpur, Rahim Yar Khan.
5. **National Deployment**: Open multi-tenant onboarding for all regional tehsils across Pakistan.

---

## 5. Localized Accessibility & Linguistic Engineering

To bridge the regional digital divide, Jampur Digital OS incorporates a **Triple-Tier Linguistic Engine**:

| Feature | English | Urdu (اردو) | Saraiki (سرائیکی) |
| :--- | :--- | :--- | :--- |
| **Interface Text** | Full standard UI | Complete Nastaliq/Naskh translation | Localized terminology (Bazaar, Kam-Kaj, Faslan) |
| **AI Voice Query** | Supported | Natural Urdu voice recognition | Regional Saraiki dialect voice recognition |
| **Voice Search** | Standard Search | آواز سے تلاش | آواز نال ڳول پھول |
| **Audio Summaries** | Text-to-Speech | صوتی خبر نامہ | سرائیکی صوتی خبراں تے ریٹ |

---

## 6. Comprehensive Feature Matrix

| Functional Module | Citizen / Customer | Merchant / Business | Service Provider | Farmer | Student | Rider | City Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Unified City Directory** | Browse & Search | Claim / Edit Listing | List Skills | View Agri Shops | Search Institutions | View Hotspots | Verify & Moderate |
| **Services Marketplace** | Request & Book | Hire Maintenance | Send Quotes / Work | Request Tractor | - | - | Mediate Disputes |
| **Commerce & Delivery** | Cart & Checkout | Order Management | Order Parts | Order Fertilizer | Order Books | Route Dispatch | Monitor Deliveries|
| **Agri & Mandi Center** | Buy Farm Produce | Source Bulk Crops | Farm Machinery | Live Rates & AI Doc | - | Agri Haulage | Publish Mandi Rates|
| **Student & Career Hub** | - | Post Vacancies | Offer Apprenticeship| - | Apply Jobs/Grants | Apply for Shifts | Verify Job Listings|
| **AI Concierge / Chat** | Smart Assistant | Catalog Assistant | Price Estimator | Crop Doctor AI | Career Advisor | Turn-by-Turn Voice| System Telemetry |
| **Community & Alerts** | Civic Notices | Business Ads | Union Updates | Weather Warnings | Campus News | Road Block Alerts | Broadcast Notices |

---

## 7. Non-Functional Requirements & Guardrails

1. **Performance**: Initial page load under 1.8 seconds on 3G mobile connections. Assets optimized for low-end Android hardware (2GB RAM devices).
2. **Offline Resilience**: Essential cached data (saved addresses, active emergency numbers, recent offline orders) viewable without active internet.
3. **Data Integrity**: Zero tolerance for floating decimal errors in payments. Strict ACID compliance via PostgreSQL transactional boundaries.
4. **Simplicity Over Bloat**: Avoid unnecessary animations and heavy client-side scripts. Focus on clarity, large tap targets, and high-contrast color palettes.

---

*Document Status: APPROVED BASELINE FOR PHASE 0*
