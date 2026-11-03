// server/app.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// shared/schemas.ts
import { z } from "zod";
var UserRoleSchema = z.enum(["customer", "patient", "pharmacy", "rider", "admin"]);
var AuthCustomLoginSchema = z.object({
  customName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100, "Full name cannot exceed 100 characters").regex(/^[a-zA-Z0-9\s.\-']+$/, "Full name contains invalid characters"),
  customEmail: z.string().trim().email("Invalid email format").max(255, "Email address cannot exceed 255 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password cannot exceed 100 characters"),
  selectedRole: UserRoleSchema
});
var PhoneSignupSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100, "Full name cannot exceed 100 characters").regex(/^[a-zA-Z0-9\s.\-']+$/, "Full name contains invalid characters"),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  role: z.enum(["customer", "patient", "rider"]),
  email: z.string().trim().email("Invalid email address format").max(255, "Email cannot exceed 255 characters").optional().or(z.literal("")),
  locationPin: z.string().trim().max(250, "Location address cannot exceed 250 characters").optional(),
  vehicleType: z.string().trim().max(100, "Vehicle type cannot exceed 100 characters").optional(),
  drivingLicense: z.string().trim().max(50, "Driver license ID cannot exceed 50 characters").regex(/^[a-zA-Z0-9-]*$/, "Driver license ID contains invalid characters").optional()
});
var VerifyOtpSchema = z.object({
  phone: z.string().trim().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  enteredOtp: z.string().trim().regex(/^\d{4}$/, "OTP code must be exactly 4 digits")
});
var PharmacyRegisterSchema = z.object({
  ownerName: z.string().trim().min(2, "Owner name must be at least 2 characters").max(100, "Owner name cannot exceed 100 characters").regex(/^[a-zA-Z0-9\s.\-']+$/, "Owner name contains invalid characters"),
  shopName: z.string().trim().min(2, "Pharmacy shop title must be at least 2 characters").max(100, "Pharmacy shop title cannot exceed 100 characters"),
  licenseNo: z.string().trim().min(5, "License number must be at least 5 characters").max(30, "License number cannot exceed 30 characters").regex(/^[a-zA-Z0-9-]+$/, "License number must contain only letters, digits, and hyphens"),
  category: z.string().trim().min(3, "Category must be selected").max(100, "Category exceeds maximum length"),
  address: z.string().trim().min(5, "Shop address must be at least 5 characters").max(300, "Shop address cannot exceed 300 characters"),
  phone: z.string().trim().transform((val) => val.replace(/\D/g, "").slice(-10)).refine((val) => val.length === 10, { message: "Phone number must contain 10 valid digits" }),
  email: z.string().trim().email("Invalid email address format").max(255, "Email cannot exceed 255 characters"),
  coldChainReady: z.boolean()
});
var PrescriptionUploadSchema = z.object({
  patientName: z.string().trim().min(2, "Patient name must be at least 2 characters").max(100, "Patient name cannot exceed 100 characters"),
  patientPhone: z.string().trim().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  privacyConsentGranted: z.boolean().refine((val) => val === true, {
    message: "Explicit customer privacy consent is required before prescription upload."
  }),
  prescriptionNotes: z.string().trim().max(1e3, "Prescription notes cannot exceed 1000 characters").optional()
});
var CustomerMedicineRequestSchema = z.object({
  deliveryLocation: z.string().trim().min(3, "Delivery location is required"),
  zone: z.string().trim().min(2, "Zone is required"),
  serviceLevel: z.enum(["standard", "express"]),
  requestedMedicines: z.array(
    z.object({
      name: z.string().min(1, "Medicine name is required"),
      quantity: z.number().int().min(1, "Quantity must be at least 1")
    })
  ).min(1, "At least one medicine must be requested"),
  notes: z.string().max(500).optional()
});
var PharmacyQuotationSubmitSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  quotedItems: z.array(
    z.object({
      medicineName: z.string(),
      quantity: z.number().int().min(1),
      unitPrice: z.number().min(0),
      isGeneric: z.boolean().default(false),
      isAvailable: z.boolean().default(true)
    })
  ),
  medicinesTotal: z.number().min(0, "Total must be positive"),
  estimatedDeliveryMins: z.number().int().min(10).max(180),
  stockConfirmed: z.boolean()
});
var AdminPharmacyVerifySchema = z.object({
  pharmacyId: z.string().min(1, "Pharmacy ID is required"),
  verificationStatus: z.enum(["verified", "rejected", "suspended"]),
  rejectionReason: z.string().max(500).optional(),
  licenseExpiryDate: z.string().optional()
});
var DeliveryTaskAssignSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  assignmentType: z.enum(["pharmacy_own", "shared_network"]),
  riderId: z.string().optional(),
  requiresColdChain: z.boolean().default(false)
});
var DeliveryStatusUpdateSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum(["assigned", "arrived_at_pharmacy", "picked_up", "out_for_delivery", "delivered"]),
  tamperSealVerified: z.boolean().default(true),
  currentTemperature: z.number().optional(),
  notes: z.string().max(500).optional()
});
var DeliveryOtpVerifySchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
  enteredOtp: z.string().length(4, "OTP must be exactly 4 digits")
});
var RevenueCalculatorSchema = z.object({
  monthlyOrders: z.number().int("Monthly orders must be a whole number").min(1, "Monthly orders must be at least 1").max(1e6, "Monthly orders cannot exceed 1,000,000"),
  avgOrderValue: z.number().min(1, "Average order value must be at least \u20B91").max(1e5, "Average order value cannot exceed \u20B9100,000"),
  riderCommission: z.number().min(0, "Commission percentage cannot be negative").max(100, "Commission percentage cannot exceed 100%")
});

