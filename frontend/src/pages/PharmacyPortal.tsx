import { useState } from "react";
import { LovableHeader } from "@/components/LovableHeader";
import { LovableFooter } from "@/components/LovableFooter";
import { useOrders, OrderItem } from "@/contexts/OrderContext";
import { DEMO_RIDERS, DemoRider } from "@/lib/demoRiders";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Store,
  Bike,
  ShieldCheck,
  Send,
  AlertCircle,
  KeyRound,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export default function PharmacyPortal() {
  const {
    orders,
    approvePharmacyQuote,
    rejectPharmacyRequest,
    assignRider
  } = useOrders();

  const [selectedPharmacy, setSelectedPharmacy] = useState("Shree Ganesh Medicals");
  const [isOpen, setIsOpen] = useState(true);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [modalPrescriptionOrder, setModalPrescriptionOrder] = useState<string>("AS-1044");

  // In-memory price edit buffers for incoming orders
  const [priceBuffers, setPriceBuffers] = useState<Record<string, Record<string, { inStock: boolean; price: number }>>>({});

  // Connected Demo Riders (Single Source of Truth)
  const storeRiders = DEMO_RIDERS.filter((r) => r.type === "in_house");
  const sharedPartners = DEMO_RIDERS.filter((r) => r.type === "shared");
  const [selectedSharedPartnerId, setSelectedSharedPartnerId] = useState<string>("rider-ravi");

  // Filter orders for Pharmacy views
  const incomingRequests = orders.filter((o) => o.status === "in_review");
  const acceptedOrders = orders.filter(
    (o) =>
      o.status === "quoted" ||
      o.status === "order_confirmed" ||
      o.status === "rider_assigned" ||
      o.status === "collecting" ||
      o.status === "picked_up"
  );

  const getEditableItems = (orderId: string, originalItems: OrderItem[]) => {
    return originalItems.map((item) => {
      const buffer = priceBuffers[orderId]?.[item.id];
      return {
        ...item,
        inStock: buffer !== undefined ? buffer.inStock : item.inStock,
        price: buffer !== undefined ? buffer.price : (item.price > 0 ? item.price : 45) // default reasonable demo price if 0
      };
    });
  };

  const handleToggleStock = (orderId: string, itemId: string, inStock: boolean) => {
    setPriceBuffers((prev) => {
      const orderBuf = prev[orderId] || {};
      const curItem = orderBuf[itemId] || { inStock: true, price: 45 };
      return {
        ...prev,
        [orderId]: {
          ...orderBuf,
          [itemId]: { ...curItem, inStock }
        }
      };
    });
  };

  const handlePriceChange = (orderId: string, itemId: string, price: number) => {
    setPriceBuffers((prev) => {
      const orderBuf = prev[orderId] || {};
      const curItem = orderBuf[itemId] || { inStock: true, price: 45 };
      return {
        ...prev,
        [orderId]: {
          ...orderBuf,
          [itemId]: { ...curItem, price: Number.isNaN(price) ? 0 : price }
        }
      };
    });
  };

  const handleAcceptQuote = (orderId: string, originalItems: OrderItem[]) => {
    const updatedItems = getEditableItems(orderId, originalItems);
    const total = updatedItems
      .filter((i) => i.inStock)
      .reduce((sum, i) => sum + i.price, 0);

    approvePharmacyQuote(orderId, updatedItems, total);
    toast.success(`Quote of ₹${total + 30} approved and sent to patient for ${orderId}!`);
  };

  const handleRejectQuote = (orderId: string) => {
    rejectPharmacyRequest(orderId);
    toast.info(`Request ${orderId} marked as rejected / out of stock.`);
  };

  const handleDispatchOwnRider = (orderId: string, rider: DemoRider) => {
    assignRider(
      orderId,
      "own",
      `${rider.name} (Store In-House Rider)`,
      rider.id,
      rider.phone
    );
    toast.success(`Dispatched ${orderId} with in-house rider ${rider.name}! Directly connected to Delivery portal.`);
  };

  const handleRequestSharedPartner = (orderId: string) => {
    const partner = sharedPartners.find((p) => p.id === selectedSharedPartnerId) || sharedPartners[0];
    assignRider(
      orderId,
      "shared",
      `${partner.name} (Shared Fleet)`,
      partner.id,
      partner.phone
    );
    toast.success(`Assigned ${orderId} to shared partner ${partner.name}! Directly connected to Delivery portal.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <LovableHeader activeRole="pharmacy" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Pharmacy dashboard
              </h1>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                  isOpen
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                />
                {isOpen ? "Open" : "Closed"}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pharmacist: R. Kulkarni · Licence KA-BLR-20B-1142 (demo)
            </p>
          </div>

          {/* Pharmacy Selector */}
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPharmacy}
              onChange={(e) => setSelectedPharmacy(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-xs focus:outline-emerald-600 cursor-pointer"
            >
              <option value="Shree Ganesh Medicals">Shree Ganesh Medicals</option>
              <option value="Apollo Pharmacy Indiranagar">Apollo Pharmacy Indiranagar</option>
              <option value="MedPlus Superstore">MedPlus Superstore</option>
            </select>
          </div>
        </div>

        {/* Section 1: Incoming requests (Live from Patient) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Incoming requests ({incomingRequests.length})
            </h2>
            <span className="text-xs text-slate-500">
              Quotes expire in 15 mins if unconfirmed
            </span>
          </div>

          {incomingRequests.length > 0 ? (
            <div className="space-y-4">
              {incomingRequests.map((req) => {
                const items = getEditableItems(req.id, req.items);
                const quoteTotal = items
                  .filter((i) => i.inStock)
                  .reduce((sum, i) => sum + i.price, 0);

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6"
                  >
                    {/* Request Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">{req.id}</span>
                          <span className="text-xs text-slate-500 font-medium">
                            · {req.items.length} medicines requested
                          </span>
                          {req.isUrgent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {req.patientName} · {req.address} · {req.createdAt}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setModalPrescriptionOrder(req.id);
                          setShowPrescriptionModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors self-start sm:self-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View prescription (IMAGE)</span>
                      </button>
                    </div>

                    {/* Medicine items stock & price table */}
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Check stock & enter price
                      </div>

                      <div className="space-y-2.5">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50"
                          >
                            <div className="space-y-0.5">
                              <div className="text-sm font-bold text-slate-900">{item.name}</div>
                              <div className="text-xs text-slate-500">{item.quantity}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Stock toggle buttons */}
                              <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStock(req.id, item.id, true)}
                                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                                    item.inStock
                                      ? "bg-emerald-600 text-white shadow-xs"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  In stock
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStock(req.id, item.id, false)}
                                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                                    !item.inStock
                                      ? "bg-rose-600 text-white shadow-xs"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  Out of stock
                                </button>
                              </div>

                              {/* Price input */}
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-slate-500">₹</span>
                                <input
                                  type="number"
                                  disabled={!item.inStock}
                                  value={item.inStock ? item.price : 0}
                                  onChange={(e) =>
                                    handlePriceChange(req.id, item.id, parseInt(e.target.value) || 0)
                                  }
                                  className="w-20 px-2.5 py-1 text-sm font-semibold rounded-lg border border-slate-200 bg-white focus:outline-emerald-600 text-right disabled:opacity-50"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total & Action Bar */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-sm">
                        <span className="text-slate-500">Total for items: </span>
                        <span className="font-extrabold text-slate-900 text-lg">₹{quoteTotal}</span>
                        <span className="text-xs text-slate-400 ml-2">(+ ₹30 delivery fee)</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleRejectQuote(req.id)}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Reject request
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAcceptQuote(req.id, req.items)}
                          className="px-5 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#044E39] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Accept & send price</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/90 p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-slate-900 text-sm">All incoming requests answered</div>
              <div className="text-xs text-slate-400">
                You will be alerted as soon as another patient in Indiranagar submits a medicine request.
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Accepted orders & rider dispatch */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Accepted orders & rider dispatch ({acceptedOrders.length})
          </h2>

          <div className="space-y-4">
            {acceptedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{order.id}</span>
                      <span className="text-xs text-slate-500">• {order.patientName} ({order.area})</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Items: {order.items.map((i) => i.name).join(", ")} · Value: ₹{order.totalAmount} · Pack sealed
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 self-start sm:self-auto">
                    {order.statusLabel}
                  </span>
                </div>

                {/* Status indicator: Awaiting patient or ready to dispatch */}
                {order.status === "quoted" ? (
                  <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-5 h-5 text-amber-700 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-amber-900">
                          Waiting for Patient Confirmation (Quote: ₹{order.totalAmount})
                        </div>
                        <div className="text-[11px] text-amber-800/80 mt-0.5">
                          Quotation has been sent to {order.patientName}. Handover OTP & rider dispatch will unlock automatically once the patient confirms and places the order.
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white text-amber-900 font-bold text-xs rounded-lg border border-amber-300 self-start sm:self-auto shrink-0 shadow-2xs">
                      Awaiting Patient
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="bg-emerald-100/70 border border-emerald-300 rounded-xl p-3 flex items-center justify-between text-xs font-bold text-emerald-950">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Order Confirmed by Patient · Payment: {order.paymentMethod || "ONLINE"}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-white/90 px-2 py-0.5 rounded border border-emerald-200">
                        Ready to Pack & Handover
                      </span>
                    </div>

                    {/* Handover Pickup OTP for Delivery Rider */}
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Chemist Pickup Handover OTP</span>
                        </div>
                        <div className="text-2xl font-black font-mono tracking-widest text-[#065F46] mt-0.5">
                          {order.pickupOtp || order.pickupStops[0]?.pickupOtp || "5823"}
                        </div>
                      </div>
                      <div className="text-xs text-emerald-800 sm:text-right max-w-sm">
                        Give this 4-digit Pickup OTP to the delivery rider at store counter when handing over the sealed medicine parcel.
                      </div>
                    </div>

                    {/* Hybrid Dispatch: Option A vs Option B */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Option A: Own Rider */}
                      <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-4 space-y-3">
                        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Option A · Your own rider</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Send your in-house store delivery boy directly. Customer receives their phone number.
                        </p>

                        <div className="space-y-2 pt-1">
                          {storeRiders.map((rider) => (
                            <div
                              key={rider.id}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs gap-2"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <span>{rider.name}</span>
                                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-normal">
                                    {rider.vehicle}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {rider.status} • {rider.phone}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDispatchOwnRider(order.id, rider)}
                                className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer shrink-0"
                              >
                                Send {rider.name}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Option B: Nearby Shared Partner */}
                      <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-4 space-y-3">
                        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Option B · Nearby shared partner</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          No staff free? Broadcast to verified delivery partner fleet in Indiranagar.
                        </p>

                        <div className="space-y-3 pt-1">
                          <select
                            value={selectedSharedPartnerId}
                            onChange={(e) => setSelectedSharedPartnerId(e.target.value)}
                            className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white cursor-pointer"
                          >
                            {sharedPartners.map((partner) => (
                              <option key={partner.id} value={partner.id}>
                                {partner.name} ({partner.vehicle} · {partner.eta} · {partner.rating})
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleRequestSharedPartner(order.id)}
                            className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Bike className="w-3.5 h-3.5" />
                            <span>Request partner</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Prescription Modal */}
        {showPrescriptionModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="font-bold text-slate-900 text-base">
                  Prescription for {modalPrescriptionOrder}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Prescription Display (Real patient uploaded image or default clinic Rx) */}
              {(() => {
                const targetOrder = incomingRequests.find((o) => o.id === modalPrescriptionOrder);
                if (
                  targetOrder?.prescriptionUrl &&
                  (targetOrder.prescriptionUrl.startsWith("data:") ||
                    targetOrder.prescriptionUrl.startsWith("http") ||
                    targetOrder.prescriptionUrl.startsWith("blob:"))
                ) {
                  return (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center p-2 max-h-[65vh]">
                      <img
                        src={targetOrder.prescriptionUrl}
                        alt="Prescription preview"
                        className="max-h-[60vh] w-auto object-contain rounded-lg shadow-md"
                      />
                    </div>
                  );
                }
                return (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
                    <FileText className="w-12 h-12 text-emerald-700 mb-2" />
                    <div className="text-sm font-bold text-slate-800">
                      Dr. Rajesh Sharma, MBBS (Reg #KA-44821)
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Patient Clinic Rx · Indiranagar Clinical Centre
                    </div>
                    <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 text-xs text-left w-full space-y-1">
                      <div>1. Tab. Paracetamol 650mg — 1-0-1 x 5 days</div>
                      <div>2. Tab. Azithromycin 500mg — 1-0-0 x 5 days</div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Close preview
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
