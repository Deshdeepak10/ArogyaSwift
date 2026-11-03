# ArogyaSwift: Multi-Portal Architecture and Implementation Guide

ArogyaSwift is an on-demand, CDSCO-compliant hyperlocal medicine marketplace connecting patients with licensed neighborhood pharmacies. It solves multi-item medicine availability by coordinating four purpose-built interfaces backed by a single PostgreSQL database and Express API.

```
                              ┌──────────────────────────────────────────────────────────────┐
                              │                    AROGYASWIFT SYSTEM                        │
                              └──────────────────────────────┬───────────────────────────────┘
                                                             │
         ┌─────────────────────────────┬─────────────────────┴─────────┬─────────────────────────────┐
         │                             │                               │                             │
         ▼                             ▼                               ▼                             ▼
┌──────────────────┐         ┌──────────────────┐            ┌──────────────────┐          ┌──────────────────┐
│  1. Customer     │         │  2. Pharmacy     │            │  3. Delivery     │          │  4. Control      │
│     Portal       │         │     Portal       │            │     Portal       │          │     Center       │
│  /patient        │         │  /pharmacy       │            │  /delivery       │          │  /admin          │
└────────┬─────────┘         └────────┬─────────┘            └────────┬─────────┘          └────────┬─────────┘
         │                            │                               │                             │
         │ React / Vite               │ React / Counter Desktop       │ React Mobile PWA            │ React Admin
         │                            │                               │                             │
         └────────────────────────────┼───────────────────────────────┴─────────────────────────────┘
                                      │  HTTPS / REST API / Server-Sent Updates
                                      ▼
         ┌──────────────────────────────────────────────────────────────────────────────────────────┐
         │                      ArogyaSwift Express API & Serverless Function                       │
         │  • Multi-role RBAC (Google OAuth / OTP)   • Multi-pharmacy order aggregation             │
         │  • Atomic delivery assignment lock        • Mapbox GL routing & OSM fallback             │
         │  • CDSCO prescription compliance check    • Commission ledger & fee splits               │
         └───────────────────────────────────┬──────────────────────────────────────────────────────┘
                                             │
                                             ▼
         ┌──────────────────────────────────────────────────────────────────────────────────────────┐
         │                        Supabase PostgreSQL Database                                      │
         │  • user_profiles & credentials            • orders & pharmacy fulfillments               │
         │  • pharmacies & regulatory licenses       • delivery_tasks & atomic locks                │
         │  • medicines & pharmacy inventory         • settlements & audit logs                     │
         └──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## The Four Specialized Portals

### 1. Customer Portal (`/patient`, `/customer`)
- **Target Users**: Patients ordering prescription or OTC medicines from local chemists.
- **Workflow**:
  Sign in (Google or 4-digit OTP) -> Set delivery address -> Upload prescription or search medicines -> Compare pharmacy quotations -> Consolidated multi-pharmacy checkout -> Track delivery -> Verify doorstep 4-digit handover OTP.
- **Key Capabilities**:
  - **Location & Geofencing**: Mapbox GL map integration with device geolocation and free OpenStreetMap raster fallback.
  - **Prescription Upload Gate**: Upload prescription photo or PDF with explicit patient privacy consent.
  - **Multi-Pharmacy Cart**: Combine items from multiple neighborhood chemists into one checkout order.
  - **Transparent Cost Breakdown**: Medicine totals + delivery fee (₹30 first chemist + ₹15 per additional stop) + platform fee (₹10).
  - **4-Digit Doorstep OTP**: Delivery partner must enter this code to complete drop-off.

---

### 2. Pharmacy Portal (`/pharmacy`)
- **Target Users**: Retail chemists, pharmacy owners, and registered pharmacists.
- **Workflow**:
  Register store -> Enter CDSCO license number -> Admin verification -> Catalog management -> Review customer quote requests -> Send price quotation -> Pack and seal parcel -> Release parcel with 4-digit Chemist Pickup OTP.
- **Key Capabilities**:
  - **License Verification**: CDSCO drug license details and expiration monitoring. Unverified pharmacies cannot fulfill orders.
  - **Catalog & Inventory**: Manage stock status, update unit prices, and adjust item availability.
  - **Prescription Review**: Inspect uploaded prescriptions and add pharmacist verification notes.
  - **Dispatch Options**: Choose between in-house delivery rider or broadcast to the ArogyaSwift rider network.
  - **Pickup Handover Security**: 4-digit Chemist Pickup OTP ensures parcels are released only to the assigned delivery partner.

---

### 3. Delivery Portal (`/delivery`)
- **Target Users**: Delivery riders equipped with insulated carry bags.
- **Workflow**:
  Sign in -> Toggle shift online -> View available delivery runs -> Accept task -> Navigate to pharmacy stops (verify Chemist OTP) -> Navigate to customer address (verify Doorstep OTP) -> Trip complete.
- **Assignment Safeguards**:
  - **Atomic Task Acceptance**: Database compare-and-swap (CAS) lock prevents duplicate rider assignments.
  - **Verification Gate**: Only riders with approved driver's licenses can go online.
  - **Privacy**: Riders see parcel identifiers, pharmacy pickup addresses, and customer drop-off location; medical records remain protected.
  - **Sequential Multi-Stop Routing**: Waypoint navigation ordering pharmacy pickups before final customer drop-off.
  - **Dual OTP Verification**:
    1. Chemist counter pickup: 4-digit pickup OTP.
    2. Customer doorstep drop-off: 4-digit delivery OTP.

---

### 4. Admin Control Center (`/admin`)
- **Target Users**: Operations managers and compliance officers.
- **Workflow**:
  Sign in -> Review pharmacy applications -> Verify CDSCO licenses -> Monitor live orders and rider dispatches -> Handle delivery delays or disputes -> Review settlement ledgers.
- **Key Capabilities**:
  - **Operations Dashboard**: Real-time counts for active orders, orders under review, active deliveries, and delivered value.
  - **Pharmacy KYC**: Approve, reject, or request changes on pharmacy registrations and drug licenses.
  - **Rider Verification**: Inspect vehicle registrations and license IDs before approving rider shifts.
  - **Audit Trail**: Every administrative action logs timestamp, actor ID, and IP address.

---

## Implementation Status

### Phase 1: Core Foundation
- [x] Standardized order ID formatting (`AS-XXXX`).
- [x] Multi-role access control (`patient`, `pharmacy`, `rider`, `admin`).
- [x] Live Supabase PostgreSQL database integration with connection pooling.
- [x] Google OAuth 2.0 integration with direct PostgreSQL user profile upsert.

### Phase 2: Pharmacy Portal
- [x] Store registration with CDSCO drug license validation.
- [x] Medicine catalog search, quotation submissions, and pricing adjustments.
- [x] Prescription review and pharmacist verification notes.
- [x] Counter handover verification with 4-digit Chemist Pickup OTP.

### Phase 3: Customer Portal
- [x] Mapbox GL map integration with GPS device location and zero-cost OpenStreetMap fallback.
- [x] Prescription photo/PDF upload with privacy consent gate.
- [x] Multi-pharmacy cart and itemized cost breakdown.
- [x] Real-time order progress tracking with 4-digit Doorstep Delivery OTP.

### Phase 4: Delivery Portal
- [x] Shift toggle (online / offline).
- [x] Atomic assignment lock to prevent double-claiming tasks.
- [x] Multi-stop pickup and delivery sequencing.
- [x] Two-stage OTP verification (counter pickup + customer doorstep).

### Phase 5: Admin Control Center
- [x] Key performance metrics (orders, deliveries, verification pipeline).
- [x] Pharmacy license verification and status management.
- [x] Financial breakdown (platform commissions, rider payouts, pharmacy payouts).

### Phase 6: Production Hardening
- [x] Multi-tier rate limiting with exponential backoff.
- [x] Sensitive path shielding to block exposure of source files and environment variables.
- [x] Vercel serverless build with bundled `api/index.js`.

---

## Technical Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons | Client application bundles. |
| **Routing** | Wouter | Client-side routing for customer, pharmacy, rider, and admin views. |
| **Backend API** | Node.js, Express | REST API with Zod validation, rate limiting, and security headers. |
| **Database** | PostgreSQL (Supabase) | Relational database with pooled connections and SSL. |
| **Authentication** | Google Identity Services + 4-digit OTP | Google Sign-In and phone OTP verification. |
| **Mapping Engine** | Mapbox GL JS + OpenStreetMap | WebGL vector maps with raster tile fallback. |
| **Hosting** | Vercel | Serverless API and static CDN hosting. |

---

## Atomic Task Assignment Logic

```typescript
// Atomically assigns a task to a rider to prevent race conditions
export async function acceptDeliveryTaskAtomically(taskId: string, riderId: string) {
  return await db.transaction(async (tx) => {
    // 1. Validate rider status
    const rider = await tx.riders.findFirst({
      where: { id: riderId, kyc_status: "APPROVED", is_online: true },
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