// shared/config.ts
var rateLimitConfig = {
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1e3,
  // 15 minutes
  authIpMax: Number(process.env.RATE_LIMIT_AUTH_IP_MAX) || 5,
  authAccountMax: Number(process.env.RATE_LIMIT_AUTH_ACCOUNT_MAX) || 5,
  publicMax: Number(process.env.RATE_LIMIT_PUBLIC_MAX) || 60,
  userMax: Number(process.env.RATE_LIMIT_USER_MAX) || 300
};
var appConfig = {
  port: Number(process.env.PORT) || 3e3,
  isProduction: process.env.NODE_ENV === "production",
  rateLimit: rateLimitConfig
};

// server/middleware/rateLimiter.ts
var ipStore = /* @__PURE__ */ new Map();
var accountStore = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  ipStore.forEach((record, key) => {
    if (now > record.resetTime && now > record.nextAllowedTime) {
      ipStore.delete(key);
    }
  });
  accountStore.forEach((record, key) => {
    if (now > record.resetTime && now > record.nextAllowedTime) {
      accountStore.delete(key);
    }
  });
}, 60 * 1e3);
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
}
function authRateLimiter(req, res, next) {
  const now = Date.now();
  const ip = getClientIp(req);
  const account = req.body?.email || req.body?.phone || req.body?.customEmail || req.body?.licenseNo || "anonymous_auth";
  const ipKey = `auth:ip:${ip}`;
  const accountKey = `auth:account:${account}`;
  let ipRecord = ipStore.get(ipKey);
  if (!ipRecord || now > ipRecord.resetTime) {
    ipRecord = {
      count: 0,
      resetTime: now + rateLimitConfig.windowMs,
      failedAttempts: ipRecord?.failedAttempts || 0,
      nextAllowedTime: 0
    };
    ipStore.set(ipKey, ipRecord);
  }
  let accountRecord = accountStore.get(accountKey);
  if (!accountRecord || now > accountRecord.resetTime) {
    accountRecord = {
      count: 0,
      resetTime: now + rateLimitConfig.windowMs,
      failedAttempts: accountRecord?.failedAttempts || 0,
      nextAllowedTime: 0
    };
    accountStore.set(accountKey, accountRecord);
  }
  if (now < ipRecord.nextAllowedTime || now < accountRecord.nextAllowedTime) {
    const retryAfterSeconds = Math.ceil(
      (Math.max(ipRecord.nextAllowedTime, accountRecord.nextAllowedTime) - now) / 1e3
    );
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({
      error: "Too many authentication requests.",
      message: `Exponential backoff active. Please wait ${retryAfterSeconds} seconds before trying again.`,
      retryAfterSeconds
    });
    return;
  }
  if (ipRecord.count >= rateLimitConfig.authIpMax || accountRecord.count >= rateLimitConfig.authAccountMax) {
    const attempts = Math.max(ipRecord.failedAttempts, accountRecord.failedAttempts) + 1;
    const backoffSeconds = Math.min(Math.pow(2, attempts - 1) * 2, 900);
    const nextAllowed = now + backoffSeconds * 1e3;
    ipRecord.failedAttempts = attempts;
    ipRecord.nextAllowedTime = nextAllowed;
    accountRecord.failedAttempts = attempts;
    accountRecord.nextAllowedTime = nextAllowed;
    res.setHeader("Retry-After", String(backoffSeconds));
    res.status(429).json({
      error: "Rate limit exceeded on authentication endpoint.",
      message: `Account or IP limit reached. Exponential backoff enforced for ${backoffSeconds} seconds.`,
      retryAfterSeconds: backoffSeconds
    });
    return;
  }
  ipRecord.count += 1;
  accountRecord.count += 1;
  res.setHeader("X-RateLimit-Limit-IP", String(rateLimitConfig.authIpMax));
  res.setHeader("X-RateLimit-Remaining-IP", String(Math.max(0, rateLimitConfig.authIpMax - ipRecord.count)));
  next();
}
function publicRateLimiter(req, res, next) {
  const now = Date.now();
  const ip = getClientIp(req);
  const key = `public:ip:${ip}`;
  let record = ipStore.get(key);
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + rateLimitConfig.windowMs,
      failedAttempts: 0,
      nextAllowedTime: 0
    };
    ipStore.set(key, record);
  }
  if (record.count >= rateLimitConfig.publicMax) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1e3);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({
      error: "Too Many Requests",
      message: `Public rate limit exceeded (${rateLimitConfig.publicMax} reqs/window). Try again in ${retryAfterSeconds} seconds.`
    });
    return;
  }
  record.count += 1;
  res.setHeader("X-RateLimit-Limit", String(rateLimitConfig.publicMax));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, rateLimitConfig.publicMax - record.count)));
  next();
}
function authenticatedUserRateLimiter(req, res, next) {
  const now = Date.now();
  const userId = req.headers["x-user-id"] || getClientIp(req);
  const key = `user:action:${userId}`;
  let record = ipStore.get(key);
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + rateLimitConfig.windowMs,
      failedAttempts: 0,
      nextAllowedTime: 0
    };
    ipStore.set(key, record);
  }
  if (record.count >= rateLimitConfig.userMax) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1e3);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({
      error: "Too Many Requests",
      message: `User action limit exceeded (${rateLimitConfig.userMax} reqs/window). Try again in ${retryAfterSeconds} seconds.`
    });
    return;
  }
  record.count += 1;
  res.setHeader("X-RateLimit-Limit", String(rateLimitConfig.userMax));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, rateLimitConfig.userMax - record.count)));
  next();
}

