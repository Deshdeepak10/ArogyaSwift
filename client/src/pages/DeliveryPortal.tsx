import { useState } from "react";
import { LovableHeader } from "@/components/LovableHeader";
import { LovableFooter } from "@/components/LovableFooter";
import { useOrders } from "@/contexts/OrderContext";
import {
  Bike,
  CheckCircle2,
  Clock,
  PhoneCall,
  MapPin,
  Store,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Package,
  Lock,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const DELIVERY_STEPS = [
  "Rider assigned",
  "Collecting from pharmacies",
  "Picked up",
  "Out for delivery",
  "Delivered"
];

export default function DeliveryPortal() {
  const {
    orders,
    acceptDeliveryRun,
    togglePickupStop,
    verifyPickupOtp,
    advanceDeliveryStep,
    verifyDeliveryOtp
  } = useOrders();

  const [selectedRider, setSelectedRider] = useState("Ravi Kumar (shared partner)");
  const [enteredOtp, setEnteredOtp] = useState<Record<string, string>>({});
  const [pickupOtpInputs, setPickupOtpInputs] = useState<Record<string, string>>({});

  // 1. Pending dispatch requests waiting for rider to accept
  const pendingRequests = orders.filter((o) => o.status === "rider_assigned");

  // 2. Active deliveries currently being handled by rider
  const activeDeliveries = orders.filter(
    (o) =>
      o.status === "collecting" ||
      o.status === "picked_up" ||
      o.status === "out_for_delivery"
  );

  const completedDeliveries = orders.filter((o) => o.status === "delivered");

  const handleMaskedCall = (patientPhone: string) => {
    toast.info(`Connecting to ${patientPhone} via masked proxy: +91 80 4719 2200`, {
      description: "Direct customer and pharmacy telephone numbers are kept private for safety."
    });
  };

  const handleAccept = (orderId: string) => {
    acceptDeliveryRun(orderId, selectedRider);
    toast.success(`You accepted delivery run for ${orderId}! Proceed to pharmacy pickup stops.`);
  };

  const handleVerifyChemistOtp = (orderId: string, stopId: string, pharmacyName: string) => {
    const key = `${orderId}_${stopId}`;
    const otp = pickupOtpInputs[key] || "";
    if (!otp.trim()) {
      toast.error(`Please enter the 4-digit pickup OTP provided by ${pharmacyName}.`);
      return;
    }

    const isValid = verifyPickupOtp(orderId, stopId, otp);
    if (isValid) {
      toast.success(`Pickup OTP verified for ${pharmacyName}! Sealed parcel collected.`);
    } else {
      toast.error(`Invalid OTP. Ask the pharmacist at ${pharmacyName} for their 4-digit handover code.`);
    }
  };

  const handleCustomerOtpSubmit = (orderId: string, e: React.FormEvent) => {
    e.preventDefault();
    const delivery = orders.find((o) => o.id === orderId);
    if (!delivery) return;

    // Strict validation: Must pick up from pharmacy first!
    const allCollected = delivery.pickupStops.every((s) => s.isCollected);
    if (!allCollected || delivery.currentStepIndex < 2) {
      toast.error("Cannot complete delivery yet: Please verify pickup OTP and collect all parcels first!");
      return;
    }

    if (delivery.currentStepIndex < 3) {
      toast.error("Please mark 'Out for delivery' before entering customer OTP at doorstep!");
      return;
    }

    const otp = (enteredOtp[orderId] || "").trim().slice(0, 4);
    const isValid = verifyDeliveryOtp(orderId, otp);
    if (isValid) {
      toast.success(`Delivery OTP verified for ${orderId}! Parcel handed over & payment logged.`);
    } else {
      toast.error(`Invalid OTP. Ask patient for their 4-digit code (visible on their Patient screen).`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <LovableHeader activeRole="delivery" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Delivery partner
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Hybrid model: pharmacies send their own rider or request a nearby shared partner.
            </p>
          </div>

          {/* Rider Profile Selector */}
          <div className="flex items-center gap-2">
            <Bike className="w-4 h-4 text-emerald-700" />
            <select
              value={selectedRider}
              onChange={(e) => setSelectedRider(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-xs focus:outline-emerald-600 cursor-pointer"
            >
              <option value="Ravi Kumar (shared partner)">Ravi Kumar (shared partner)</option>
              <option value="Ramu (Shree Ganesh in-house rider)">Ramu (Shree Ganesh in-house rider)</option>
            </select>
          </div>
        </div>

        {/* Section 1: New requests waiting to be accepted */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              New requests ({pendingRequests.length})
            </h2>
            <span className="text-xs text-slate-400">Live order broadcast</span>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border-2 border-emerald-500/40 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">{req.id}</span>
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {req.pickupStops.length} pickup stop(s)
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Drop: {req.patientName} · {req.area}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-sm">Collect ₹{req.totalAmount}</div>
                      <div className="text-[10px] text-slate-400">Earning: ₹45</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1">
                    <div className="font-semibold text-slate-700">Pickup Stops:</div>
                    {req.pickupStops.map((stop, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <Store className="w-3 h-3 text-emerald-700" />
                        <span>{stop.pharmacyName} ({stop.address})</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAccept(req.id)}
                    className="w-full py-2.5 rounded-lg bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Package className="w-4 h-4" />
                    <span>Accept delivery run</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 text-center text-xs text-slate-500">
              No pending dispatch requests right now. New multi-pickup dispatch orders from pharmacies appear here live.
            </div>
          )}
        </div>

        {/* Section 2: My deliveries (Active runs) */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            My deliveries ({activeDeliveries.length} active run{activeDeliveries.length === 1 ? "" : "s"})
          </h2>

          {activeDeliveries.length > 0 ? (
            <div className="space-y-6">
              {activeDeliveries.map((delivery) => {
                const allCollected = delivery.pickupStops.every((s) => s.isCollected);

                return (
                  <div
                    key={delivery.id}
                    className="bg-white rounded-xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6"
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-lg">{delivery.id}</span>
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {delivery.pickupStops.length} pickup{delivery.pickupStops.length === 1 ? "" : "s"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {delivery.area} circuit · Sealed medicine parcels (Names hidden for privacy)
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold self-start sm:self-auto">
                        <span>Collect ₹{delivery.totalAmount} on delivery</span>
                      </div>
                    </div>

                    {/* Stepper Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 overflow-x-auto pb-1">
                        {DELIVERY_STEPS.map((step, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-1.5 whitespace-nowrap px-1 ${
                              idx === delivery.currentStepIndex
                                ? "text-emerald-700 font-bold"
                                : idx < delivery.currentStepIndex
                                ? "text-slate-700"
                                : "text-slate-300"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                idx === delivery.currentStepIndex
                                  ? "bg-emerald-600 text-white"
                                  : idx < delivery.currentStepIndex
                                  ? "bg-slate-200 text-slate-700"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>

                      {/* Progress track */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#065F46] h-full transition-all duration-300"
                          style={{
                            width: `${((delivery.currentStepIndex + 1) / DELIVERY_STEPS.length) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Step 1: Pickup Checklist with Chemist Pickup OTP */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-emerald-700" />
                          <span>1. Pharmacy Pickup Handover (OTP Required)</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {allCollected ? "All parcels collected ✓" : "Collect sealed parcel from chemist"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {delivery.pickupStops.map((stop) => {
                          const stopKey = `${delivery.id}_${stop.id}`;
                          const currentVal = pickupOtpInputs[stopKey] || "";
                          const demoOtp = (stop.pickupOtp || delivery.pickupOtp || "5823").slice(0, 4);

                          return (
                            <div
                              key={stop.id}
                              className={`p-4 rounded-xl border transition-all ${
                                stop.isCollected
                                  ? "bg-emerald-50/70 border-emerald-300"
                                  : "bg-slate-50 border-slate-200"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                    <Store className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>{stop.pharmacyName}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500">{stop.address}</div>
                                  <div className="text-[11px] font-semibold text-slate-700 pt-0.5">
                                    {stop.parcelLabel}
                                  </div>
                                </div>

                                {stop.isCollected ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 self-start sm:self-auto">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Parcel Handover Confirmed (OTP Verified ✓)</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 self-start sm:self-auto">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>Pending Handover OTP</span>
                                  </span>
                                )}
                              </div>

                              {/* Chemist OTP Verification Form if stop not collected */}
                              {!stop.isCollected && (
                                <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border">
                                  <div className="space-y-0.5">
                                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                      <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                                      <span>Ask Chemist for 4-digit Pickup OTP</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                      Store Pharmacist has this code on their dashboard (Demo: {demoOtp})
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      maxLength={4}
                                      value={currentVal}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                                        setPickupOtpInputs({
                                          ...pickupOtpInputs,
                                          [stopKey]: val
                                        });
                                      }}
                                      placeholder={demoOtp}
                                      className="w-24 px-2.5 py-1.5 text-xs font-mono font-bold text-center rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-emerald-600"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyChemistOtp(delivery.id, stop.id, stop.pharmacyName)}
                                      className="px-3.5 py-1.5 rounded-lg bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                                    >
                                      Verify OTP & Collect
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Advance Pickup button if currently collecting and all stops verified */}
                      {delivery.currentStepIndex === 1 && (
                        <div className="pt-2">
                          <button
                            type="button"
                            disabled={!allCollected}
                            onClick={() => {
                              if (!allCollected) {
                                toast.error("Please enter the chemist pickup OTP for all stops first!");
                                return;
                              }
                              advanceDeliveryStep(delivery.id);
                              toast.success("All parcels picked up from pharmacies!");
                            }}
                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 ${
                              allCollected
                                ? "bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            <Package className="w-4 h-4" />
                            <span>
                              {allCollected
                                ? "All Parcels Confirmed via OTP → Advance to Picked Up"
                                : "Verify Chemist Pickup OTP to Advance →"}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Step 2 & 3: Drop off to customer */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>2. Delivery to customer</span>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 text-sm">{delivery.patientName}</div>
                          <div className="text-xs text-slate-600 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{delivery.address}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleMaskedCall(delivery.patientPhone)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold shadow-xs self-start sm:self-auto cursor-pointer"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Call via masked number (demo)</span>
                        </button>
                      </div>

                      {/* PHASE A: When still collecting (stepIndex 1) -> Customer OTP locked */}
                      {delivery.currentStepIndex === 1 && (
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs flex items-center gap-2.5 text-slate-500">
                          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>
                            <strong>Customer delivery OTP locked.</strong> You must verify the Chemist Pickup OTP above and collect all parcels first.
                          </span>
                        </div>
                      )}

                      {/* PHASE B: When Picked Up (stepIndex 2) -> Prompt to start out for delivery */}
                      {delivery.currentStepIndex === 2 && (
                        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 text-xs space-y-2.5">
                          <div className="flex items-center gap-2 font-bold text-amber-950">
                            <Bike className="w-4 h-4 text-amber-700" />
                            <span>All parcels picked up! Ready to start delivery trip</span>
                          </div>
                          <p className="text-amber-800 text-[11px] leading-relaxed">
                            Start delivery to navigate to customer doorstep. The customer handover OTP unlocks when out for delivery.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              advanceDeliveryStep(delivery.id);
                              toast.success("Trip started: Out for delivery to customer!");
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            <Bike className="w-3.5 h-3.5" />
                            <span>Start Trip: Out for delivery →</span>
                          </button>
                        </div>
                      )}

                      {/* PHASE C: When Out for Delivery (stepIndex 3) -> Active Customer Handover OTP */}
                      {delivery.currentStepIndex === 3 && (
                        <form
                          onSubmit={(e) => handleCustomerOtpSubmit(delivery.id, e)}
                          className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/70 space-y-3 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                              <KeyRound className="w-4 h-4 text-emerald-700" />
                              <span>Verify customer handover OTP (Demo: {(delivery.otp || "4821").slice(0, 4)})</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                              At Doorstep
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800">
                            Ask patient for their 4-digit code (visible on their Patient screen) to complete handover and collect ₹{delivery.totalAmount}.
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={4}
                              value={enteredOtp[delivery.id] || ""}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                                setEnteredOtp({ ...enteredOtp, [delivery.id]: val });
                              }}
                              placeholder={(delivery.otp || "4821").slice(0, 4)}
                              className="px-3 py-2 text-sm font-mono tracking-widest font-bold rounded-lg border border-emerald-300 bg-white focus:outline-emerald-600 w-32 text-center"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-lg bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs shadow-xs cursor-pointer"
                            >
                              Verify & complete delivery
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/90 p-8 text-center text-xs text-slate-500">
              No active delivery trips assigned yet. Accept a request above to start your run!
            </div>
          )}
        </div>

        {/* Section 3: Completed Deliveries */}
        {completedDeliveries.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Completed deliveries ({completedDeliveries.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {completedDeliveries.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{comp.id} · {comp.patientName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{comp.address}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-700">₹{comp.totalAmount} collected</div>
                    <div className="text-[10px] text-slate-400">Delivered</div>
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
