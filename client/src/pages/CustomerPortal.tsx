import { useState } from "react";
import { LovableHeader } from "@/components/LovableHeader";
import { LovableFooter } from "@/components/LovableFooter";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import { SpamShield } from "@/components/SpamShield";
import { trackEvent } from "@/lib/analytics";
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
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface MedicineRow {
  id: string;
  name: string;
  quantity: string;
}

export default function CustomerPortal() {
  const { user, isAuthenticated, setIsPhoneSignupModalOpen, setPhoneSignupRole } = useAuth();
  const { orders, createPatientRequest } = useOrders();

  const [activeTab, setActiveTab] = useState<"new_request" | "my_orders">("new_request");

  // Form State
  const [fullName, setFullName] = useState(user?.name || "Asha Rao");
  const [mobile, setMobile] = useState(user?.phone || "9845012345");
  const [address, setAddress] = useState("124, 4th Cross, Defence Colony");
  const [area, setArea] = useState("Indiranagar, Bengaluru");
  const [isUrgent, setIsUrgent] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<string | null>(null);

  // Anti-Spam Honeypot & Debounce State
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Medicines List
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
    if (medicines.length <= 1) {
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
    if (file) {
      setPrescriptionFile(file.name);
      toast.success(`Prescription uploaded: ${file.name}`);
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
    const cleanPhone = mobile.replace(/\D/g, "");

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
        prescriptionFile,
        medicines
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
                      <span className="inline-flex items-center px-3 text-xs font-medium text-slate-500 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => {
                          setMobile(e.target.value);
                          if (validationErrors.mobile) {
                            setValidationErrors((prev) => ({ ...prev, mobile: "" }));
                          }
                        }}
                        placeholder="9845012345"
                        required
                        className={`w-full px-3 py-2 text-sm rounded-r-lg border bg-slate-50/50 focus:bg-white focus:outline-emerald-600 transition-colors ${
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

                {/* Prescription Upload Area (Dashed box) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Prescription (Doctor's Rx)
                  </label>
                  <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {prescriptionFile ? prescriptionFile : "Tap to upload prescription"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      PNG, JPG, or PDF up to 10MB · Optional if entering names manually
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
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

                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 py-1.5 px-3 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add medicine</span>
                  </button>
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
      </main>

      <LovableFooter />
    </div>
  );
}
