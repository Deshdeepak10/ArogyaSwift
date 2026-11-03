# ArogyaSwift — Project Requirement Document (PRD)

**Document Version:** 2.0.0  
**Status:** Approved & Implemented  
**Fulfillment Area:** Ghaziabad, Uttar Pradesh, India (Raj Nagar, Kavi Nagar, Indirapuram, Vaishali)  
**Live Application:** [https://arogyaswift.vercel.app](https://arogyaswift.vercel.app)

---

## 1. Executive Summary & Product Scope

ArogyaSwift is a hyperlocal medicine delivery platform designed for 10-to-30 minute prescription fulfillment with cold-chain tracking. The platform connects licensed neighborhood pharmacies, express delivery riders equipped with insulated cold-storage boxes, and patients requiring prescription medications under CDSCO regulatory standards.

### Primary Objectives:
1. **Fulfillment Speed**: Enable 10-to-30 minute delivery cycles through localized inventory matching.
2. **Cold-Chain Assurance**: Maintain active 2°C to 8°C temperature telemetry for refrigerated medications (insulin, vaccines, biologics).
3. **Regulatory Safety**: Enforce pharmacist clinical verification, prescription analysis, and doorstep 4-digit OTP delivery verification.
4. **Data Persistence**: Maintain relational data across 16 PostgreSQL tables hosted on Supabase (AWS Mumbai) with Row Level Security.

---

## 2. User Personas & User Stories

### Persona 1: Patient / Healthcare Consumer (Sarah)
- **Context**: Needs prescribed insulin and maintenance medications delivered to her residence in Indirapuram, Ghaziabad.
- **User Stories**:
  - *As a Patient*, I want to upload a prescription so that the platform can identify prescribed medications and calculate savings with equivalent salt generics.
  - *As a Patient*, I want to track my delivery rider on an interactive Mapbox 3D map with live ETA, rider position, and cold-box temperature telemetry.
  - *As a Patient*, I want a daily dosage cabinet to log medication compliance and view dose schedules.
  - *As a Patient*, I want to sign in with Google or use phone-based authentication with doorstep delivery OTP verification.

### Persona 2: Licensed Pharmacy Store Manager & Pharmacist (Pharm. Priya Nair)
- **Context**: Audits incoming digital prescriptions, checks doctor registration credentials, and dispatches orders from the Kavi Nagar Hub in Ghaziabad.
- **User Stories**:
  - *As a Pharmacist*, I want an incoming prescription audit queue to verify drug schedules, dosages, and doctor registration details before fulfillment.
  - *As a Pharmacist*, I want to apply a registered pharmacist verification stamp with license details for audit compliance.
  - *As a Pharmacist*, I want to confirm that insulated cold-storage containers are pre-chilled to 2°C–8°C prior to rider handover.

### Persona 3: Express Delivery Rider (Vikram Singh)
- **Context**: Navigates from local pharmacy hubs to patient residences with temperature-sensitive deliveries.
- **User Stories**:
  - *As a Rider*, I want turn-by-turn Mapbox navigation showing route geometry, distance, and speed.
  - *As a Rider*, I want an online/offline shift toggle to manage duty status.
  - *As a Rider*, I want a mandatory 4-digit OTP verification prompt at delivery to confirm handoff to the authorized recipient.

---

## 3. Functional Requirements

### 3.1 Authentication & Multi-Role Access
- **FR-1.1**: The platform MUST support Google OAuth 2.0 (Google Identity Services) with automatic server-side token verification and profile persistence in Supabase `user_profiles`.
- **FR-1.2**: The platform MUST provide role-tailored access for Patients, Pharmacy Stores, Delivery Riders, and Administrators.
- **FR-1.3**: Patient phone registration MUST capture Name, Phone, Email, OTP, and Delivery Address.
- **FR-1.4**: Pharmacy registration MUST require Pharmacist Name, Pharmacy Title, State Drug License Number (`UP-2021-00921`), Address, and Cold Storage Certification.
- **FR-1.5**: Delivery handoff MUST require a matching 4-digit numeric OTP before marking the delivery task complete.

### 3.2 Prescription Processing & Generic Alternatives
- **FR-2.1**: Prescription processing MUST parse medicine names, strengths, dosages, and temperature storage flags.
- **FR-2.2**: The platform MUST provide equivalent salt generic suggestions (e.g., Metformin Hydrochloride vs. Brand Glucophage) with transparent price comparison.

### 3.3 Live Navigation & Geolocation Tracking
- **FR-3.1**: The mapping engine MUST run on Mapbox GL JS (WebGL 3D) defaulting to Ghaziabad center coordinates (`28.6692, 77.4538`).
- **FR-3.2**: The map MUST support HTML5 device geolocation to acquire real GPS coordinates via browser API.
- **FR-3.3**: The map MUST render custom markers for Pharmacy Pickup (🏥), Patient Doorstep (🏠), and Delivery Rider (🏍️) with animated pulse telemetry and route polyline.
- **FR-3.4**: When no Mapbox token is provided, the map MUST seamlessly fall back to OpenStreetMap tiles without throwing errors or breaking UI.

### 3.4 Cold-Chain Telemetry Monitor
- **FR-4.1**: Active delivery tracking MUST display live temperature readings between 2.0°C and 8.0°C.
- **FR-4.2**: The platform MUST display an alert when simulated or recorded temperatures breach the 2°C–8°C safety window.

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Security & Rate Limiting
- **NFR-1.1**: All incoming API requests MUST be validated against strict Zod schemas.
- **NFR-1.2**: Authentication endpoints (`/api/auth/*`) MUST enforce per-IP and per-account rate limits with exponential backoff delay (`2s`, `4s`, `8s`...).
- **NFR-1.3**: Backend source code, SQL schemas, and configuration files MUST be blocked by a server-side sensitive path shield.

### 4.2 Database & Data Integrity
- **NFR-2.1**: All transactional data (users, pharmacies, orders, items, tasks, audit logs) MUST persist in Supabase PostgreSQL (`aws-0-ap-south-1.pooler.supabase.com:6543/postgres`).
- **NFR-2.2**: The system MUST implement Row Level Security (RLS) to enforce data privacy across roles.

### 4.3 Performance & Availability
- **NFR-3.1**: The client SPA MUST load and hydrate in under 2 seconds on 4G mobile connections.
- **NFR-3.2**: The frontend and API MUST deploy to Vercel edge infrastructure with global CDN caching.

### 4.4 Regulatory Compliance
- **NFR-4.1**: Storage and handling protocols MUST comply with CDSCO rules and the Telemedicine Practice Guidelines of India.
- **NFR-4.2**: Prescription records and pharmacist approvals MUST be retained with immutable timestamps for clinical audit trails.
