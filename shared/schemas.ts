import { z } from "zod";

/**
 * ArogyaSwift: Strict Input Validation Schemas
 * Rejects invalid types, out-of-range lengths, or unexpected formats.
 */

export const UserRoleSchema = z.enum(["customer", "patient", "pharmacy", "rider", "admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Custom Login Form Schema
export const AuthCustomLoginSchema = z.object({
  customName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s.\-']+$/, "Full name contains invalid characters"),
  customEmail: z
    .string()
    .trim()
    .email("Invalid email format")
    .max(255, "Email address cannot exceed 255 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),
  selectedRole: UserRoleSchema,
});

// Phone Sign Up Details Schema
export const PhoneSignupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s.\-']+$/, "Full name contains invalid characters"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  role: z.enum(["customer", "patient", "rider"]),
  email: z
    .string()
    .trim()
    .email("Invalid email address format")
    .max(255, "Email cannot exceed 255 characters")
    .optional()
    .or(z.literal("")),
  locationPin: z
    .string()
    .trim()
    .max(250, "Location address cannot exceed 250 characters")
    .optional(),
  vehicleType: z
    .string()
    .trim()
    .max(100, "Vehicle type cannot exceed 100 characters")
    .optional(),
  drivingLicense: z
    .string()
    .trim()
    .max(50, "Driver license ID cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9-]*$/, "Driver license ID contains invalid characters")
    .optional(),
});

// OTP Verification Schema
export const VerifyOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  enteredOtp: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "OTP code must be exactly 4 digits"),
});

// Pharmacy Registration Schema
export const PharmacyRegisterSchema = z.object({
  ownerName: z
    .string()
    .trim()
    .min(2, "Owner name must be at least 2 characters")
    .max(100, "Owner name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s.\-']+$/, "Owner name contains invalid characters"),
  shopName: z
    .string()
    .trim()
    .min(2, "Pharmacy shop title must be at least 2 characters")
    .max(100, "Pharmacy shop title cannot exceed 100 characters"),
  licenseNo: z
    .string()
    .trim()
    .min(5, "License number must be at least 5 characters")
    .max(30, "License number cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9-]+$/, "License number must contain only letters, digits, and hyphens"),
  category: z
    .string()
    .trim()
    .min(3, "Category must be selected")
    .max(100, "Category exceeds maximum length"),
  address: z
    .string()
    .trim()
    .min(5, "Shop address must be at least 5 characters")
    .max(300, "Shop address cannot exceed 300 characters"),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, "").slice(-10))
    .refine((val) => val.length === 10, { message: "Phone number must contain 10 valid digits" }),
  email: z
    .string()
    .trim()
    .email("Invalid email address format")
    .max(255, "Email cannot exceed 255 characters"),
  coldChainReady: z.boolean(),
});

// Prescription Upload & Private Consent Schema
export const PrescriptionUploadSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, "Patient name must be at least 2 characters")
    .max(100, "Patient name cannot exceed 100 characters"),
  patientPhone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  privacyConsentGranted: z.boolean().refine((val) => val === true, {
    message: "Explicit customer privacy consent is required before prescription upload.",
  }),
  prescriptionNotes: z
    .string()
    .trim()
    .max(1000, "Prescription notes cannot exceed 1000 characters")
    .optional(),
});

// Customer Medicine Request Creation Schema
export const CustomerMedicineRequestSchema = z.object({
  deliveryLocation: z.string().trim().min(3, "Delivery location is required"),
  zone: z.string().trim().min(2, "Zone is required"),
  serviceLevel: z.enum(["standard", "express"]),
  requestedMedicines: z
    .array(
      z.object({
        name: z.string().min(1, "Medicine name is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one medicine must be requested"),
  notes: z.string().max(500).optional(),
});

// Pharmacy Quotation Submission Schema
export const PharmacyQuotationSubmitSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  quotedItems: z.array(
    z.object({
      medicineName: z.string(),
      quantity: z.number().int().min(1),
      unitPrice: z.number().min(0),
      isGeneric: z.boolean().default(false),
      isAvailable: z.boolean().default(true),
    })
  ),
  medicinesTotal: z.number().min(0, "Total must be positive"),
  estimatedDeliveryMins: z.number().int().min(10).max(180),
  stockConfirmed: z.boolean(),
});

// Administrator Pharmacy Verification Schema
export const AdminPharmacyVerifySchema = z.object({
  pharmacyId: z.string().min(1, "Pharmacy ID is required"),
  verificationStatus: z.enum(["verified", "rejected", "suspended"]),
  rejectionReason: z.string().max(500).optional(),
  licenseExpiryDate: z.string().optional(),
});

// Delivery Assignment Schema (Own vs Shared Network)
export const DeliveryTaskAssignSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  assignmentType: z.enum(["pharmacy_own", "shared_network"]),
  riderId: z.string().optional(),
  requiresColdChain: z.boolean().default(false),
});

// Delivery Status Transition Schema
export const DeliveryStatusUpdateSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum(["assigned", "arrived_at_pharmacy", "picked_up", "out_for_delivery", "delivered"]),
  tamperSealVerified: z.boolean().default(true),
  currentTemperature: z.number().optional(),
  notes: z.string().max(500).optional(),
});

// Delivery OTP Verification Schema
export const DeliveryOtpVerifySchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
  enteredOtp: z.string().length(4, "OTP must be exactly 4 digits"),
});

// Revenue Calculator Schema
export const RevenueCalculatorSchema = z.object({
  monthlyOrders: z
    .number()
    .int("Monthly orders must be a whole number")
    .min(1, "Monthly orders must be at least 1")
    .max(1000000, "Monthly orders cannot exceed 1,000,000"),
  avgOrderValue: z
    .number()
    .min(1, "Average order value must be at least ₹1")
    .max(100000, "Average order value cannot exceed ₹100,000"),
  riderCommission: z
    .number()
    .min(0, "Commission percentage cannot be negative")
    .max(100, "Commission percentage cannot exceed 100%"),
});

export type AuthCustomLoginInput = z.infer<typeof AuthCustomLoginSchema>;
export type PhoneSignupInput = z.infer<typeof PhoneSignupSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type PharmacyRegisterInput = z.infer<typeof PharmacyRegisterSchema>;
export type PrescriptionUploadInput = z.infer<typeof PrescriptionUploadSchema>;
export type CustomerMedicineRequestInput = z.infer<typeof CustomerMedicineRequestSchema>;
export type PharmacyQuotationSubmitInput = z.infer<typeof PharmacyQuotationSubmitSchema>;
export type AdminPharmacyVerifyInput = z.infer<typeof AdminPharmacyVerifySchema>;
export type DeliveryTaskAssignInput = z.infer<typeof DeliveryTaskAssignSchema>;
export type RevenueCalculatorInput = z.infer<typeof RevenueCalculatorSchema>;