// server/middleware/roleAuth.ts
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const roleHeader = req.headers["x-user-role"]?.toLowerCase();
    const userId = req.headers["x-user-id"] || "u-anon";
    const userEmail = req.headers["x-user-email"] || "user@arogyaswiftlocal.in";
    if (!roleHeader) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Missing role authentication credentials in request header."
      });
      return;
    }
    const normalizedRole = roleHeader === "patient" ? "customer" : roleHeader;
    const normalizedAllowed = allowedRoles.map((r) => r === "patient" ? "customer" : r);
    if (!normalizedAllowed.includes(normalizedRole)) {
      res.status(403).json({
        error: "Forbidden",
        message: `Access denied. Role '${roleHeader}' does not have sufficient permissions to access this endpoint. Required: [${allowedRoles.join(", ")}].`
      });
      return;
    }
    req.user = {
      id: userId,
      role: roleHeader,
      email: userEmail
    };
    next();
  };
}

// server/db/index.ts
import pg from "pg";
var { Pool } = pg;
var connectionString = process.env.DATABASE_URL;
var pool = null;
var isConnected = false;
if (connectionString && connectionString.trim().length > 0 && !connectionString.includes("YOUR_")) {
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    // Required for Supabase cloud PostgreSQL
    max: 10,
    idleTimeoutMillis: 3e4,
    connectionTimeoutMillis: 5e3
  });
  pool.on("error", (err) => {
    console.error("[Supabase DB Error] Unexpected pool error on idle client:", err.message);
  });
  pool.query("SELECT NOW() as current_time, current_database() as db_name").then((res) => {
    isConnected = true;
    console.log(
      `[Supabase DB] Connected to PostgreSQL (${res.rows[0].db_name}) at ${res.rows[0].current_time}`
    );
  }).catch((err) => {
    isConnected = false;
    console.warn(
      `[Supabase DB] Could not connect to DATABASE_URL: ${err.message}. Running with fallback in-memory store.`
    );
  });
} else {
  console.log(
    "[Supabase DB] No DATABASE_URL provided in .env. Running in demo mode. Add DATABASE_URL to connect live Supabase."
  );
}
function getDbStatus() {
  return {
    configured: Boolean(connectionString && !connectionString.includes("YOUR_")),
    connected: isConnected,
    provider: "Supabase PostgreSQL"
  };
}

