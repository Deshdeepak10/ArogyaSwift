# ArogyaSwift Technical Specification

**Version:** 1.0.0  
**Target Environment:** Node.js 20+, Express, Vite 7, Vercel Serverless Functions, Supabase PostgreSQL

---

## 1. System Architecture

ArogyaSwift is built as a Single Page Application (SPA) with a serverless API layer on Vercel and an Express service.

```
+-------------------------------------------------------------------+
|                           CLIENT LAYER                            |
|  React 19 SPA (Vite) + Tailwind CSS v4 + Wouter Router + Zod      |
|  Mapbox GL (WebGL 3D engine) + OpenStreetMap zero-cost fallback   |
+-------------------------------------------------------------------+
                                  │
                         HTTP REST API Requests
                                  │
+-------------------------------------------------------------------+
|                        SECURITY & RATE LIMITER                    |
|  Multi-tier Rate Limiter (Exponential backoff delay)              |
|  Zod Strict Schema Validation (Payload sanitization)              |
+-------------------------------------------------------------------+
                                  │
+-------------------------------------------------------------------+
|                     EXPRESS BACKEND SERVER                        |
|  server/app.ts (Shared Express application instance)              |
|  server/routes.ts (API endpoints & business logic)               |
|  server/db/index.ts (Supabase PostgreSQL connection pool)         |
+-------------------------------------------------------------------+
         │                                         │
  Vercel Serverless Function              Standalone Node Server
  api/index.js                            server/index.ts
```

---

## 2. API Endpoints

### 2.1 Health Checks
- **GET `/api/public/health`**
  - **Limiter**: Public rate limiter.
  - **Response**: `{ status: "ok", service: "ArogyaSwift Platform", timestamp: ISOString, database: { configured: boolean, connected: boolean } }`
- **GET `/api/db/health`**
  - **Limiter**: Public rate limiter.
  - **Response**: PostgreSQL live timestamp, version string, and connection pool status.

### 2.2 Authentication
- **POST `/api/auth/google/verify`**
  - **Description**: Verifies Google Identity Services ID token, creates or updates the user profile in Supabase PostgreSQL, and issues session claims.
  - **Request Body**: `{ "credential": "<google_jwt_token>" }`
- **POST `/api/auth/phone-signup`**
  - **Validation**: `PhoneSignupSchema`
  - **Request Body**:
    ```json
    {
      "name": "Sarah Chen",
      "phone": "9876543210",
      "role": "patient",
      "email": "sarah.chen@example.com",
      "locationPin": "Shipra Sun City, Indirapuram, Ghaziabad"
    }
    ```
- **POST `/api/auth/verify-otp`**
  - **Validation**: `VerifyOtpSchema`
  - **Rule**: Strictly 4-digit numeric OTP code (`/^\d{4}$/`).
  - **Request Body**: `{ "phone": "9876543210", "enteredOtp": "7392" }`
- **POST `/api/auth/login`**
  - **Validation**: `AuthCustomLoginSchema`
  - **Limiter**: Auth rate limiter with exponential backoff (`2s`, `4s`, `8s`...).

### 2.3 Pharmacy Operations
- **POST `/api/pharmacy/register`**
  - **Validation**: `PharmacyRegisterSchema`
  - **Fields**: `ownerName`, `shopName`, `licenseNo` (CDSCO format), `category`, `address`, `phone` (10 digits), `email`, `coldChainReady`.
- **POST `/api/pharmacy/quote`**
  - **Validation**: `PharmacyQuotationSubmitSchema`
  - **Fields**: `requestId`, `pharmacyId`, `quotedItems`, `estimatedDeliveryMins`.

### 2.4 Revenue Calculator
- **POST `/api/calculator/unit-economics`**
  - **Limiter**: Authenticated user limiter.
  - **Validation**: `RevenueCalculatorSchema`
  - **Request Body**: `{ "dailyOrders": 100, "avgOrderValue": 450, "commissionPercent": 18, "deliveryFee": 35 }`

---

## 3. Data Validation Contracts (`shared/schemas.ts`)

Zod schemas enforce all API input contracts:
- `AuthCustomLoginSchema`: Validates name (2-100 characters), email, password (min 6 characters), and role enum (`patient`, `pharmacy`, `rider`, `admin`).
- `PhoneSignupSchema`: Enforces exactly 10 digits for Indian mobile numbers (`^\d{10}$`).
- `VerifyOtpSchema`: Enforces exactly 4 numeric digits for verification OTPs (`^\d{4}$`).
- `PharmacyRegisterSchema`: Validates alphanumeric license IDs (`/^[a-zA-Z0-9-]+$/`) and 10-digit phone numbers.

---

## 4. Rate Limiting (`server/middleware/rateLimiter.ts`)

```typescript
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  accountWindowMs: number;
  accountMaxRequests: number;
  baseDelayMs: number;
  maxDelayMs: number;
}
```

- **Auth Limiter**: Exponential backoff per IP and per account identity (`delay = min(baseDelayMs * 2^(attempts - 1), maxDelayMs)`). Exceeded thresholds return HTTP 429 with `Retry-After`.
- **Public Limiter**: Protects public endpoints from automated scraping.
- **User Limiter**: Protects authenticated user endpoints against excessive load.

---

## 5. Map & Geolocation Engine (`client/src/components/Map.tsx`)

1. **Mapbox GL (Primary)**: Uses `mapbox-gl` with WebGL 3D rendering, custom animated rider pins, pharmacy hubs, customer drop-off points, and route polylines.
2. **OpenStreetMap Fallback**: When `VITE_MAPBOX_TOKEN` is unset or empty, the component falls back to zero-cost OpenStreetMap raster tiles without breaking map interactivity.
3. **HTML5 Geolocation**: Uses `navigator.geolocation.getCurrentPosition` for device coordinates.

---

## 6. Build and Deployment

- **`vercel.json`**:
  - `buildCommand`: `npm run build`
  - `outputDirectory`: `dist/public`
  - `rewrites`: Maps `/api/(.*)` to `/api/index.js` and all other paths to `/index.html`.
- **Bundle Strategy**: `npm run build` runs `vite build`, builds `server/index.ts` to `dist/index.js`, and uses `esbuild` to bundle `api/index.ts` into a self-contained `api/index.js` module for Vercel Serverless Functions.
- **Database**: Supabase PostgreSQL with SSL connection pooling (`aws-0-ap-south-1.pooler.supabase.com:6543`).
