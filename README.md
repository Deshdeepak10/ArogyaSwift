# 💊 ArogyaSwift — Hyperlocal Medicine Delivery & Cold-Chain Logistics Blueprint

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.2.1-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1.9-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vercel Deployed](https://img.shields.io/badge/Vercel-Deployed-black.svg)](https://vercel.com/)

**ArogyaSwift** is a state-of-the-art, hyperlocal 10-to-30 minute medicine delivery platform blueprint built for CDSCO-compliant pharmaceutical fulfillment, cold-chain temperature telemetry monitoring (2°C–8°C), and multi-role operations across Patients, Licensed Pharmacy Partners, and Express Delivery Riders.

---

## 🌟 Key Features

### 👩‍💼 Patient & Healthcare Consumer Portal
- **AI OCR e-Prescription Scanner**: Instant optical character recognition for paper/digital prescriptions with salt-level generic alternative suggestions.
- **Daily Dosage Cabinet & Medication Alarm**: Log pending doses, record daily compliance, and manage active prescriptions.
- **Live Order & Temperature Tracking**: Monitor express delivery ETA, real-time rider GPS position, and cold-storage box temperatures.
- **Device GPS Location Acquisition**: One-click HTML5 geolocation to auto-detect device coordinates in Ghaziabad and surrounding regions.

### 🏥 Licensed Pharmacy Partner Portal
- **Pharmacist Clinical Audit**: Multi-check verification workflow for prescription validity, dosage accuracy, and doctor registration.
- **Digital Pharmacist Approval Stamp**: Secure cryptographic verification stamp (#0x9F82) for audit trails.
- **Cold Storage Compliance Log**: Real-time 2°C–8°C insulated refrigeration telemetry logging.
- **ERP Stock Synchronization**: 100% real-time inventory matching across local fulfillment hubs.

### 🏍️ Express Delivery Rider Portal
- **Google Maps & Vector Navigation**: Switch between Google Satellite view and high-tech vector navigation maps.
- **Duty Status Control**: One-click Online/Offline shift toggle.
- **OTP Verification Handoff**: Secure 4-digit PIN verification to ensure medicine handoff to the authorized recipient.

### 🔒 Enterprise Security & Rate Limiting
- **Multi-Tier Configurable Rate Limiter**: Stricter limits on auth routes (`/api/auth/*`) with exponential backoff delay (`2s`, `4s`, `8s`...), per-IP & per-account rate tracking, and configurable thresholds.
- **Strict Zod Input Validation**: Complete schema enforcement rejecting malformed payload types, lengths, and formats.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 7 |
| **Styling** | Tailwind CSS v4, Vanilla Utility Classes, Lucide Icons |
| **Routing** | Wouter 3.7 |
| **State & Auth** | React Context API, Strict Zod Schemas |
| **Backend & API** | Express.js, TypeScript (ESM) |
| **Map Integration** | Google Maps JavaScript API, Device Geolocation |
| **Deployment** | Vercel Serverless Functions & Static Hosting |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **pnpm** / **npm**: Package Manager

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Deshdeepak10/ArogyaSwift.git
   cd ArogyaSwift
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Required variables:*
   - `PORT`: Server port (Default: `3000`)
   - `VITE_FRONTEND_FORGE_API_KEY`: Google Maps Proxy API Key

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📐 Project Structure

```
ArogyaSwift/
├── api/                   # Vercel Serverless Entry Points
│   └── index.ts
├── client/                # React 19 Frontend SPA
│   ├── index.html
│   └── src/
│       ├── components/    # Reusable UI Components (Map, LiveTrackingMap, ProfileModal, etc.)
│       ├── contexts/      # AuthContext, ThemeContext
│       ├── pages/         # LoginHome, MedicineMVP, MedicineDelivery, NotFound
│       ├── main.tsx
│       └── App.tsx
├── server/                # Express Backend Server
│   ├── middleware/        # Multi-Tier Rate Limiter Middleware
│   ├── app.ts             # Express App Instance
│   ├── index.ts           # Standalone Node HTTP Server
│   └── routes.ts          # Validated API Routes
├── shared/                # Shared Types & Zod Schemas
│   ├── config.ts
│   └── schemas.ts
├── PROJECT_REQUIREMENTS.md
├── TECHNICAL_REQUIREMENTS.md
├── vercel.json
└── package.json
```

---

## 🌐 Vercel Deployment

This project includes pre-configured Vercel deployment files (`vercel.json` and `api/index.ts`).

### Deploy via Vercel CLI:
```bash
npx vercel --prod
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
