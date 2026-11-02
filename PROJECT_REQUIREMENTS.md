# 📋 QuickMed — Project Requirement Document (PRD)

**Document Version:** 1.0.0  
**Status:** Approved & Implemented  
**Fulfillment Area:** Ghaziabad, Uttar Pradesh, India (Raj Nagar, Kavi Nagar, Indirapuram, Vaishali)  

---

## 1. Executive Summary & Product Vision

QuickMed is an ultra-fast, CDSCO-compliant hyperlocal medicine delivery and cold-chain logistics platform designed to solve critical delays in emergency healthcare delivery. QuickMed bridges licensed retail pharmacies, certified delivery riders equipped with temperature-controlled cold boxes, and patients requiring urgent prescription medications.

### Primary Goals:
1. **Speed & Reliability**: Achieve 10-to-30 minute delivery times for prescription medications.
2. **Cold-Chain Assurance**: Maintain strict 2°C to 8°C temperature telemetry logging for temperature-sensitive drugs (e.g., insulin, vaccines, biologics).
3. **Regulatory Safety**: Enforce digital pharmacist verification, OCR prescription analysis, and delivery OTP authentication.

---

## 2. User Personas & User Stories

### Persona 1: Patient / Healthcare Consumer (Sarah)
- **Need**: Urgently needs insulin and blood pressure medication delivered to her residence in Indirapuram, Ghaziabad.
- **User Stories**:
  - *As a Patient*, I want to upload a photo/PDF of my doctor's prescription so that the platform can auto-scan prescribed medicines via AI OCR.
  - *As a Patient*, I want to see generic alternative options to save on healthcare costs without compromising quality.
  - *As a Patient*, I want to track my delivery rider on a live Google Map with real-time ETA and cold-box temperature telemetry.
  - *As a Patient*, I want a daily medicine dosage cabinet to mark my daily medication compliance.

### Persona 2: Licensed Pharmacy Store Manager & Pharmacist (Pharm. Priya Nair)
- **Need**: Efficiently audit incoming e-Prescriptions, verify doctor registration credentials, and dispatch orders from the Kavi Nagar Hub in Ghaziabad.
- **User Stories**:
  - *As a Pharmacist*, I want an incoming e-Prescription audit queue to verify drug names, dosages, and doctor registration numbers.
  - *As a Pharmacist*, I want to apply a digital pharmacist verification stamp (#0x9F82) for regulatory compliance before dispatch.
  - *As a Pharmacist*, I want to log cold storage temperature readiness (2°C–8°C) for refrigerated drugs.

### Persona 3: Express Delivery Rider (Vikram Singh)
- **Need**: Fast route navigation from the pharmacy hub to the patient residence with clear delivery instructions and OTP verification.
- **User Stories**:
  - *As a Rider*, I want a live navigation map with route progress, distance, and current speed telemetry.
  - *As a Rider*, I want a duty status toggle (Online/Offline) to manage my shift.
  - *As a Rider*, I want a 4-digit OTP verification prompt at delivery to ensure safe handoff to the correct patient.

---

## 3. Functional Requirements

### 3.1 Authentication & Multi-Role Access
- **FR-1.1**: The platform MUST provide individual, role-tailored login & registration forms for Patients, Pharmacy Stores, and Delivery Riders.
- **FR-1.2**: Patient login MUST require Name, Mobile Phone, Email, OTP, and Ghaziabad Delivery Address.
- **FR-1.3**: Pharmacy Store login MUST require Pharmacist Owner Name, Pharmacy Shop Title, CDSCO Drug License Number (`UP-2021-00921`), Store Address, and Cold Storage Verification Checkbox.
- **FR-1.4**: Rider login MUST require Rider Name, Phone, Assigned Vehicle Type (`EV Scooter`), Vehicle Registration Number (`UP-14-EV-8821`), and Assigned Ghaziabad Zone.

### 3.2 Prescription Processing & Generic Alternative Engine
- **FR-2.1**: AI OCR scanning simulation MUST parse drug names, dosages, frequencies, and flags for cold-chain requirements.
- **FR-2.2**: The platform MUST suggest equivalent salt generics (e.g. Metformin Hydrochloride vs. Brand Glucophage) with cost savings calculation.

### 3.3 Live Navigation & Geolocation Tracking
- **FR-3.1**: The live delivery map MUST default to Ghaziabad coordinates (`28.6692, 77.4538`).
- **FR-3.2**: The map MUST support HTML5 device geolocation (`Use Device Location` button) to request GPS coordinates.
- **FR-3.3**: The map MUST allow toggling between Google Maps view (`MapView`) and QuickMed Tech vector navigation view.

### 3.4 Cold-Chain Telemetry Monitor
- **FR-4.1**: Real-time insulated cold-box temperature telemetry MUST display live temperature readings (`3.5°C to 4.2°C`).
- **FR-4.2**: The platform MUST flag out-of-range storage conditions (outside 2°C–8°C).

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Security & Rate Limiting
- **NFR-1.1**: All incoming API requests MUST be validated against strict Zod schemas.
- **NFR-1.2**: Authentication endpoints (`/api/auth/*`) MUST enforce per-IP and per-account rate limits with exponential backoff delay (`2s`, `4s`, `8s`...).

### 4.2 Performance & Responsiveness
- **NFR-2.1**: The client SPA MUST load and hydrate in under 2 seconds.
- **NFR-2.2**: The UI MUST be fully responsive across mobile screens, tablets, and desktop displays.

### 4.3 Regulatory Compliance
- **NFR-3.1**: The system MUST adhere to CDSCO pharmaceutical storage guidelines and Telemedicine Practice Guidelines of India.
