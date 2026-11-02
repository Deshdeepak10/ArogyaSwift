import { LovableHeader } from "@/components/LovableHeader";
import { LovableFooter } from "@/components/LovableFooter";
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <LovableHeader activeRole="none" />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header Banner */}
        <div className="border-b border-slate-200 pb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>DPDP Act 2023 & CDSCO Compliance Certified</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Last Updated: November 2026 · ArogyaSwift Healthcare Marketplace Intermediary
          </p>
        </div>

        {/* Core Policy Content */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-8 text-sm leading-relaxed text-slate-700">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-emerald-700" />
              </div>
              <h2>1. Zero-Knowledge Delivery Partner Policy</h2>
            </div>
            <p>
              ArogyaSwift enforces an uncompromising <strong>Zero-Knowledge Privacy Safeguard</strong> for all delivery runs. Delivery riders and external logistics partners <strong>never receive access to medicine names, quantities, therapeutic indications, or doctor prescriptions</strong>.
            </p>
            <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              Riders are provided solely with a sealed tamper-evident parcel code (e.g., <code>Parcel 1 of 2 sealed</code>), pharmacy counter pickup instructions, and destination GPS coordinates.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <EyeOff className="w-4 h-4 text-emerald-700" />
              </div>
              <h2>2. Prescription Authorization Scope & Encryption</h2>
            </div>
            <p>
              When you upload a medical prescription (photo or PDF), it is encrypted in transit using TLS 1.3 and at rest with AES-256 encryption. Prescriptions are shared <strong>strictly and exclusively with licensed pharmacies you have selected</strong> to receive stock quotes from.
            </p>
            <p>
              Under no circumstances are medical documents monetized, shared with third-party advertising networks, or accessible to non-pharmacy personnel.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-emerald-700" />
              </div>
              <h2>3. Regulatory Pharmacy Audits (CDSCO Compliance)</h2>
            </div>
            <p>
              In accordance with the Indian Drugs and Cosmetics Act (1940) and Telemedicine Practice Guidelines, all requests for Schedule H, H1, and X medications require verification by a registered pharmacist holding a valid State Pharmacy Council license. Pharmacist verification records (audit timestamps and license stamps) are securely retained in an encrypted ledger for regulatory reporting.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <h2>4. Your Rights Under DPDP Act 2023</h2>
            </div>
            <p>
              Under India’s Digital Personal Data Protection (DPDP) Act, 2023, you maintain complete ownership over your personal data. You have the statutory right to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Request an export of all your prescription uploads, quotation records, and order history.</li>
              <li>Request correction or rectification of any incomplete or inaccurate personal data.</li>
              <li>Request immediate permanent erasure of your account, delivery addresses, and medical documents.</li>
              <li>Withdraw consent for optional analytics or marketing communications at any time.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-emerald-700" />
              </div>
              <h2>5. Contact Our Data Protection Officer (DPO)</h2>
            </div>
            <p>
              If you have any questions, grievances, or requests regarding this Privacy Policy or your healthcare data, please contact our designated Grievance Officer:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs space-y-1 text-slate-600">
              <p><strong>Grievance & Data Protection Officer:</strong> ArogyaSwift Regulatory & Compliance Cell</p>
              <p><strong>Email:</strong> privacy@arogyaswift.in</p>
              <p><strong>Fulfillment Node:</strong> Indiranagar Hub, Bengaluru, Karnataka 560038</p>
            </div>
          </section>
        </div>
      </main>
      <LovableFooter />
    </div>
  );
}

