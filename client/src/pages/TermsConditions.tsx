import { LovableHeader } from "@/components/LovableHeader";
import { LovableFooter } from "@/components/LovableFooter";
import { Scale, AlertTriangle, ShieldCheck, CheckCircle2, Truck, RefreshCw } from "lucide-react";

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <LovableHeader activeRole="none" />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header Banner */}
        <div className="border-b border-slate-200 pb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
            <Scale className="w-4 h-4 text-emerald-700" />
            <span>Marketplace Terms & Service Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Effective Date: November 2026 · Compliant with IT Act 2000 & Consumer Protection E-Commerce Rules
          </p>
        </div>

        {/* Core Terms Content */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-8 text-sm leading-relaxed text-slate-700">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-emerald-700" />
              </div>
              <h2>1. Marketplace Intermediary Status & Disclaimer</h2>
            </div>
            <p>
              ArogyaSwift is an electronic technology platform operating as an <strong>intermediary</strong> as defined under Section 2(1)(w) of the Information Technology Act, 2000. ArogyaSwift connects healthcare consumers with independent, state-licensed retail medical stores.
            </p>
            <p className="text-slate-600 bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 text-amber-950">
              <strong>Notice:</strong> ArogyaSwift does not manufacture, repackage, stock, wholesale, or directly sell medicines. Every sale is an independent contract solely between the participating licensed chemist and the buyer.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </div>
              <h2>2. Mandatory Prescription Verification Requirements</h2>
            </div>
            <p>
              In strict adherence to the Drugs and Cosmetics Act (1940), Drugs and Cosmetics Rules (1945), and the Pharmacy Act (1948):
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>All Schedule H, H1, and X medicines require a legible, valid prescription issued by a Registered Medical Practitioner (RMP).</li>
              <li>A registered pharmacist at the fulfilling pharmacy must clinically inspect and approve the prescription before dispensing.</li>
              <li>The fulfilling chemist reserves the legal right to decline dispensation or offer generic equivalents if the prescribed brand is out of stock.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-emerald-700" />
              </div>
              <h2>3. Multi-Pharmacy Aggregation & Logistics Fees</h2>
            </div>
            <p>
              When a patient's medicine basket requires sourcing from more than one pharmacy, ArogyaSwift coordinates a single, consolidated delivery run:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Delivery Fee:</strong> ₹30 for the initial pharmacy pickup + ₹15 for each additional pharmacy stop.</li>
              <li><strong>Platform Technology Fee:</strong> Flat ₹10 per completed multi-pharmacy order.</li>
              <li><strong>Doorstep Delivery OTP:</strong> All prescription orders require customer verbal confirmation of the 4-digit OTP before the rider releases sealed parcels.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 text-emerald-700" />
              </div>
              <h2>4. Cancellation, Replacement & Refund Policy</h2>
            </div>
            <p>
              Given the statutory nature of healthcare products:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Orders may be cancelled freely before pharmacy quotation acceptance or prescription sign-off.</li>
              <li>Once sealed parcels are dispatched with the delivery partner, cancellations are restricted unless the tamper-evident seal is damaged.</li>
              <li>Damaged or incorrect medicine claims must be reported within 24 hours of delivery with photographic evidence of the tamper seal. Approved refunds are credited to the original payment source within 3–5 banking business days.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <h2>5. Jurisdiction & Dispute Resolution</h2>
            </div>
            <p>
              These terms are governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka.
            </p>
          </section>
        </div>
      </main>
      <LovableFooter />
    </div>
  );
}