// server/routes.ts
function registerRoutes(app2) {
  app2.get("/api/public/health", publicRateLimiter, (_req, res) => {
    res.json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "ArogyaSwift Hyperlocal Marketplace API",
      cdsco_compliance_mode: "Strict",
      database: getDbStatus()
    });
  });
  app2.get("/api/db/health", publicRateLimiter, async (_req, res) => {
    const status = getDbStatus();
    if (!pool) {
      res.json({
        ...status,
        message: "No DATABASE_URL configured in .env. Running with in-memory storage."
      });
      return;
    }
    try {
      const result = await pool.query("SELECT NOW() as current_time, version()");
      res.json({
        ...status,
        connected: true,
        serverTime: result.rows[0].current_time,
        version: result.rows[0].version
      });
    } catch (err) {
      res.status(503).json({
        ...status,
        connected: false,
        error: err.message
      });
    }
  });
  app2.post("/api/auth/login", authRateLimiter, (req, res) => {
    const parseResult = AuthCustomLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
      return;
    }
    const { customName, customEmail, selectedRole } = parseResult.data;
    res.json({
      success: true,
      message: `Signed in as ${customName} with role ${selectedRole.toUpperCase()}`,
      token: `jwt_sim_${selectedRole}_${Date.now()}`,
      user: {
        id: `u-${selectedRole}-${Date.now()}`,
        name: customName,
        email: customEmail,
        role: selectedRole,
        badge: `${selectedRole.toUpperCase()} #${Math.floor(1e3 + Math.random() * 9e3)}`
      }
    });
  });
  app2.post("/api/auth/phone-signup", authRateLimiter, (req, res) => {
    const parseResult = PhoneSignupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
      return;
    }
    res.json({
      success: true,
      message: `SMS verification OTP dispatched to +91 ${parseResult.data.phone}`,
      otpDemoCode: "7392"
    });
  });
  app2.post("/api/auth/verify-otp", authRateLimiter, (req, res) => {
    const parseResult = VerifyOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
      return;
    }
    if (parseResult.data.enteredOtp === "7392" || parseResult.data.enteredOtp === "1234") {
      res.json({
        success: true,
        message: "Phone verified successfully. Session established."
      });
    } else {
      res.status(401).json({
        error: "Authentication failed",
        message: "Invalid OTP code provided"
      });
    }
  });
  app2.post("/api/auth/google/verify", authRateLimiter, async (req, res) => {
    try {
      const { idToken, role = "patient" } = req.body;
      if (!idToken || typeof idToken !== "string") {
        res.status(400).json({ error: "Missing Google authorization token" });
        return;
      }
      const googleTokenUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
      const googleRes = await fetch(googleTokenUrl);
      let userName = "Google User";
      let userEmail = "";
      let userAvatar = "";
      let userId = "";
      if (googleRes.ok) {
        const payload = await googleRes.json();
        userId = payload.sub;
        userName = payload.name || payload.given_name || "Google User";
        userEmail = payload.email || "";
        userAvatar = payload.picture || "";
      } else {
        const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        if (userinfoRes.ok) {
          const userinfo = await userinfoRes.json();
          userId = userinfo.sub;
          userName = userinfo.name || userinfo.given_name || "Google User";
          userEmail = userinfo.email || "";
          userAvatar = userinfo.picture || "";
        } else {
          res.status(401).json({ error: "Invalid or expired Google token" });
          return;
        }
      }
      let dbId = userId;
      if (pool && userEmail) {
        try {
          const dbRole = role === "patient" ? "customer" : role === "pharmacist" ? "pharmacy" : role === "admin" ? "admin" : "customer";
          const insertRes = await pool.query(
            `INSERT INTO user_profiles (full_name, email, avatar_url, role)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email)
             DO UPDATE SET full_name = EXCLUDED.full_name, avatar_url = EXCLUDED.avatar_url, updated_at = NOW()
             RETURNING id, full_name, email, role, avatar_url`,
            [userName, userEmail, userAvatar, dbRole]
          );
          if (insertRes.rows.length > 0) {
            dbId = insertRes.rows[0].id;
          }
        } catch (dbErr) {
          console.warn("[Google Auth] Warning: could not upsert user to Supabase:", dbErr.message);
        }
      }
      res.json({
        success: true,
        user: {
          id: dbId,
          googleSubId: userId,
          name: userName,
          email: userEmail,
          avatar: userAvatar,
          role,
          badge: `Google Verified \u2022 ${String(role).toUpperCase()}`,
          isGoogleUser: true
        }
      });
    } catch (err) {
      res.status(500).json({ error: "Internal error verifying Google token", message: err.message });
    }
  });
  app2.post(
    "/api/customer/prescription-upload",
    authenticatedUserRateLimiter,
    requireRole(["customer", "patient"]),
    (req, res) => {
      const parseResult = PrescriptionUploadSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: "Invalid input schema",
          details: parseResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
        return;
      }
      res.json({
        success: true,
        prescription: {
          id: `rx-${Date.now()}`,
          patientName: parseResult.data.patientName,
          storageBucket: "private-prescriptions",
          storagePath: `prescriptions/${req.user?.id}/${Date.now()}.enc`,
          isPrivateStorage: true,
          privacyConsentGranted: parseResult.data.privacyConsentGranted,
          reviewStatus: "pending",
          uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    }
  );
  app2.post(
    "/api/customer/medicine-request",
    authenticatedUserRateLimiter,
    requireRole(["customer", "patient"]),
    (req, res) => {
      const parseResult = CustomerMedicineRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: "Invalid input schema",
          details: parseResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
        return;
      }
      res.json({
        success: true,
        requestId: `req-${Date.now()}`,
        status: "pending_quotes",
        availability: "unconfirmed",
        dispatchedToNearbyPharmaciesCount: 3,
        zone: parseResult.data.zone,
        serviceLevel: parseResult.data.serviceLevel,
        notice: "Stock availability is unconfirmed until pharmacies respond with quotations."
      });
    }
  );
  app2.post(
    "/api/pharmacy/submit-quote",
    authenticatedUserRateLimiter,
    requireRole(["pharmacy"]),
    (req, res) => {
      const parseResult = PharmacyQuotationSubmitSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: "Invalid input schema",
          details: parseResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
        return;
      }
      res.json({
        success: true,
        quotationId: `quote-${Date.now()}`,
        pharmacyId: req.user?.id,
        medicinesTotal: parseResult.data.medicinesTotal,
        platformFee: 15,
        deliveryFee: 25,
        totalPayable: parseResult.data.medicinesTotal + 40,
        estimatedDeliveryMins: parseResult.data.estimatedDeliveryMins,
        stockConfirmed: parseResult.data.stockConfirmed,
        status: "submitted"
      });
    }
  );
  app2.post(
    "/api/pharmacy/audit-prescription",
    authenticatedUserRateLimiter,
    requireRole(["pharmacy"]),
    (req, res) => {
      const { prescriptionId, decision, pharmacistNotes, licenseNo } = req.body;
      if (!prescriptionId || !decision) {
        res.status(400).json({ error: "Missing prescriptionId or decision" });
        return;
      }
      const digitalStamp = `#0x${Math.floor(Math.random() * 4294967295).toString(16).toUpperCase()}`;
      res.json({
        success: true,
        prescriptionId,
        decision,
        reviewedBy: req.user?.id,
        pharmacistLicenseNo: licenseNo || "UP-2021-00921",
        digitalStampHash: digitalStamp,
        auditTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
        message: "Prescription review recorded in immutable compliance log."
      });
    }
  );
  const DELIVERY_TASKS_STORE = /* @__PURE__ */ new Map([
    [
      "del-701",
      {
        id: "del-701",
        orderId: "ord-9041",
        orderNumber: "AS-2026-9041",
        serviceLevel: "express",
        assignmentType: "shared_network",
        claimedByRiderId: "u-rider-303",
        claimedByRiderName: "Vikram Singh (EV Scooter)",
        status: "out_for_delivery",
        requiresColdChain: true,
        currentTemperature: 4.2,
        temperaturesLog: [
          { temp: 3.8, time: "10:30 AM" },
          { temp: 4, time: "10:35 AM" },
          { temp: 4.2, time: "10:40 AM" }
        ],
        tamperSealVerified: true,
        deliveryOtp: "4821",
        pickups: [
          {
            pharmacyName: "MedPlus Chemist & Druggist",
            address: "Shop 12, Aditya Mega City, Vaibhav Khand, Indirapuram",
            phone: "+91 98110 23456",
            items: "2x Lantus SoloStar 100IU/ml (Cold Pouch), 30x Glycomet-SR 500mg",
            pickedUp: true
          }
        ],
        dropoff: {
          customerName: "Aarav Sharma",
          address: "Tower 4, Flat 702, Orange County, Ahinsa Khand 1",
          phone: "+91 98765 43210",
          instructions: "Elder patient at home. Please ring doorbell."
        },
        payout: 95,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ],
    [
      "del-702",
      {
        id: "del-702",
        orderId: "ord-8812",
        orderNumber: "AS-2026-8812",
        serviceLevel: "standard",
        assignmentType: "shared_network",
        status: "available",
        requiresColdChain: false,
        currentTemperature: 24.5,
        temperaturesLog: [],
        tamperSealVerified: false,
        deliveryOtp: "9014",
        pickups: [
          {
            pharmacyName: "Apollo Pharmacy 24x7",
            address: "G-4, Windsor Park Commercial Arcade, Indirapuram",
            phone: "+91 98221 88990",
            items: "1x Dolo 650mg, 1x Augmentin 625 Duo, 1x ORS Electrolyte Drink",
            pickedUp: false
          }
        ],
        dropoff: {
          customerName: "Pooja Verma",
          address: "B-204, Shipra Krishna Vista, Ahinsa Khand 1",
          phone: "+91 99100 55432",
          instructions: "Leave at security guard if not answering."
        },
        payout: 45,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ],
    [
      "del-703",
      {
        id: "del-703",
        orderId: "ord-9150",
        orderNumber: "AS-2026-9150",
        serviceLevel: "express",
        assignmentType: "shared_network",
        status: "available",
        requiresColdChain: true,
        currentTemperature: 3.5,
        temperaturesLog: [{ temp: 3.5, time: "10:42 AM" }],
        tamperSealVerified: false,
        deliveryOtp: "6612",
        pickups: [
          {
            pharmacyName: "Sanjivani Medicos (Multi-Stop Pick 1)",
            address: "Shop 4, Sector 4 Market, Vaishali",
            phone: "+91 98102 33441",
            items: "1x Humalog KwikPen Insulin (Cold Insulated)",
            pickedUp: false
          },
          {
            pharmacyName: "Apollo Pharmacy (Multi-Stop Pick 2)",
            address: "G-4, Windsor Park Arcade, Indirapuram",
            phone: "+91 98221 88990",
            items: "100x Glucometer Test Strips",
            pickedUp: false
          }
        ],
        dropoff: {
          customerName: "Rohan Kapoor",
          address: "Villa 14, ATS Advantage, Ahinsa Khand 1",
          phone: "+91 98100 11223",
          instructions: "Multi-pickup order: deliver together in single batch."
        },
        payout: 130,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]
  ]);
  app2.get(
    "/api/rider/available-tasks",
    authenticatedUserRateLimiter,
    requireRole(["rider", "admin"]),
    (_req, res) => {
      const tasks = Array.from(DELIVERY_TASKS_STORE.values());
      res.json({
        success: true,
        tasks
      });
    }
  );
  app2.post(
    "/api/rider/claim-task",
    authenticatedUserRateLimiter,
    requireRole(["rider"]),
    (req, res) => {
      const { taskId } = req.body;
      if (!taskId) {
        res.status(400).json({ error: "Missing taskId" });
        return;
      }
      const task = DELIVERY_TASKS_STORE.get(taskId);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      if (task.status !== "available" && task.claimedByRiderId !== req.user?.id) {
        res.status(409).json({
          error: "Task already claimed",
          message: `This delivery was just locked and claimed by rider ${task.claimedByRiderName || "another partner"}. Refresh task feed.`
        });
        return;
      }
      task.claimedByRiderId = req.user?.id;
      task.claimedByRiderName = req.user?.email || "Assigned Courier";
      task.status = "assigned";
      res.json({
        success: true,
        assignment: {
          taskId: task.id,
          orderId: task.orderId,
          orderNumber: task.orderNumber,
          riderId: req.user?.id,
          status: task.status,
          claimedAt: (/* @__PURE__ */ new Date()).toISOString(),
          coldChainRequired: task.requiresColdChain,
          coldTempTarget: "2\xB0C - 8\xB0C"
        }
      });
    }
  );
  app2.post(
    "/api/rider/update-status",
    authenticatedUserRateLimiter,
    requireRole(["rider", "pharmacy"]),
    (req, res) => {
      const { taskId, status, currentTemperature, tamperSealVerified } = req.body;
      const task = DELIVERY_TASKS_STORE.get(taskId);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      if (status) task.status = status;
      if (typeof tamperSealVerified === "boolean") task.tamperSealVerified = tamperSealVerified;
      if (typeof currentTemperature === "number") {
        task.currentTemperature = currentTemperature;
        task.temperaturesLog.push({
          temp: currentTemperature,
          time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        });
      }
      res.json({
        success: true,
        task,
        message: `Delivery status transitioned to ${task.status}`
      });
    }
  );
  app2.post(
    "/api/rider/verify-delivery-otp",
    authenticatedUserRateLimiter,
    requireRole(["rider"]),
    (req, res) => {
      const { taskId, enteredOtp } = req.body;
      const task = DELIVERY_TASKS_STORE.get(taskId);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      if (enteredOtp !== task.deliveryOtp) {
        res.status(401).json({
          error: "Invalid delivery OTP",
          message: "The customer OTP entered does not match our encrypted handover record."
        });
        return;
      }
      task.status = "delivered";
      res.json({
        success: true,
        orderNumber: task.orderNumber,
        payout: task.payout,
        deliveredAt: (/* @__PURE__ */ new Date()).toISOString(),
        message: `Order ${task.orderNumber} successfully delivered! \u20B9${task.payout} credited to rider earnings.`
      });
    }
  );
  app2.get("/api/delivery/tracking/:orderId", publicRateLimiter, (req, res) => {
    const { orderId } = req.params;
    const task = Array.from(DELIVERY_TASKS_STORE.values()).find(
      (t) => t.orderId === orderId || t.orderNumber === orderId || t.id === orderId
    ) || Array.from(DELIVERY_TASKS_STORE.values())[0];
    res.json({
      success: true,
      tracking: {
        orderId: task.orderId,
        orderNumber: task.orderNumber,
        status: task.status,
        serviceLevel: task.serviceLevel,
        assignmentType: task.assignmentType,
        riderName: task.claimedByRiderName || "Assigned Fleet Partner",
        riderPhone: "+91 98765 99887",
        vehicleNo: "UP-14-EV-4412",
        requiresColdChain: task.requiresColdChain,
        currentTemperature: task.currentTemperature,
        temperaturesLog: task.temperaturesLog,
        tamperSealVerified: task.tamperSealVerified,
        deliveryOtp: task.deliveryOtp,
        pickups: task.pickups,
        dropoff: task.dropoff,
        estimatedDeliveryMinutes: task.serviceLevel === "express" ? 18 : 65
      }
    });
  });
  app2.post(
    "/api/admin/verify-pharmacy",
    authenticatedUserRateLimiter,
    requireRole(["admin"]),
    (req, res) => {
      const parseResult = AdminPharmacyVerifySchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: "Invalid input schema",
          details: parseResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
        return;
      }
      res.json({
        success: true,
        pharmacyId: parseResult.data.pharmacyId,
        newStatus: parseResult.data.verificationStatus,
        auditedByAdminId: req.user?.id,
        auditTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
        message: `Pharmacy status updated to ${parseResult.data.verificationStatus.toUpperCase()}`
      });
    }
  );
  app2.get(
    "/api/admin/metrics",
    authenticatedUserRateLimiter,
    requireRole(["admin"]),
    (_req, res) => {
      res.json({
        success: true,
        metrics: {
          activePharmacies: 18,
          pendingAudits: 2,
          activeRiders: 34,
          todaysGMV: 48500,
          platformCommissionEarned: 2425,
          coldChainComplianceRate: "99.8%",
          disputeResolutionRate: "99.4%"
        }
      });
    }
  );
  app2.post("/api/pharmacy/register", authRateLimiter, (req, res) => {
    const parseResult = PharmacyRegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
      return;
    }
    res.json({
      success: true,
      store: {
        id: `p-${Date.now()}`,
        ...parseResult.data,
        rating: "5.0 \u2605",
        verificationStatus: "pending",
        verificationNotice: "Awaiting administrative credential verification before dispatch eligibility."
      }
    });
  });
  app2.post("/api/calculator/revenue", authenticatedUserRateLimiter, (req, res) => {
    const parseResult = RevenueCalculatorSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
      return;
    }
    const { monthlyOrders, avgOrderValue, riderCommission } = parseResult.data;
    const totalGMV = monthlyOrders * avgOrderValue;
    const platformFacilitationCut = monthlyOrders * 15;
    const grossMargin = totalGMV * 0.15 + platformFacilitationCut;
    const riderCost = monthlyOrders * (avgOrderValue * (riderCommission / 100));
    const netProfit = grossMargin - riderCost;
    res.json({
      success: true,
      calculations: {
        totalGMV,
        platformFacilitationCut,
        grossMargin,
        riderCost,
        netProfit,
        isProfitable: netProfit > 0
      }
    });
  });
}

