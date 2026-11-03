import { useState } from "react";
import { LovableHeader } from "@/components/LovableHeader";
import { LovableFooter } from "@/components/LovableFooter";
import { useOrders } from "@/contexts/OrderContext";
import {
  ShieldCheck,
  Store,
  Bike,
  CheckCircle2,
  Clock,
  Search,
  Filter
} from "lucide-react";

const PHARMACIES = [
  {
    name: "Shree Ganesh Medicals",
    licence: "KA-BLR-20B-1142",
    area: "12th Main, Indiranagar",
    status: "Open",
    statusColor: "bg-emerald-50 text-emerald-800 border-emerald-200"
  },
  {
    name: "Apollo Pharmacy Indiranagar",
    licence: "KA-BLR-20B-4819",
    area: "CMH Road, Indiranagar",
    status: "Open",
    statusColor: "bg-emerald-50 text-emerald-800 border-emerald-200"
  },
  {
    name: "MedPlus Superstore",
    licence: "KA-BLR-20B-8812",
    area: "100ft Road, Indiranagar",
    status: "Busy",
    statusColor: "bg-amber-50 text-amber-800 border-amber-200"
  },
  {
    name: "Noble Chemists Domlur",
    licence: "KA-BLR-20B-3091",
    area: "Old Airport Rd, Domlur",
    status: "Closed",
    statusColor: "bg-slate-100 text-slate-600 border-slate-200"
  }
];

const RIDERS = [
  {
    name: "Ravi Kumar",
    network: "Ekart Logistics Partner",
    status: "Online · 1 active delivery",
    statusColor: "bg-emerald-50 text-emerald-800 border-emerald-200"
  },
  {
    name: "Sunil Das",
    network: "Dunzo Fleet Network",
    status: "Online · Available",
    statusColor: "bg-emerald-50 text-emerald-800 border-emerald-200"
  },
  {
    name: "Praveen M",
    network: "Shadowfax Express",
    status: "Offline",
    statusColor: "bg-slate-100 text-slate-600 border-slate-200"
  }
];

export default function AdminPortal() {
  const { orders } = useOrders();
  const [filter, setFilter] = useState<"All" | "Review" | "Live" | "Done">("All");

  // Dynamic Live KPIs
  const totalOrdersCount = orders.length;
  const inReviewCount = orders.filter((o) => o.status === "in_review").length;
  const liveCount = orders.filter(
    (o) =>
      o.status === "quoted" ||
      o.status === "order_confirmed" ||
      o.status === "rider_assigned" ||
      o.status === "collecting" ||
      o.status === "picked_up" ||
      o.status === "out_for_delivery"
  ).length;
  const doneCount = orders.filter((o) => o.status === "delivered").length;
  const deliveredValue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Filtered orders table
  const filteredOrders = orders.filter((o) => {
    if (filter === "Review") return o.status === "in_review";
    if (filter === "Live")
      return (
        o.status === "quoted" ||
        o.status === "order_confirmed" ||
        o.status === "rider_assigned" ||
        o.status === "collecting" ||
        o.status === "picked_up" ||
        o.status === "out_for_delivery"
      );
    if (filter === "Done") return o.status === "delivered";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <LovableHeader activeRole="admin" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Operations overview · Indiranagar pilot zone
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Pilot zone live sync · {orders.length} registered orders</span>
          </div>
        </div>

        {/* 5 Dynamic KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total orders
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalOrdersCount}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              In review
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1">{inReviewCount}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Live deliveries
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{liveCount}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Completed
            </div>
            <div className="text-2xl font-black text-slate-700 mt-1">{doneCount}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs col-span-2 sm:col-span-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Delivered value
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">₹{deliveredValue}</div>
          </div>
        </div>

        {/* Section 1: Order monitoring (Live Table) */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Order monitoring
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking of prescription verification and dispatch
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFilter("All")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filter === "All"
                    ? "bg-white text-emerald-800 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({totalOrdersCount})
              </button>

              <button
                type="button"
                onClick={() => setFilter("Review")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filter === "Review"
                    ? "bg-white text-emerald-800 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Review ({inReviewCount})
              </button>

              <button
                type="button"
                onClick={() => setFilter("Live")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filter === "Live"
                    ? "bg-white text-emerald-800 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Live ({liveCount})
              </button>

              <button
                type="button"
                onClick={() => setFilter("Done")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filter === "Done"
                    ? "bg-white text-emerald-800 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Done ({doneCount})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Order</th>
                  <th className="py-2.5 px-3 font-semibold">Area</th>
                  <th className="py-2.5 px-3 font-semibold">Pharmacies</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Rider</th>
                  <th className="py-2.5 px-3 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{order.id}</div>
                      <div className="text-[10px] text-slate-400">{order.patientName}</div>
                    </td>
                    <td className="py-3 px-3">{order.area}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {order.pharmacies.join(", ")}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          order.status === "delivered"
                            ? "bg-slate-100 text-slate-700 border-slate-200"
                            : order.status === "in_review"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {order.statusLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {order.riderName || "Pending dispatch"}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {order.totalAmount > 0 ? `₹${order.totalAmount}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Bottom Grid (2 Columns: Pharmacy Roster & Shared Partners) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pharmacy roster */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Pharmacy roster</h3>
              </div>
              <span className="text-xs text-slate-400">4 registered chemists</span>
            </div>

            <div className="space-y-3">
              {PHARMACIES.map((pharm, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{pharm.name}</div>
                    <div className="text-[11px] text-slate-500">
                      Licence: {pharm.licence} · {pharm.area}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${pharm.statusColor}`}
                  >
                    {pharm.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shared delivery partners */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Shared delivery partners</h3>
              </div>
              <span className="text-xs text-slate-400">3 on-demand fleets</span>
            </div>

            <div className="space-y-3">
              {RIDERS.map((rider, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{rider.name}</div>
                    <div className="text-[11px] text-slate-500">{rider.network}</div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${rider.statusColor}`}
                  >
                    {rider.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <LovableFooter />
    </div>
  );
}
