# 🛠️ ArogyaSwift — Technical Requirement Document (TRD)

**Document Version:** 1.0.0  
**Target Environment:** Node.js v18+, Express.js, Vite 7, Vercel Serverless Functions  

---

## 1. System Architecture Overview

ArogyaSwift is designed as a hybrid Single Page Application (SPA) with serverless micro-services and an Express backend layer.

```
+-------------------------------------------------------------------+
|                           CLIENT LAYER                            |
|  React 19 SPA (Vite) + Tailwind CSS v4 + Wouter Router + Zod      |
+-------------------------------------------------------------------+
                                  │
                         HTTP REST API Requests
                                  │
+-------------------------------------------------------------------+
|                        SECURITY & RATE LIMITER                    |
|  Multi-Tier Rate Limiter Middleware (Exponential Backoff Delay)   |
|  Zod Strict Schema Validation (Payload Sanitization)              |
+-------------------------------------------------------------------+
                                  │
+-------------------------------------------------------------------+
|                     EXPRESS BACKEND SERVER                        |
|  server/app.ts (Shared Express App Instance)                      |
|  server/routes.ts (API Routes & Revenue Calculator Logic)        |
+-------------------------------------------------------------------+
         │                                         │
  Vercel Serverless Deployment             Standalone Node Server
  api/index.ts                              server/index.ts
```

---

## 2. API Endpoint Specifications

### 2.1 Public Health & Status Endpoints
- **GET `/api/public/health`**
  - **Limiter**: Public Limiter (Moderate rate limit).
  - **Response**: `{ status: "ok", service: "ArogyaSwift Platform", timestamp: ISOString }`

### 2.2 Authentication Endpoints
- **POST `/api/auth/login`**
  - **Limiter**: Auth Limiter (Stricter per-IP & per-account with exponential backoff delay `2s`, `4s`, `8s`...).
  - **Validation**: `AuthCustomLoginSchema`
  - **Request Body**:
    ```json
    {
      "customName": "Sarah Chen",
      "customEmail": "sarah.chen@example.com",
      "password": "Password123",
      "selectedRole": "patient"
    }
    ```
  - **Response**: `{ status: "success", user: UserSession }`

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
  - **Request Body**: `{ "phone": "9876543210", "otp": "7392" }`

### 2.3 Pharmacy Operations Endpoints
- **POST `/api/pharmacy/register`**
  - **Validation**: `PharmacyRegisterSchema`
  - **Request Body**:
    ```json
    {
      "ownerName": "Pharm. Priya Nair",
      "shopName": "Apollo Express Pharmacy (Raj Nagar, Ghaziabad)",
      "licenseNo": "UP-2021-00921",
      "category": "Cold-Chain Certified Retail",
      "address": "Kavi Nagar Main Rd, Ghaziabad",
      "phone": "9876511223",
      "email": "hub.ghaziabad@apollopharmacy.in"
    }
    ```

### 2.4 Revenue Calculator Endpoint
- **POST `/api/calculator/unit-economics`**
  - **Limiter**: Authenticated User Limiter.
  - **Validation**: `RevenueCalculatorSchema`
  - **Request Body**: `{ "dailyOrders": 100, "avgOrderValue": 450, "commissionPercent": 18, "deliveryFee": 35 }`

---

## 3. Data Schemas & Validation Contracts (`shared/schemas.ts`)

### Zod Validation Rules:
1. `AuthCustomLoginSchema`:
   - `customName`: 2–100 chars.
   - `customEmail`: Valid email string, max 255 chars.
   - `password`: min 6 chars, max 100 chars.
   - `selectedRole`: enum `["patient", "pharmacy", "rider"]`.
2. `PhoneSignupSchema`:
   - `phone`: Exactly 10 digits (`^\d{10}$`).
   - `role`: enum `["patient", "rider"]`.
3. `PharmacyRegisterSchema`:
   - `licenseNo`: Must match format `/^[a-zA-Z0-9\s\-/]+$/`.

---

## 4. Rate Limiter Security Implementation (`server/middleware/rateLimiter.ts`)

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

### Rate Limiter Tiers:
1. **Auth Limiter**:
   - Environment variables: `RATE_LIMIT_AUTH_WINDOW_MS`, `RATE_LIMIT_AUTH_MAX_REQUESTS`.
   - Exponential backoff delay calculation: `delay = min(baseDelayMs * 2^(attempts - 1), maxDelayMs)`.
   - Returns HTTP `429 Too Many Requests` with `Retry-After` header when threshold exceeded.
2. **Public Limiter**:
   - Environment variables: `RATE_LIMIT_PUBLIC_WINDOW_MS`, `RATE_LIMIT_PUBLIC_MAX_REQUESTS`.
3. **Authenticated User Limiter**:
   - Environment variables: `RATE_LIMIT_USER_WINDOW_MS`, `RATE_LIMIT_USER_MAX_REQUESTS`.

---

## 5. Map & Geolocation Integration (`client/src/components/Map.tsx`)

1. **Google Maps Proxy API**: Loads Google Maps JS API script via `MAPS_PROXY_URL`.
2. **Device Geolocation**: Uses `navigator.geolocation.getCurrentPosition(...)` to retrieve physical device coordinates.
3. **Google Embed Map Fallback**: When API keys are unconfigured, automatically renders an embedded Google Map `iframe`:
   `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`

---

## 6. Vercel Serverless Build Specification

1. **`vercel.json`**:
   - `buildCommand`: `npm run build`
   - `outputDirectory`: `dist/public`
   - `rewrites`: API traffic to `/api/index.ts`, SPA routes to `/index.html`.
2. **Serverless Entry Point**: `api/index.ts` exports `app` from `server/app.ts`.