// server/app.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
function createApp() {
  const app2 = express();
  app2.set("trust proxy", 1);
  app2.disable("x-powered-by");
  app2.use((req, res, next) => {
    const pathLower = req.path.toLowerCase();
    if (pathLower.startsWith("/api")) {
      return next();
    }
    const sensitivePatterns = [
      "/.env",
      "/.git",
      "/schema.sql",
      "/package.json",
      "/tsconfig",
      "/server/",
      "/node_modules",
      ".ts",
      ".tsx",
      ".map",
      "webpack",
      ".yaml",
      ".yml",
      ".config."
    ];
    const isSensitive = sensitivePatterns.some((pattern) => pathLower.includes(pattern));
    if (isSensitive) {
      return res.status(404).send("Not Found");
    }
    next();
  });
  app2.use((req, res, next) => {
    const isProduction = process.env.NODE_ENV === "production" || process.env.FORCE_HTTPS === "true";
    const forwardedProto = req.headers["x-forwarded-proto"];
    let cfVisitorScheme = null;
    try {
      if (req.headers["cf-visitor"]) {
        const parsed = JSON.parse(req.headers["cf-visitor"]);
        cfVisitorScheme = parsed.scheme;
      }
    } catch {
    }
    const isHttp = forwardedProto === "http" || cfVisitorScheme === "http" || !req.secure && isProduction && forwardedProto !== "https";
    if (isHttp && isProduction) {
      const host = req.headers.host || req.hostname;
      return res.redirect(301, `https://${host}${req.originalUrl}`);
    }
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
    res.setHeader("Content-Security-Policy", "upgrade-insecure-requests");
    next();
  });
  app2.use(express.json({ limit: "2mb" }));
  app2.use(express.urlencoded({ extended: false, limit: "2mb" }));
  registerRoutes(app2);
  const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public");
  app2.use(
    express.static(staticPath, {
      dotfiles: "ignore",
      index: "index.html",
      fallthrough: true,
      maxAge: process.env.NODE_ENV === "production" ? "1d" : 0
    })
  );
  app2.use((err, _req, res, _next) => {
    console.error("[ArogyaSwift Internal Error]", err?.message || err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      error: status === 500 ? "Internal Server Error" : err.message || "Request could not be processed",
      code: err.code || "REQUEST_FAILED",
      ref: `err_${Date.now().toString(36)}`
    });
  });
  return app2;
}
var app = createApp();

// api/index.ts
function handler(req, res) {
  return app(req, res);
}
export {
  handler as default
};
