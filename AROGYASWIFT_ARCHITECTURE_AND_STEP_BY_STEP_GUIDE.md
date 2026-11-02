# 💊 ArogyaSwift — 4-App Unified Marketplace Architecture & Step-by-Step Implementation Guide

> **Rebrand Notice**: MediLink Local has been completely rebranded and elevated into **ArogyaSwift**.  
> **Core Architecture**: 4 specialized frontend applications connected to **1 shared backend engine** and **1 unified PostgreSQL database**.

---

## Executive Summary

ArogyaSwift is an on-demand, CDSCO-compliant hyperlocal medicine marketplace that connects patients with licensed neighborhood pharmacies. Unlike traditional single-store delivery models, ArogyaSwift solves critical multi-medicine availability through a **unified marketplace with 4 specialized applications**:

```
                               ┌──────────────────────────────────────────────────────────────┐
                               │                    AROGYASWIFT ECOSYSTEM                     │
                               └──────────────────────────────┬───────────────────────────────┘
                                                              │
         ┌─────────────────────────────┬──────────────────────┴───────┬─────────────────────────────┐
         │                             │                              │                             │
         ▼                             ▼                              ▼                             ▼
┌──────────────────┐         ┌──────────────────┐           ┌──────────────────┐          ┌──────────────────┐
│  1. ArogyaSwift  │         │  2. ArogyaSwift  │           │  3. ArogyaSwift  │          │  4. ArogyaSwift  │
│   Customer App   │         │     Partner      │           │     Delivery     │          │  Control Center  │
│                  │         │  (Pharmacy App)  │           │   (Rider App)    │          │   (Admin App)    │
│  arogyaswift.in  │         │ partner.arogya.. │           │ rider.arogyasw.. │          │ admin.arogyasw.. │
└────────┬─────────┘         └────────┬─────────┘           └────────┬─────────┘          └────────┬─────────┘
         │                            │                              │                             │
         │ React / Vite / Mobile      │ React / Tablet & Desktop     │ React Mobile PWA / Android  │ React Admin / Desktop
         │                            │                              │                             │
         └────────────────────────────┼──────────────────────────────┴─────────────────────────────┘
                                      │  HTTPS / WebSockets (WSS) / REST API
                                      ▼
         ┌────────────────────────────────────────────────────────────────────────────────────────┐
         │                       ArogyaSwift Central Backend API (Node.js/Express)                │
         │  • Multi-Role RBAC (Google / JWT)        • Prescription Storage & Access Gate          │
         │  • Atomic Delivery Assignment Engine     • Multi-Pharmacy Order Aggregator             │
         │  • Distance & Routing Optimization       • Commission & Settlement Ledger              │
         └───────────────────────────────────┬────────────────────────────────────────────────────┘
                                             │
                                             ▼
         ┌────────────────────────────────────────────────────────────────────────────────────────┐
         │                         Unified PostgreSQL Database (Supabase / RDS)                   │
         │  • users & credentials                    • orders & order_pharmacy_fulfillments       │
         │  • pharmacies & regulatory licenses       • delivery_tasks & atomic_locks              │
         │  • medicines & inventory quotations       • payments, settlements & audit_logs         │
         └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## The 4 Specialized Applications

### 1. Customer App — ArogyaSwift
* **Primary Domains / Routes**: `arogyaswift.in` | `/patient` | `/customer`
* **Platforms**: Android-friendly PWA, iOS web, and responsive desktop website.
* **Target Audience**: Patients and healthcare consumers needing urgent or scheduled prescription medicines.
* **Customer Journey**:
  `Login / OTP Verification` ➔ `Set Delivery Location` ➔ `Search Medicines or Upload Rx` ➔ `Compare Pharmacy Quotes` ➔ `Review Multi-Pharmacy Cart` ➔ `Select Payment (Online / COD)` ➔ `Track Multi-Stop Pickup & Handover OTP`
* **Key Features**:
  - **Location & Geofencing**: Google Maps integration, address autocompletion, saved locations.
  - **Prescription Upload Gate**: Securely upload prescription photo/PDF with explicit consent to share *only* with the chosen fulfilling pharmacies.
  - **Transparent Stock Visibility**: Differentiates between *Direct Confirmed Stock* and *Requested Pharmacy Quotations*.
  - **Multi-Pharmacy Cart**: Allows sourcing item A from Pharmacy 1 and item B from Pharmacy 2 in a single checkout.
  - **Transparent Cost Breakdown**: Sourced medicines subtotal + delivery fee (₹30 for first chemist + ₹15 per additional stop) + platform fee (₹10).
  - **Safe Delivery Handover OTP**: 4-digit verification code required by rider at doorstep to prevent misplacement.

---

### 2. Pharmacy App — ArogyaSwift Partner
* **Primary Domains / Routes**: `partner.arogyaswift.in` | `/pharmacy`
* **Platforms**: Responsive web dashboard optimized for tablet, counter laptop, and desktop.
* **Target Audience**: Licensed retail chemists, store managers, and qualified pharmacists.
* **Pharmacy Journey**:
  `Register Store` ➔ `Submit CDSCO License` ➔ `Admin Verification` ➔ `Manage Stock & Catalog` ➔ `Receive Medicine Request` ➔ `Review Rx & Enter Quotation` ➔ `Pack Items with Sealed Label` ➔ `Handover to Store/Shared Rider with Chemist OTP`
* **Key Features**:
  - **Regulatory Onboarding & License Compliance**: Store address, owner name, CDSCO drug license number, license scan, and expiry tracking.
  - **Restricted Access Safeguard**: Cannot accept marketplace orders until license verification status is `APPROVED` by Admin.
  - **Real-Time Stock Management**: Search master catalog, toggle availability, update unit prices and batch dates.
  - **Prescription Verification Console**: Securely view authorized prescriptions, add clinical pharmacist notes, and mark verification timestamps.
  - **Hybrid Delivery Dispatch**: Choose between **Option A (Store's own rider)** or **Option B (Shared ArogyaSwift on-demand rider)**.
  - **Handover Security**: Unique 4-digit Chemist Pickup OTP ensures parcels are released only to the authorized rider.
  - **Financial Settlement Ledger**: Track fulfilled orders, commission deductions, and daily bank payouts.

---

### 3. Rider App — ArogyaSwift Delivery
* **Primary Domains / Routes**: `rider.arogyaswift.in` | `/delivery`
* **Platforms**: Mobile-first application optimized for Android and iOS smartphones.
* **Target Audience**: Delivery partners equipped with insulated delivery bags and cold-storage packs.
* **Rider Journey**:
  `Login` ➔ `Go Online` ➔ `Receive Delivery Request` ➔ `Atomic Accept Task` ➔ `Navigate to Pharmacy Stop 1 (Verify Chemist OTP)` ➔ `Navigate to Pharmacy Stop 2 (Verify Chemist OTP)` ➔ `Navigate to Customer (Verify Doorstep OTP)` ➔ `Earn Payout`
* **Essential Assignment Safeguards**:
  - **Atomic Acceptance Lock**: Implemented with database Compare-And-Swap (CAS) to guarantee that a task is NEVER assigned to two riders.
  - **Verification Enforcement**: Only verified riders (`kyc_status = 'APPROVED'`) with verified driving licenses can go online.
  - **Privacy Enforcement**: Riders only see sealed parcel IDs, pharmacy pickup locations, and customer delivery address; no prescription or sensitive medical records are exposed.
  - **Multi-Stop Navigation Sequence**: Optimized turn-by-turn routing across all participating pharmacies before heading to the patient.
  - **Two-Sided Proof of Delivery**:
    1. *Pharmacy Handover*: Rider enters Chemist 4-digit OTP to collect parcel.
    2. *Customer Handover*: Rider enters Customer 4-digit OTP to complete drop-off.

---

### 4. Admin App — ArogyaSwift Control Center
* **Primary Domains / Routes**: `admin.arogyaswift.in` | `/admin`
* **Platforms**: High-security responsive web console for desktop and laptop operations.
* **Target Audience**: ArogyaSwift platform administrators, operations managers, and compliance officers.
* **Admin Journey**:
  `Secure Admin Login` ➔ `Review Pharmacy & Rider Applications` ➔ `Verify CDSCO Drug Licenses` ➔ `Monitor Live Orders & Deliveries` ➔ `Intervene on Delays / Disputes` ➔ `Audit Financial Settlements`
* **Key Features**:
  - **Real-Time Executive Radar**: Track active orders, in-review prescriptions, ongoing delivery runs, and total GMV.
  - **Pharmacy KYC Roster**: Inspect drug licenses, expiry dates, GSTIN certificates; approve, suspend, or request resubmission.
  - **Rider Verification & Shift Monitor**: Inspect driver licenses, vehicle registration certificates (RC), and active delivery counts.
  - **Marketplace Order Interventions**: Reassign delayed deliveries, cancel failed runs, and trigger automated customer refunds.
  - **Financial Reconciliation**: Monitor platform commission splits, pharmacy net payouts, rider delivery fees, and export GST compliance summaries.
  - **Immutable Security & Audit Trail**: Centralized audit log capturing every administrative action, actor ID, IP address, and timestamp.

---

## Step-by-Step Implementation Phase Log

### Phase 1: Foundation (Database Architecture & Authentication)
* [x] **Step 1.1 — Rebrand to ArogyaSwift**: Replaced all instances of legacy names (`MediLink Local`, `QuickMed`) across configuration, context files, UI headers, and badges.
* [x] **Step 1.2 — Unified Order Schema (`AS-XXXX`)**: Standardized order prefixes to `AS-1044`, `AS-1043`... across storage, reactive context, and backend APIs.
* [x] **Step 1.3 — Multi-Role RBAC Model**: Implemented role enforcement (`customer`, `pharmacy`, `rider`, `admin`) with session storage and Google authentication synchronization.
* [x] **Step 1.4 — Database Blueprint**: Designed unified PostgreSQL schema with enums, constraints, foreign keys, and optimistic concurrency locks.

### Phase 2: Pharmacy App (ArogyaSwift Partner)
* [x] **Step 2.1 — Onboarding & CDSCO License Submission**: Pharmacist inputs store details, drug license number (`KA-BLR-20B-1142`), and submits documentation for compliance verification.
* [x] **Step 2.2 — Real-time Catalog & Stock Quotation**: Pharmacists review incoming medicine requests, mark item availability, adjust pricing buffers, and send live quotations.
* [x] **Step 2.3 — Prescription Review Console**: Secured view of customer prescriptions with pharmacist notes and verification timestamps.
* [x] **Step 2.4 — Hybrid Dispatch Management**: Support for store-owned delivery boy dispatch OR broadcasting to ArogyaSwift shared delivery fleet.
* [x] **Step 2.5 — Chemist Pickup Handover OTP**: Generates a 4-digit counter handover OTP required by riders before receiving sealed medicine parcels.

### Phase 3: Customer App (ArogyaSwift)
* [x] **Step 3.1 — Geofenced Location Selection**: Google Maps and GPS coordinates for Bengaluru / Indiranagar pilot zone.
* [x] **Step 3.2 — Prescription Upload & Salt Search**: Support for prescription image/PDF upload, manual medicine listing, and dosage specifications.
* [x] **Step 3.3 — Multi-Pharmacy Single Checkout**: Aggregates items from multiple participating chemists into one consolidated customer order.
* [x] **Step 3.4 — Transparent Cost Breakdown**: Itemized medicine prices + multi-stop delivery fee + platform fee + total payable.
* [x] **Step 3.5 — Live Tracking & Doorstep Delivery OTP**: Displaying live fulfillment stage, rider assignment, and 4-digit delivery verification OTP.

### Phase 4: Rider App (ArogyaSwift Delivery)
* [x] **Step 4.1 — Online / Offline Shift Control**: Verified riders can switch shifts and monitor active delivery allocations.
* [x] **Step 4.2 — Concurrency-Safe Atomic Acceptance**: Ensures delivery orders cannot be double-assigned through database compare-and-swap (CAS).
* [x] **Step 4.3 — Multi-Pharmacy Route Navigation**: Sequence stops: Pharmacy A ➔ Pharmacy B ➔ Customer Doorstep.
* [x] **Step 4.4 — Counter & Doorstep Two-Stage Handover**:
  - Chemist pickup: Verified via 4-digit pickup OTP.
  - Customer drop-off: Verified via 4-digit delivery OTP.
* [x] **Step 4.5 — Earnings Ledger**: Tracking delivery fees earned per completed trip.

### Phase 5: Admin App (ArogyaSwift Control Center)
* [x] **Step 5.1 — Operations Radar**: Real-time KPI counters (Total Orders, In Review, Live Deliveries, Completed Runs, Total Delivered Value).
* [x] **Step 5.2 — Pharmacy & Rider KYC Verification**: Actionable roster for licensing approval, status toggling, and compliance verification.
* [x] **Step 5.3 — Financial Reconciliation**: Tracking platform commission, delivery partner payouts, and pharmacy disbursements.
* [x] **Step 5.4 — Incident Investigation & Audit Logs**: Detailed audit trails for regulatory compliance.

### Phase 6: Shared Services & Security
* [x] **Step 6.1 — Rate Limiting & Input Validation**: Strict Zod schemas and exponential backoff rate limiters across all API endpoints.
* [x] **Step 6.2 — Private Prescription Storage**: Prescription images secured against unauthorized public scraping.
* [x] **Step 6.3 — Cross-Tab Reactive Synchronization**: Real-time `localStorage` + storage events broadcasting order status across all 4 portals.

---

## Technical Specifications & Architecture Diagram

### Shared Technologies
| Component | Technology | Rationale |
|---|---|---|
| **Frontend Apps** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons | High-performance, lightweight, responsive across mobile and desktop. |
| **Routing** | Wouter 3.7 | Zero-dependency, ultra-fast routing with separate paths for all 4 apps. |
| **Backend API** | Node.js, Express.js | Robust REST API with Zod validation and rate limiting. |
| **Database** | PostgreSQL | ACID compliance, relational integrity, row-level security, optimistic locking. |
| **Authentication** | Google OAuth 2.0 / Firebase Auth | Secure Google Sign-In with verified profiles, avatars, and role claims. |
| **Map Services** | Google Maps JavaScript API + HTML5 Geolocation | Precise navigation for customers, pharmacies, and riders. |
| **Hosting** | Cloudflare Pages / Vercel Serverless | Edge CDN delivery with millisecond global response times. |

---

## Concurrency-Safe Atomic Delivery Acceptance Logic

```typescript
// Atomically assigns a task to a rider with zero double-assignment race conditions
export async function acceptDeliveryTaskAtomically(taskId: string, riderId: string) {
  return await db.transaction(async (tx) => {
    // 1. Validate rider eligibility
    const rider = await tx.riders.findFirst({
      where: { id: riderId, kyc_status: 'APPROVED', is_online: true }
    });
    if (!rider) throw new Error("Rider is not verified or currently offline.");

    // 2. Atomic Compare-And-Swap (CAS)
    const result = await tx.$executeRaw`
      UPDATE delivery_tasks
      SET 
        rider_id = ${riderId}::uuid,
        status = 'ASSIGNED'::delivery_status,
        assigned_at = CURRENT_TIMESTAMP,
        version = version + 1
      WHERE id = ${taskId}::uuid 
        AND status = 'SEARCHING_RIDER'::delivery_status 
        AND rider_id IS NULL
    `;

    if (result === 0) {
      throw new Error("Conflict: This delivery run was already accepted by another rider.");
    }

    return { success: true, message: "Delivery assigned successfully." };
  });
}
```

---

## Conclusion & Deployment Guidelines

ArogyaSwift operates as **one cohesive marketplace with four purpose-built interfaces**:
1. **ArogyaSwift Customer App** provides transparent pricing, prescription safety, and doorstep delivery OTP.
2. **ArogyaSwift Partner** empowers neighborhood pharmacists with stock control, digital review, and hybrid dispatch.
3. **ArogyaSwift Delivery** gives riders race-condition-safe task assignments and multi-stop turn-by-turn routing.
4. **ArogyaSwift Control Center** ensures regulatory compliance, drug license verification, and financial reconciliation.

All four interfaces synchronize through the central database, guaranteeing that patient orders, chemist packages, and delivery progress remain 100% consistent.

