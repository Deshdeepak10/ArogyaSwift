# ArogyaSwift Product and Interface Design Notes

## Core Concept

ArogyaSwift is an educational and functional marketplace platform for hyperlocal medicine fulfillment. It models how on-demand medicine delivery differs from standard food delivery:
1. Multi-chemist sourcing when a single pharmacy lacks complete stock.
2. Mandatory CDSCO compliance and prescription verification.
3. Cold-chain storage indicators and tamper-evident packaging.
4. Two-tier OTP verification (counter release + customer handover).

---

## Design System

### Colors
- **Primary (Teal #0891b2)**: Main actions, buttons, and brand indicators.
- **Accent (Emerald #10b981)**: Verified states, successful drop-offs, and compliance badges.
- **Warning (Amber #f59e0b)**: In-review prescriptions, pending rider dispatch.
- **Neutral (Slate #334155 / #0f172a)**: Body copy and headings.
- **Background (#f8fafc / #ffffff)**: Clean surfaces for readability.

### Typography
- **Headings**: Inter, 600/700 weight.
- **Body**: Inter, 400/500 weight.
- **Code & Schemas**: Monospace (Fira Code or system monospace).

---

## Portal Navigation and Layout

### 1. Customer Interface (`/patient`)
- Top search bar with salt composition matching.
- Prescription upload panel with explicit privacy consent checkbox.
- Multi-chemist quote comparison cards with price breakdown.
- Delivery tracking with Mapbox GL vector map and OpenStreetMap fallback.
- Doorstep 4-digit OTP display.

### 2. Pharmacy Interface (`/pharmacy`)
- Counter view for receiving incoming medicine requests.
- Quotation builder allowing item-by-item availability and pricing input.
- CDSCO license status banner.
- 4-digit Chemist Counter Handover OTP generation.

### 3. Rider Interface (`/delivery`)
- Shift toggle switch (Online / Offline).
- Atomic claim button with optimistic locking against duplicate claims.
- Ordered pickup sequence: Pharmacy 1 -> Pharmacy 2 -> Customer Doorstep.
- Numeric keypad input for entering 4-digit handover OTPs.

### 4. Admin Control Center (`/admin`)
- Operations summary counters (active orders, pending licenses, live riders).
- Pharmacy licensing roster with verify/reject actions.
- Financial settlement table with platform commission splits.
- Incident audit log with timestamped event history.
