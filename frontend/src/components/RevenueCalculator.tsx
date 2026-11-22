import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, ShoppingBag, ShieldCheck, Truck, Percent, Sparkles, AlertCircle } from "lucide-react";

interface RevenueCalculatorProps {
  darkTheme?: boolean;
}

export default function RevenueCalculator({ darkTheme = false }: RevenueCalculatorProps) {
  // Simulator State Parameters
  const [monthlyOrders, setMonthlyOrders] = useState(5000);
  const [avgOrderValue, setAvgOrderValue] = useState(850);
  const [medicineMargin, setMedicineMargin] = useState(20); // 20%
  const [deliveryFee, setDeliveryFee] = useState(35); // ₹35
  const [labCrossSellPct, setLabCrossSellPct] = useState(6); // 6%
  const [subscriptionPct, setSubscriptionPct] = useState(12); // 12%
  const [riderPayout, setRiderPayout] = useState(45); // ₹45
  const [packagingCost, setPackagingCost] = useState(12); // ₹12 (Includes cold-pack)
  const [auditCost, setAuditCost] = useState(8); // ₹8 pharmacist verification fee

  // Computations
  const totalGMV = monthlyOrders * avgOrderValue;
  const medicineGrossRevenue = totalGMV * (medicineMargin / 100);
  const totalDeliveryRevenue = monthlyOrders * deliveryFee;
  
  const labOrders = Math.round(monthlyOrders * (labCrossSellPct / 100));
  const labRevenue = labOrders * 1200 * 0.35; // 35% margin on ₹1200 lab tests
  
  const subscribers = Math.round(monthlyOrders * (subscriptionPct / 100));
  const subscriptionRevenue = subscribers * 66; // ₹199/qtr = ~₹66/month
  
  const totalGrossRevenue = medicineGrossRevenue + totalDeliveryRevenue + labRevenue + subscriptionRevenue;

  // Direct Fulfillment Costs
  const totalRiderCost = monthlyOrders * riderPayout;
  const totalPackagingCost = monthlyOrders * packagingCost;
  const totalAuditCost = monthlyOrders * auditCost;
  const totalFulfillmentCost = totalRiderCost + totalPackagingCost + totalAuditCost;

  // Contribution Margin
  const netContribution = totalGrossRevenue - totalFulfillmentCost;
  const contributionPerOrder = netContribution / monthlyOrders;
  const isProfitable = netContribution > 0;

  // Theme styling helpers
  const cardBg = darkTheme ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-md";
  const subCardBg = darkTheme ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200";
  const mutedText = darkTheme ? "text-slate-400" : "text-slate-600";
  const labelText = darkTheme ? "text-slate-200" : "text-slate-800";

  return (
    <Card className={`${cardBg} transition-colors`}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-500" /> Medicine Delivery Unit Economics & Revenue Simulator
            </CardTitle>
            <CardDescription className={mutedText}>
              Adjust order volume, margins, fulfillment costs, and cross-sells to simulate financial performance.
            </CardDescription>
          </div>
          <Badge className={isProfitable ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-sm px-3 py-1 self-start" : "bg-rose-500/20 text-rose-400 border-rose-500/40 text-sm px-3 py-1 self-start"}>
            {isProfitable ? "PROFITABLE UNIT ECONOMICS" : "NEGATIVE CONTRIBUTION"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Sliders Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Slider 1: Monthly Orders */}
          <div className={`p-4 rounded-xl border ${subCardBg} space-y-3`}>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className={labelText}>Monthly Order Volume</span>
              <span className="text-emerald-500 font-mono font-bold text-base">{monthlyOrders.toLocaleString()} orders</span>
            </div>
            <Slider
              value={[monthlyOrders]}
              onValueChange={([val]) => setMonthlyOrders(val)}
              min={500}
              max={50000}
              step={500}
              className="py-2"
            />
            <span className={`text-[11px] ${mutedText} block`}>Scale from local neighborhood hub to city-wide operation</span>
          </div>

          {/* Slider 2: Average Order Value */}
          <div className={`p-4 rounded-xl border ${subCardBg} space-y-3`}>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className={labelText}>Avg Order Value (AOV)</span>
              <span className="text-emerald-500 font-mono font-bold text-base">₹{avgOrderValue}</span>
            </div>
            <Slider
              value={[avgOrderValue]}
              onValueChange={([val]) => setAvgOrderValue(val)}
              min={300}
              max={3000}
              step={50}
              className="py-2"
            />
            <span className={`text-[11px] ${mutedText} block`}>Chronic disease medicine baskets average ₹1,000+</span>
          </div>

          {/* Slider 3: Medicine Retail Margin */}
          <div className={`p-4 rounded-xl border ${subCardBg} space-y-3`}>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className={labelText}>Medicine Gross Margin</span>
              <span className="text-emerald-500 font-mono font-bold text-base">{medicineMargin}%</span>
            </div>
            <Slider
              value={[medicineMargin]}
              onValueChange={([val]) => setMedicineMargin(val)}
              min={10}
              max={35}
              step={1}
              className="py-2"
            />
            <span className={`text-[11px] ${mutedText} block`}>Pharma wholesale margins range between 15% - 30%</span>
          </div>

          {/* Slider 4: Delivery Fee */}
          <div className={`p-4 rounded-xl border ${subCardBg} space-y-3`}>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className={labelText}>Delivery Fee / Order</span>
              <span className="text-cyan-500 font-mono font-bold text-base">₹{deliveryFee}</span>
            </div>
            <Slider
              value={[deliveryFee]}
              onValueChange={([val]) => setDeliveryFee(val)}
              min={0}
              max={70}
              step={5}
              className="py-2"
            />
            <span className={`text-[11px] ${mutedText} block`}>Shipping fee charged to customer</span>
          </div>

          {/* Slider 5: Rider Payout */}
          <div className={`p-4 rounded-xl border ${subCardBg} space-y-3`}>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className={labelText}>Rider Payout / Order</span>
              <span className="text-amber-500 font-mono font-bold text-base">₹{riderPayout}</span>
            </div>
            <Slider
              value={[riderPayout]}
              onValueChange={([val]) => setRiderPayout(val)}
              min={20}
              max={80}
              step={5}
              className="py-2"
            />
            <span className={`text-[11px] ${mutedText} block`}>Direct courier payout per delivered package</span>
          </div>

          {/* Slider 6: Lab Test Cross-Sell */}
          <div className={`p-4 rounded-xl border ${subCardBg} space-y-3`}>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className={labelText}>Lab Test Cross-Sell</span>
              <span className="text-purple-400 font-mono font-bold text-base">{labCrossSellPct}%</span>
            </div>
            <Slider
              value={[labCrossSellPct]}
              onValueChange={([val]) => setLabCrossSellPct(val)}
              min={0}
              max={20}
              step={1}
              className="py-2"
            />
            <span className={`text-[11px] ${mutedText} block`}>Customers ordering lab diagnostic packages (high margin)</span>
          </div>
        </div>

        {/* Financial KPI Dashboard Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className={`p-5 rounded-2xl border ${subCardBg}`}>
            <span className={`text-xs ${mutedText} uppercase font-semibold tracking-wider block`}>Monthly GMV</span>
            <span className="text-2xl font-bold font-mono mt-1 block">₹{(totalGMV / 100000).toFixed(2)} Lakhs</span>
            <span className={`text-[11px] ${mutedText} mt-1 block`}>Total Order Value</span>
          </div>

          <div className={`p-5 rounded-2xl border ${subCardBg}`}>
            <span className={`text-xs ${mutedText} uppercase font-semibold tracking-wider block`}>Gross Platform Revenue</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">₹{(totalGrossRevenue / 100000).toFixed(2)} Lakhs</span>
            <span className={`text-[11px] ${mutedText} mt-1 block`}>Margins + Fees + Cross-sells</span>
          </div>

          <div className={`p-5 rounded-2xl border ${subCardBg}`}>
            <span className={`text-xs ${mutedText} uppercase font-semibold tracking-wider block`}>Fulfillment Overhead</span>
            <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">₹{(totalFulfillmentCost / 100000).toFixed(2)} Lakhs</span>
            <span className={`text-[11px] ${mutedText} mt-1 block`}>Riders + Cold Packaging + Pharmacists</span>
          </div>

          <div className={`p-5 rounded-2xl border ${isProfitable ? "border-emerald-500/30 bg-emerald-500/10" : "border-rose-500/30 bg-rose-500/10"}`}>
            <span className={`text-xs uppercase font-semibold tracking-wider block ${isProfitable ? "text-emerald-400" : "text-rose-400"}`}>Net Contribution (CM2)</span>
            <span className={`text-2xl font-bold font-mono mt-1 block ${isProfitable ? "text-emerald-400" : "text-rose-400"}`}>₹{(netContribution / 100000).toFixed(2)} Lakhs</span>
            <span className={`text-[11px] font-semibold mt-1 block ${isProfitable ? "text-emerald-400" : "text-rose-400"}`}>₹{contributionPerOrder.toFixed(1)} / order</span>
          </div>
        </div>

        {/* Detailed Breakdown Tables */}
        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-800 text-sm">
          {/* Revenue Stream Breakdown */}
          <div className="space-y-3">
            <h4 className="font-bold flex items-center gap-2 text-emerald-400">
              <Sparkles className="w-4 h-4" /> Revenue Inflow Breakdown
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span>Medicine Retail Margin ({medicineMargin}%)</span>
                <span className="font-mono font-bold text-white">₹{medicineGrossRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span>Shipping & Delivery Charges (₹{deliveryFee}/order)</span>
                <span className="font-mono font-bold text-white">₹{totalDeliveryRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span>Lab Test Commissions ({labCrossSellPct}% conversion)</span>
                <span className="font-mono font-bold text-purple-300">₹{labRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span>1mg Pro Subscriptions ({subscriptionPct}% adoption)</span>
                <span className="font-mono font-bold text-cyan-300">₹{subscriptionRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Fulfillment Cost Breakdown */}
          <div className="space-y-3">
            <h4 className="font-bold flex items-center gap-2 text-amber-400">
              <Truck className="w-4 h-4" /> Operations Cost Breakdown
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span>Rider Logistics Payouts (₹{riderPayout}/order)</span>
                <span className="font-mono font-bold text-white">₹{totalRiderCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span>Cold-Chain Packaging & Insulated Gel Packs</span>
                <span className="font-mono font-bold text-white">₹{totalPackagingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span>Pharmacist Audit & Compliance Fees</span>
                <span className="font-mono font-bold text-white">₹{totalAuditCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
