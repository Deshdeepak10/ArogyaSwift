import { useState, useEffect } from "react";
import { LovableHeader } from "@/components/LovableHeader";
import { LovableFooter } from "@/components/LovableFooter";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import { SpamShield } from "@/components/SpamShield";
import { trackEvent } from "@/lib/analytics";
import Tesseract from "tesseract.js";
import {
  Upload,
  Plus,
  Trash2,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
  Store,
  Bike,
  KeyRound,
  PhoneCall,
  AlertCircle,
  Eye,
  X,
  Sparkles,
  ZoomIn,
  RefreshCw,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface MedicineRow {
  id: string;
  name: string;
  quantity: string;
}

// Helper to strip any redundant +91 or non-digits, keeping only clean 10 mobile digits
const cleanTo10Digits = (val?: string) => {
  if (!val) return "";
  let digits = val.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  return digits.slice(0, 10);
};

export default function CustomerPortal() {
  const { user, isAuthenticated, setIsPhoneSignupModalOpen, setPhoneSignupRole } = useAuth();
  const { orders, createPatientRequest } = useOrders();

  const [activeTab, setActiveTab] = useState<"new_request" | "my_orders">("new_request");

  // Form State
  const [fullName, setFullName] = useState(user?.name || "Asha Rao");
  const [mobile, setMobile] = useState(() => cleanTo10Digits(user?.phone) || "9845012345");
  const [address, setAddress] = useState("124, 4th Cross, Defence Colony");
  const [area, setArea] = useState("Indiranagar, Bengaluru");
  const [isUrgent, setIsUrgent] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<string | null>(null);
  const [prescriptionPreviewUrl, setPrescriptionPreviewUrl] = useState<string | null>(null);
  const [prescriptionFileSize, setPrescriptionFileSize] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrProgressText, setOcrProgressText] = useState("");

  // Sync state if user changes
  useEffect(() => {
    if (user?.phone) {
      setMobile(cleanTo10Digits(user.phone));
    }
    if (user?.name) {
      setFullName(user.name);
    }
  }, [user?.phone, user?.name]);

  // Anti-Spam Honeypot & Debounce State
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Medicines List: default initialized with demo items when no prescription is uploaded
  const [medicines, setMedicines] = useState<MedicineRow[]>([
    { id: "1", name: "Paracetamol 650mg (Dolo 650)", quantity: "1 strip (15 tablets)" },
    { id: "2", name: "Azithromycin 500mg (Azithral)", quantity: "1 strip (5 tablets)" }
  ]);

  const handleAddMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", quantity: "1 strip" }
    ]);
  };

  const handleRemoveMedicine = (id: string) => {
    // If a prescription is uploaded, user can delete all medicines down to 0
    if (medicines.length <= 1 && !prescriptionFile) {
      toast.error("Please keep at least one medicine item or upload a prescription.");
      return;
    }
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMedicineChange = (id: string, field: "name" | "quantity", value: string) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = (file.size / 1024).toFixed(1);
    const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKb} KB`;
    setPrescriptionFileSize(sizeStr);
    setPrescriptionFile(file.name);

    // Read real image preview data URL
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const url = uploadEvent.target?.result as string;
      setPrescriptionPreviewUrl(url);
    };
    reader.readAsDataURL(file);

    // Requirement: medicine list should be empty if prescription is already uploaded
    setMedicines([]);
    toast.success(`Prescription attached (${file.name}). Medicine list cleared for pharmacist verification.`);
  };

  const handleRemovePrescription = () => {
    setPrescriptionFile(null);
    setPrescriptionPreviewUrl(null);
    setPrescriptionFileSize(null);
    if (medicines.length === 0) {
      setMedicines([
        { id: "1", name: "Paracetamol 650mg (Dolo 650)", quantity: "1 strip (15 tablets)" }
      ]);
    }
    toast.info("Prescription removed. You can enter medicine names manually.");
  };

  const handleExtractMedicinesFromRx = async () => {
    if (!prescriptionPreviewUrl && !prescriptionFile) {
      toast.error("Please upload a prescription image first.");
      return;
    }

    if (!prescriptionPreviewUrl) {
      toast.error("Prescription preview is not ready. Please re-select the image.");
      return;
    }

    setIsOcrScanning(true);
    setOcrProgressText("Scanning prescription text with OCR...");

    try {
      // Run real OCR on the uploaded image using Tesseract WebWorker
      const result = await Tesseract.recognize(prescriptionPreviewUrl, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const pct = Math.round((m.progress || 0) * 100);
            setOcrProgressText(`Reading prescription text (${pct}%)...`);
          } else if (m.status === "loading tesseract core") {
            setOcrProgressText("Loading OCR recognition engine...");
          } else if (m.status === "loading language traineddata") {
            setOcrProgressText("Loading language models...");
          }
        }
      });

      const extractedRawText = result?.data?.text || "";

      // Parse non-empty text lines from the actual scanned image
      const rawLines = extractedRawText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length >= 2);

      const noisePatterns = [
        /^(dr\.?|doctor|hospital|clinic|centre|center|consultant|department)/i,
        /^(reg|regn|license|phone|tel|email|date|time|age|gender|sex|patient|name|address|rx|opd|ipd)/i,
        /^[0-9\s/:\-]+$/,
        /^(mbbs|md|ms|bams|bhms|dnb|frcs|pharma|signature)/i,
        /^(signature\.jpg|signature\.png)/i
      ];

      const detectedRows: MedicineRow[] = [];

      for (const line of rawLines) {
        // Strip leading numbering or bullet points
        const cleanLine = line.replace(/^[\d+•\-\*\.)\s]+/, "").trim();
        if (cleanLine.length < 3) continue;

        const isNoise = noisePatterns.some((pattern) => pattern.test(cleanLine));
        if (isNoise) continue;

        // Detect quantity / frequency pattern if present
        let medName = cleanLine;
        let medQty = "1 strip";

        const qtyMatch = cleanLine.match(/(\d+\s*(?:tabs?|tablets?|caps?|capsules?|strips?|bottles?|days?|x\s*\d+))/i);
        if (qtyMatch) {
          medQty = qtyMatch[1];
        }

        detectedRows.push({
          id: `ocr-${Date.now()}-${detectedRows.length + 1}`,
          name: medName,
          quantity: medQty
        });
      }

      if (detectedRows.length > 0) {
        setMedicines(detectedRows);
        toast.success(`OCR extracted ${detectedRows.length} medicine line(s) from your prescription!`);
      } else {
        // Real OCR found no text or handwriting was unreadable
        toast.info("No legible printed medicine text detected in this image. You can type names below or let the pharmacist review the Rx.");
        setMedicines([{ id: Date.now().toString(), name: "", quantity: "1 strip" }]);
      }
    } catch (err: any) {
      console.error("[OCR Scan Error]:", err);
      toast.error("OCR scanner could not process this image format. You can type medicine names manually.");
      setMedicines([{ id: Date.now().toString(), name: "", quantity: "1 strip" }]);
    } finally {
      setIsOcrScanning(false);
      setOcrProgressText("");
    }
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Anti-Spam Honeypot Bot Verification
    if (honeypot.trim().length > 0) {
      console.warn("[Security] Automated bot submission rejected by honeypot filter.");
      toast.error("Automated submission detected and rejected.");
      return;
    }

    // 2. Prevent rapid duplicate submission clicks
    if (isSubmitting) return;

    // 3. Strict Input Validation
    const errors: Record<string, string> = {};
    const cleanPhone = cleanTo10Digits(mobile);

    if (fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name (minimum 2 characters)";
    }
    if (!/^\d{10}$/.test(cleanPhone)) {
      errors.mobile = "Please enter a valid 10-digit mobile number";
    }
    if (address.trim().length < 5) {
      errors.address = "Please enter a detailed delivery address";
    }

    const hasMedicines = medicines.some((m) => m.name.trim().length > 0);
    if (!hasMedicines && !prescriptionFile) {
      errors.medicines = "Please enter at least one medicine or upload a prescription";
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please correct the highlighted form errors.");
      return;
    }

    // Check Guest flow: if not authenticated, prompt mobile verification before confirming purchase
    if (!isAuthenticated && !mobile) {
      setPhoneSignupRole("patient");
      setIsPhoneSignupModalOpen(true);
      toast.info("Please verify your mobile number to submit request & receive live quotes.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a new order via centralized reactive OrderContext
      const newOrderId = createPatientRequest({
        fullName: fullName.trim(),
        mobile: cleanPhone,
        address: address.trim(),
        area,
        isUrgent,
        prescriptionFile: prescriptionPreviewUrl || prescriptionFile,
        medicines: medicines.filter((m) => m.name.trim().length > 0)
      });

      trackEvent("order_requested", {
        orderId: newOrderId,
        isUrgent,
        itemCount: medicines.length,
        hasRx: Boolean(prescriptionFile)
      });

      setActiveTab("my_orders");
      toast.success(`Medicine request ${newOrderId} sent to local pharmacists for review!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <LovableHeader activeRole="patient" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Page Top Heading & Subtabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Patient
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Submit a medicine request to independent neighbourhood pharmacies in Indiranagar.
            </p>
          </div>

          {/* Subtabs Pill Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("new_request")}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === "new_request"
                  ? "bg-white text-emerald-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              New request
            </button>
            <button
              onClick={() => setActiveTab("my_orders")}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === "my_orders"
                  ? "bg-white text-emerald-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My orders ({orders.length})
            </button>
          </div>
        </div>

        {activeTab === "new_request" ? (
          /* New Request Form View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Request medicines</h2>
                <p className="text-xs text-slate-500 mt-1 leading-normal">
                  Uploaded prescriptions and medicine lists are reviewed by licensed pharmacists before anything is billed.
                </p>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-5">
                {/* Anti-Spam Honeypot Bot Trap */}
                <SpamShield value={honeypot} onChange={setHoneypot} />

                {/* Full name & Mobile in grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Full name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (validationErrors.fullName) {
                          setValidationErrors((prev) => ({ ...prev, fullName: "" }));
                        }
                      }}
                      placeholder="e.g. Asha Rao"
                      required
                      className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50/50 focus:bg-white focus:outline-emerald-600 transition-colors ${
                        validationErrors.fullName ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                      }`}
                    />
                    {validationErrors.fullName && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3 h-3" />
                        <span>{validationErrors.fullName}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Mobile (for OTP & chemist contact)
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-xs font-semibold text-slate-500 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => {
                          const cleaned = cleanTo10Digits(e.target.value);
                          setMobile(cleaned);
                          if (validationErrors.mobile) {
                            setValidationErrors((prev) => ({ ...prev, mobile: "" }));
                          }
                        }}
                        placeholder="98450 12345"
                        maxLength={10}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        className={`w-full px-3 py-2 text-sm rounded-r-lg border bg-slate-50/50 focus:bg-white focus:outline-emerald-600 transition-colors font-mono tracking-wide ${
                          validationErrors.mobile ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                        }`}
                      />
                    </div>
                    {validationErrors.mobile && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3 h-3" />
                        <span>{validationErrors.mobile}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Address & Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Delivery address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Flat, street, building"
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-emerald-600 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Area</label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-emerald-600 transition-colors cursor-pointer"
                    >
                      <option value="Indiranagar, Bengaluru">Indiranagar, Bengaluru</option>
                      <option value="Defence Colony, Indiranagar">Defence Colony, Indiranagar</option>
                      <option value="HAL 2nd Stage, Indiranagar">HAL 2nd Stage, Indiranagar</option>
                      <option value="Domlur / 100ft Road">Domlur / 100ft Road</option>
                    </select>
                  </div>
                </div>

                {/* Prescription Upload Area with Rich Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Prescription (Doctor's Rx)
                    </label>
                    {prescriptionFile && (
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Uploaded & verified
                      </span>
                    )}
                  </div>

                  {prescriptionFile ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Prescription Attached
                          </span>
                          {prescriptionFileSize && (
                            <span className="text-xs text-slate-500 font-mono">{prescriptionFileSize}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {prescriptionPreviewUrl && (
                            <button
                              type="button"
                              onClick={() => setIsPreviewModalOpen(true)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 shadow-xs cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleRemovePrescription}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 shadow-xs cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* Thumbnail & File Details */}
                      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-emerald-100 shadow-xs">
                        {prescriptionPreviewUrl ? (
                          <div
                            onClick={() => setIsPreviewModalOpen(true)}
                            className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shrink-0 cursor-pointer hover:opacity-90 relative group flex items-center justify-center"
                            title="Click to view full prescription"
                          >
                            <img
                              src={prescriptionPreviewUrl}
                              alt="Prescription preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <ZoomIn className="w-5 h-5" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate">
                            {prescriptionFile}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Pharmacists will inspect this prescription directly and generate quotations.
                          </p>
                        </div>
                      </div>

                      {/* Action: Populate / transcribe medicine names from Rx */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-100/80">
                        <span className="text-xs text-slate-600">
                          Want specific medicine names included in request?
                        </span>
                        <button
                          type="button"
                          onClick={handleExtractMedicinesFromRx}
                          disabled={isOcrScanning}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {isOcrScanning ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                              <span>{ocrProgressText || "Scanning Rx..."}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Scan Rx & extract medicine names</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800">
                        Tap to upload prescription
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        PNG, JPG, or PDF up to 10MB · Clears medicine list for pharmacist review
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Medicines List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Medicines list ({medicines.length})
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Brand name or salt + package quantity
                    </span>
                  </div>

                  {medicines.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-semibold text-slate-700">
                        Medicine list is empty
                      </div>
                      <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                        {prescriptionFile
                          ? "Your attached prescription will be read directly by licensed pharmacists. You can also manually add specific medicine names or extract them below."
                          : "Upload a doctor's prescription above, or click below to manually add medicine names."}
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={handleAddMedicine}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-600" />
                          <span>+ Add medicine name</span>
                        </button>
                        {prescriptionFile && (
                          <button
                            type="button"
                            onClick={handleExtractMedicinesFromRx}
                            disabled={isOcrScanning}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 shadow-xs cursor-pointer disabled:opacity-60"
                          >
                            {isOcrScanning ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                                <span>{ocrProgressText || "Scanning Rx..."}</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Scan & extract from Rx</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {medicines.map((m, idx) => (
                        <div key={m.id} className="flex items-center gap-2">
                          <div className="w-6 text-xs text-slate-400 font-semibold text-center">
                            {idx + 1}.
                          </div>
                          <input
                            type="text"
                            value={m.name}
                            onChange={(e) => handleMedicineChange(m.id, "name", e.target.value)}
                            placeholder="Medicine name & dosage (e.g. Paracetamol 650mg)"
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-emerald-600"
                          />
                          <input
                            type="text"
                            value={m.quantity}
                            onChange={(e) => handleMedicineChange(m.id, "quantity", e.target.value)}
                            placeholder="Qty (e.g. 1 strip)"
                            className="w-32 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(m.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {medicines.length > 0 && (
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleAddMedicine}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 py-1.5 px-3 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add medicine</span>
                      </button>

                      {prescriptionFile && (
                        <button
                          type="button"
                          onClick={() => setMedicines([])}
                          className="text-xs text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          Clear medicine list (use Rx only)
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Urgent Request Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-800">
                        Urgent request
                      </span>
                      <span className="text-slate-500 ml-1">
                        (inform on-duty chemist for quick review)
                      </span>
                    </div>
                  </label>
                </div>

                {/* Submit Action Button */}
                <div className="pt-3 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl font-bold bg-[#065F46] hover:bg-[#044E39] text-white transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Send request for review</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    No charges now. You'll receive quotes with itemised prices from pharmacies who have stock.
                  </p>
                </div>
              </form>
            </div>

            {/* Right Column: Informational Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Card 1: Your Privacy */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <h3>Your privacy</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Chemists receive only medicine names and necessary prescription lines. Your contact details are masked. Delivery riders see only the sealed parcel label.
                </p>
              </div>

              {/* Card 2: Pharmacist Review Required */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <h3>Pharmacist review required</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Under Indian pharmacy law, Schedule H and H1 drugs require a valid prescription verified by a registered pharmacist before dispatch.
                </p>
              </div>

              {/* Card 3: Why Multiple Pharmacies */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Store className="w-4 h-4 text-emerald-700" />
                  <h3>Why multiple pharmacies?</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If your prescription includes medicines not all available at a single chemist, our system coordinates quotes from up to 3 nearby shops. One delivery partner collects all sealed bags and brings them together.
                </p>

                {/* Fee Breakdown Box */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs space-y-1">
                  <div className="font-semibold text-slate-800">Delivery fee:</div>
                  <div className="text-slate-600">
                    ₹30 for the first pharmacy + ₹15 per additional pharmacy stop.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* My Orders View (Live updating from OrderContext) */
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{order.id}</span>
                        <span className="text-xs text-slate-400">• {order.createdAt}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{order.address}</div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === "delivered"
                          ? "bg-slate-100 text-slate-700 border border-slate-200"
                          : order.status === "out_for_delivery" || order.status === "collecting"
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : order.status === "quoted"
                          ? "bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {order.statusLabel}
                    </span>
                  </div>

                  {/* Delivery OTP Card (Always visible to patient for verification) */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                        Delivery OTP
                      </div>
                      <div className="text-2xl font-black tracking-widest text-[#065F46] font-mono mt-0.5">
                        {(order.otp || "4821").slice(0, 4)}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-emerald-800/80 max-w-[200px]">
                      Share this code only when rider delivers your sealed parcel.
                    </div>
                  </div>

                  {/* Items list with live pricing */}
                  <div className="space-y-1.5 text-xs">
                    <span className="font-semibold text-slate-700">Requested Items:</span>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-700 font-medium">{item.name} ({item.quantity})</span>
                          <span className="text-slate-900 font-bold">
                            {item.price > 0 ? `₹${item.price}` : "Pending quote"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sourced Pharmacies */}
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-slate-700">Participating Chemists:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {order.pharmacies.map((ph, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[11px]"
                        >
                          <Store className="w-3 h-3 text-emerald-700" />
                          {ph}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Order Financial Breakdown */}
                  {order.totalAmount > 0 && (
                    <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-3 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Medicines subtotal:</span>
                        <span className="font-semibold text-slate-800">₹{order.subtotal || (order.totalAmount - (order.deliveryFee || 30) - 10)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Delivery fee ({order.pharmacies.length > 1 ? `${order.pharmacies.length} stops` : "single stop"}):</span>
                        <span className="font-semibold text-slate-800">₹{order.deliveryFee || (order.pharmacies.length > 1 ? 45 : 30)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Platform fee:</span>
                        <span className="font-semibold text-slate-800">₹{order.platformFee || 10}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900 text-sm">
                        <span>Total amount:</span>
                        <span className="text-emerald-700">₹{order.totalAmount}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">
                        Payment: <span className="font-semibold text-slate-600">{order.paymentMethod || "ONLINE"}</span>
                      </div>
                    </div>
                  )}

                  {/* Rider Details & Payable Total */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Bike className="w-4 h-4 text-emerald-700" />
                      <div>
                        <div className="font-semibold text-slate-800">{order.riderName || "Pending assignment"}</div>
                        <div className="text-[10px] text-slate-400">{order.riderType || "ArogyaSwift Shared Partner"}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-sm">
                        {order.totalAmount > 0 ? `₹${order.totalAmount}` : "Awaiting quote"}
                      </div>
                      <div className="text-[10px] text-slate-400">{order.status === "delivered" ? "Paid" : "Total to pay"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Prescription Preview Modal */}
        {isPreviewModalOpen && prescriptionPreviewUrl && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-5 space-y-3 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-slate-900">{prescriptionFile}</span>
                  {prescriptionFileSize && (
                    <span className="text-xs text-slate-400">({prescriptionFileSize})</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-auto rounded-xl bg-slate-900 flex items-center justify-center p-2">
                <img
                  src={prescriptionPreviewUrl}
                  alt="Doctor's Prescription Full Preview"
                  className="max-h-[68vh] w-auto object-contain rounded-lg shadow-md"
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500">
                  Attached to your order for CDSCO-compliant pharmacist verification.
                </span>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <LovableFooter />
    </div>
  );
}
