# ArogyaSwift

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.2.1-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1.9-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vercel Deployed](https://img.shields.io/badge/Vercel-Live-black.svg)](https://arogyaswift.vercel.app)

ArogyaSwift is a hyperlocal medicine delivery platform for 10-to-30 minute prescription fulfillment. It coordinates patients, licensed neighborhood pharmacies, and express riders with real-time cold-chain temperature monitoring (2°C–8°C), 4-digit doorstep delivery OTP handoffs, and CDSCO regulatory compliance.

Live Demo: [https://arogyaswift.vercel.app](https://arogyaswift.vercel.app)

---

## Core Capabilities

### Patient Portal
- **Prescription Upload & Salt-Level Generic Matching**: Upload doctor prescriptions with automatic identification of active salts and cost-saving generic alternatives.
- **Daily Dosage Cabinet**: Track daily prescription schedules, log dosage compliance, and view medication history.
- **Real-Time Delivery & Cold-Chain Tracking**: Live Mapbox tracking showing rider GPS coordinates, ETA, and insulated storage box temperatures.
- **Device GPS Geolocation**: One-click browser geolocation to locate nearby pharmacies and set delivery drop points.

### Licensed Pharmacy Partner Portal
- **Prescription Review & Audit Queue**: Clinical verification workflow for registered pharmacists to inspect doctor credentials, dosage schedules, and drug schedules before dispatch.
- **Digital Audit Stamp**: Pharmacist approval recording license numbers and timestamps for regulatory compliance.
- **Cold Storage Logging**: Live telemetry verification ensuring temperature-sensitive medications (insulin, vaccines) remain within 2°C–8°C.
- **Local Hub Inventory Matching**: Real-time stock matching across neighborhood pharmacy partners.

### Express Rider Portal
- **Mapbox 3D Navigation**: WebGL vector maps with animated scooter tracking, turn-by-turn route geometry, and OpenStreetMap fallback.
- **Shift & Duty Toggle**: One-touch online/offline availability switch.
- **Doorstep OTP Handoff**: Strict 4-digit PIN verification confirming handoff to the designated recipient.

### Security & Resilience
- **Google OAuth 2.0 & GIS**: One-click Google Sign-In with server-side token verification and automatic profile synchronization with Supabase.
- **Supabase PostgreSQL Database**: 16 relational tables with Row Level Security (RLS) covering user profiles, pharmacies, inventory, orders, and audit logs.
- **Multi-Tier Rate Limiting**: Exponential backoff protection on authentication routes, IP rate tracking, and payload limits.
- **Zod Schema Validation**: Strict input validation across all customer, pharmacy, and delivery endpoints.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS |
| **Routing** | Wouter |
| **Mapping Engine** | Mapbox GL JS (WebGL 3D) with OpenStreetMap fallback |
| **Authentication** | Google OAuth 2.0 (Google Identity Services) + Express verification |
| **Database** | PostgreSQL on Supabase (ap-south-1 Mumbai) via `pg` connection pool |
| **Backend API** | Express.js running as Node server and Vercel Serverless Functions |
| **Deployment** | Vercel (Edge CDN + Serverless API) and Cloudflare Pages compatible |

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v10+

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Deshdeepak10/ArogyaSwift.git
   cd ArogyaSwift
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Key variables required for full functionality:*
   - `DATABASE_URL`: Supabase PostgreSQL connection string
   - `VITE_SUPABASE_URL`: Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase anon public API key
   - `VITE_GOOGLE_CLIENT_ID`: Google Cloud OAuth 2.0 Web Client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret
   - `VITE_MAPBOX_TOKEN`: *(Optional)* Mapbox public access token (`pk.eyJ...`)

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` (or `http://localhost:5173`) in your browser.

5. **Typecheck & Production Build**:
   ```bash
   npm run check
   npm run build
   ```

---

## Project Structure

```
ArogyaSwift/
├── api/                   # Vercel serverless function entry points
│   └── index.ts
├── client/                # React 19 frontend
│   ├── index.html
│   └── src/
│       ├── components/    # Map (Mapbox GL), LiveTrackingMap, AuthModal, etc.
│       ├── contexts/      # AuthContext (Google OAuth), OrderContext, ThemeContext
│       ├── pages/         # Patient, Pharmacy, Rider, Admin portals, Home, MVP
│       ├── lib/           # googleAuth, supabase, utils
│       ├── main.tsx
│       └── App.tsx
├── server/                # Express backend
│   ├── db/                # PostgreSQL connection pool and schema.sql
│   ├── middleware/        # Rate limiters and role authentication
│   ├── app.ts             # Express application configuration
│   ├── index.ts           # Standalone HTTP server entry
│   └── routes.ts          # API endpoints and Google token verification
├── shared/                # Shared Zod schemas, constants, and configs
│   └── schemas.ts
├── vercel.json            # Vercel deployment configuration
├── wrangler.toml          # Cloudflare Pages configuration
└── package.json
```

---

## Deployment

The application is deployed on Vercel at [https://arogyaswift.vercel.app](https://arogyaswift.vercel.app).

For manual deployment using Vercel CLI:
```bash
npx vercel --prod
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
