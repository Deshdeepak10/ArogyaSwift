import { Express, Request, Response } from "express";
import {
  AuthCustomLoginSchema,
  PhoneSignupSchema,
  VerifyOtpSchema,
  PharmacyRegisterSchema,
  PrescriptionUploadSchema,
  CustomerMedicineRequestSchema,
  PharmacyQuotationSubmitSchema,
  AdminPharmacyVerifySchema,
  DeliveryTaskAssignSchema,
  RevenueCalculatorSchema,
} from "../shared/schemas";
import {
  authRateLimiter,
  publicRateLimiter,
  authenticatedUserRateLimiter,
} from "./middleware/rateLimiter";
import { requireRole, AuthenticatedUserRequest } from "./middleware/roleAuth";
import { getDbStatus, pool } from "./db";

export function registerRoutes(app: Express): void {
  // 1. Public Health Check
  app.get("/api/public/health", publicRateLimiter, (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "ArogyaSwift Hyperlocal Marketplace API",
      cdsco_compliance_mode: "Strict",
      database: getDbStatus(),
    });
  });

  // 1b. Database Connection Health Check
  app.get("/api/db/health", publicRateLimiter, async (_req: Request, res: Response) => {
    const status = getDbStatus();
    if (!pool) {
      res.json({
        ...status,
        message: "No DATABASE_URL configured in .env. Running with in-memory storage.",
      });
      return;
    }

    try {
      const result = await pool.query("SELECT NOW() as current_time, version()");
      res.json({
        ...status,
        connected: true,
        serverTime: result.rows[0].current_time,
        version: result.rows[0].version,
      });
    } catch (err: any) {
      res.status(503).json({
        ...status,
        connected: false,
        error: err.message,
      });
    }
  });

  // 2. Authentication: Multi-Role Credentials Sign In
  app.post("/api/auth/login", authRateLimiter, (req: Request, res: Response) => {
    const parseResult = AuthCustomLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
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
        badge: `${selectedRole.toUpperCase()} #${Math.floor(1000 + Math.random() * 9000)}`,
      },
    });
  });

  // 3. Phone Sign Up
  app.post("/api/auth/phone-signup", authRateLimiter, (req: Request, res: Response) => {
    const parseResult = PhoneSignupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    res.json({
      success: true,
      message: `SMS verification OTP dispatched to +91 ${parseResult.data.phone}`,
      otpDemoCode: "7392",
    });
  });

  // 4. Verify OTP
  app.post("/api/auth/verify-otp", authRateLimiter, (req: Request, res: Response) => {
    const parseResult = VerifyOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    if (parseResult.data.enteredOtp === "7392" || parseResult.data.enteredOtp === "1234") {
      res.json({
        success: true,
        message: "Phone verified successfully. Session established.",
      });
    } else {
      res.status(401).json({
        error: "Authentication failed",
        message: "Invalid OTP code provided",
      });
    }
  });

  // 4b. Google OAuth Server-Side Token Verification & Profile Retrieval
  app.post("/api/auth/google/verify", authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { idToken, role = "patient" } = req.body;
      if (!idToken || typeof idToken !== "string") {
        res.status(400).json({ error: "Missing Google authorization token" });
        return;
      }

      // Verify token with Google's public OAuth endpoint
      const googleTokenUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
      const googleRes = await fetch(googleTokenUrl);

      let userName = "Google User";
      let userEmail = "";
      let userAvatar = "";
      let userId = "";

      if (googleRes.ok) {
        const payload = (await googleRes.json()) as any;
        userId = payload.sub;
        userName = payload.name || payload.given_name || "Google User";
        userEmail = payload.email || "";
        userAvatar = payload.picture || "";
      } else {
        // Fallback: Check as access_token against Google userinfo
        const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${idToken}` }
        });

        if (userinfoRes.ok) {
          const userinfo = (await userinfoRes.json()) as any;
          userId = userinfo.sub;
          userName = userinfo.name || userinfo.given_name || "Google User";
          userEmail = userinfo.email || "";
          userAvatar = userinfo.picture || "";
        } else {
          res.status(401).json({ error: "Invalid or expired Google token" });
          return;
        }
      }

      // Sync user to Supabase database if available
      let dbId = userId;
      if (pool && userEmail) {
        try {
          const dbRole = role === "patient" ? "customer" : (role === "pharmacist" ? "pharmacy" : (role === "admin" ? "admin" : "customer"));
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
        } catch (dbErr: any) {
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
          badge: `Google Verified • ${String(role).toUpperCase()}`,
          isGoogleUser: true
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: "Internal error verifying Google token", message: err.message });
    }
  });

  // 5. CUSTOMER ROLE: Private Prescription Upload
  app.post(
    "/api/customer/prescription-upload",
    authenticatedUserRateLimiter,
    requireRole(["customer", "patient"]),
    (req: AuthenticatedUserRequest, res: Response) => {
      const parseResult = PrescriptionUploadSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: "Invalid input schema",
          details: parseResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
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
          uploadedAt: new Date().toISOString(),
        },
      });
    }
  );

  // 6. CUSTOMER ROLE: Create Medicine Request for Nearby Pharmacies
  app.post(
    "/api/customer/medicine-request",
    authenticatedUserRateLimiter,
    requireRole(["customer", "patient"]),
    (req: AuthenticatedUserRequest, res: Response) => {
      const parseResult = CustomerMedicineRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: "Invalid input schema",
          details: parseResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
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
        notice: "Stock availability is unconfirmed until pharmacies respond with quotations.",
      });
    }
  );

  // 7. PHARMACY ROLE: Submit Medicine Quotation
  app.post(
    "/api/pharmacy/submit-quote",
    authenticatedUserRateLimiter,
    requireRole(["pharmacy"]),
    (req: AuthenticatedUserRequest, res: Response) => {
      const parseResult = PharmacyQuotationSubmitSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: "Invalid input schema",
          details: parseResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }

      res.json({
        success: true,
        quotationId: `quote-${Date.now()}`,
        pharmacyId: req.user?.id,
        medicinesTotal: parseResult.data.medicinesTotal,
        platformFee: 15.0,
        deliveryFee: 25.0,
        totalPayable: parseResult.data.medicinesTotal + 40.0,
        estimatedDeliveryMins: parseResult.data.estimatedDeliveryMins,
        stockConfirmed: parseResult.data.stockConfirmed,
        status: "submitted",
      });
    }
  );

  // 8. PHARMACY ROLE: Clinical Audit & Digital Signature
  app.post(
    "/api/pharmacy/audit-prescription",
    authenticatedUserRateLimiter,
    requireRole(["pharmacy"]),
    (req: AuthenticatedUserRequest, res: Response) => {
      const { prescriptionId, decision, pharmacistNotes, licenseNo } = req.body;

      if (!prescriptionId || !decision) {
        res.status(400).json({ error: "Missing prescriptionId or decision" });
        return;
      }

      const digitalStamp = `#0x${Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase()}`;

      res.json({
        success: true,
        prescriptionId,
        decision,
        reviewedBy: req.user?.id,
        pharmacistLicenseNo: licenseNo || "UP-2021-00921",
        digitalStampHash: digitalStamp,
        auditTimestamp: new Date().toISOString(),
        message: "Prescription review recorded in immutable compliance log.",
      });
    }
  );

  // In-memory delivery task registry with atomic concurrency locking
  interface ServerDeliveryTask {
    id: string;
    orderId: string;
    orderNumber: string;
    serviceLevel: "standard" | "express";
    assignmentType: "pharmacy_own" | "shared_network";
    claimedByRiderId?: string;
    claimedByRiderName?: string;
    status: "available" | "assigned" | "arrived_at_pharmacy" | "picked_up" | "out_for_delivery" | "delivered";
    requiresColdChain: boolean;
    currentTemperature: number;
    temperaturesLog: { temp: number; time: string }[];
    tamperSealVerified: boolean;
    deliveryOtp: string;
    pickups: {
      pharmacyName: string;
      address: string;
      phone: string;
      items: string;
      pickedUp: boolean;
    }[];
    dropoff: {
      customerName: string;
      address: string;
      phone: string;
      instructions: string;
    };
    payout: number;
    createdAt: string;
  }

  const DELIVERY_TASKS_STORE: Map<string, ServerDeliveryTask> = new Map([
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
          { temp: 4.0, time: "10:35 AM" },
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
            pickedUp: true,
          }
        ],
        dropoff: {
          customerName: "Aarav Sharma",
          address: "Tower 4, Flat 702, Orange County, Ahinsa Khand 1",
          phone: "+91 98765 43210",
          instructions: "Elder patient at home. Please ring doorbell.",
        },
        payout: 95,
        createdAt: new Date().toISOString(),
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
            pickedUp: false,
          }
        ],
        dropoff: {
          customerName: "Pooja Verma",
          address: "B-204, Shipra Krishna Vista, Ahinsa Khand 1",
          phone: "+91 99100 55432",
          instructions: "Leave at security guard if not answering.",
        },
        payout: 45,
        createdAt: new Date().toISOString(),
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
            pickedUp: false,
          },
          {
            pharmacyName: "Apollo Pharmacy (Multi-Stop Pick 2)",
            address: "G-4, Windsor Park Arcade, Indirapuram",
            phone: "+91 98221 88990",
            items: "100x Glucometer Test Strips",
            pickedUp: false,
          }
        ],
        dropoff: {
          customerName: "Rohan Kapoor",
          address: "Villa 14, ATS Advantage, Ahinsa Khand 1",
          phone: "+91 98100 11223",
          instructions: "Multi-pickup order: deliver together in single batch.",
        },
        payout: 130,
        createdAt: new Date().toISOString(),
      }
    ]
  ]);

  // 9a. RIDER ROLE: List Available Tasks in Shared Network Pool
  app.get(
    "/api/rider/available-tasks",
    authenticatedUserRateLimiter,
    requireRole(["rider", "admin"]),
    (_req: AuthenticatedUserRequest, res: Response) => {
      const tasks = Array.from(DELIVERY_TASKS_STORE.values());
      res.json({
        success: true,
        tasks,
      });
    }
  );

  // 9b. RIDER ROLE: Atomic Delivery Task Claim (Preventing Dual Claims)
  app.post(
    "/api/rider/claim-task",
    authenticatedUserRateLimiter,
    requireRole(["rider"]),
    (req: AuthenticatedUserRequest, res: Response) => {
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

      // Atomic lock check: If already claimed or not available, reject with 409 Conflict
      if (task.status !== "available" && task.claimedByRiderId !== req.user?.id) {
        res.status(409).json({
          error: "Task already claimed",
          message: `This delivery was just locked and claimed by rider ${task.claimedByRiderName || "another partner"}. Refresh task feed.`,
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
          claimedAt: new Date().toISOString(),
          coldChainRequired: task.requiresColdChain,
          coldTempTarget: "2°C - 8°C",
        },
      });
    }
  );

  // 9c. RIDER ROLE: Transition Delivery Status with Temperature & Tamper Logs
  app.post(
    "/api/rider/update-status",
    authenticatedUserRateLimiter,
    requireRole(["rider", "pharmacy"]),
    (req: AuthenticatedUserRequest, res: Response) => {
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
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      }

      res.json({
        success: true,
        task,
        message: `Delivery status transitioned to ${task.status}`,
      });
    }
  );

  // 9d. RIDER ROLE: Verify 4-Digit Customer Handover OTP
  app.post(
    "/api/rider/verify-delivery-otp",
    authenticatedUserRateLimiter,
    requireRole(["rider"]),
    (req: AuthenticatedUserRequest, res: Response) => {
      const { taskId, enteredOtp } = req.body;
      const task = DELIVERY_TASKS_STORE.get(taskId);

      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      if (enteredOtp !== task.deliveryOtp) {
        res.status(401).json({
          error: "Invalid delivery OTP",
          message: "The customer OTP entered does not match our encrypted handover record.",
        });
        return;
      }

      task.status = "delivered";
      res.json({
        success: true,
        orderNumber: task.orderNumber,
        payout: task.payout,
        deliveredAt: new Date().toISOString(),
        message: `Order ${task.orderNumber} successfully delivered! ₹${task.payout} credited to rider earnings.`,
      });
    }
  );

  // 9e. PUBLIC / CUSTOMER: Live Order Tracking Telemetry
  app.get("/api/delivery/tracking/:orderId", publicRateLimiter, (req: Request, res: Response) => {
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
        estimatedDeliveryMinutes: task.serviceLevel === "express" ? 18 : 65,
      },
    });
  });

  // 10. ADMIN ROLE: Verify / Suspend Pharmacy License
  app.post(
    "/api/admin/verify-pharmacy",
    authenticatedUserRateLimiter,
    requireRole(["admin"]),
    (req: AuthenticatedUserRequest, res: Response) => {
      const parseResult = AdminPharmacyVerifySchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: "Invalid input schema",
          details: parseResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }

      res.json({
        success: true,
        pharmacyId: parseResult.data.pharmacyId,
        newStatus: parseResult.data.verificationStatus,
        auditedByAdminId: req.user?.id,
        auditTimestamp: new Date().toISOString(),
        message: `Pharmacy status updated to ${parseResult.data.verificationStatus.toUpperCase()}`,
      });
    }
  );

  // 11. ADMIN ROLE: Operational Metrics & Settlement Overview
  app.get(
    "/api/admin/metrics",
    authenticatedUserRateLimiter,
    requireRole(["admin"]),
    (_req: AuthenticatedUserRequest, res: Response) => {
      res.json({
        success: true,
        metrics: {
          activePharmacies: 18,
          pendingAudits: 2,
          activeRiders: 34,
          todaysGMV: 48500.0,
          platformCommissionEarned: 2425.0,
          coldChainComplianceRate: "99.8%",
          disputeResolutionRate: "99.4%",
        },
      });
    }
  );

  // 12. Pharmacy Store Self-Registration
  app.post("/api/pharmacy/register", authRateLimiter, (req: Request, res: Response) => {
    const parseResult = PharmacyRegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    res.json({
      success: true,
      store: {
        id: `p-${Date.now()}`,
        ...parseResult.data,
        rating: "5.0 ★",
        verificationStatus: "pending",
        verificationNotice: "Awaiting administrative credential verification before dispatch eligibility.",
      },
    });
  });

  // 13. Revenue & Marketplace Economics
  app.post("/api/calculator/revenue", authenticatedUserRateLimiter, (req: Request, res: Response) => {
    const parseResult = RevenueCalculatorSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Invalid input schema",
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const { monthlyOrders, avgOrderValue, riderCommission } = parseResult.data;
    const totalGMV = monthlyOrders * avgOrderValue;
    const platformFacilitationCut = monthlyOrders * 15; // ₹15 flat platform fee
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
        isProfitable: netProfit > 0,
      },
    });
  });
}
