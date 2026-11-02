import { useLocation } from "wouter";
import { ShieldCheck, Lock, Cookie, Scale } from "lucide-react";

export function LovableFooter() {
  const [, setLocation] = useLocation();

  const handleOpenCookieSettings = () => {
    window.dispatchEvent(new Event("arogyaswift_open_cookie_settings"));
  };

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-xs text-slate-600 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Top: Legal Links & Regulatory Compliance */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">
              ArogyaSwift
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              CDSCO Verified Retail Chemist Network
            </span>
          </div>

          <nav aria-label="Footer Navigation" className="flex items-center gap-4 text-xs font-medium flex-wrap justify-center">
            <button
              onClick={() => setLocation("/privacy")}
              className="hover:text-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Privacy Policy</span>
            </button>
            <button
              onClick={() => setLocation("/terms")}
              className="hover:text-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Scale className="w-3 h-3 text-slate-400" />
              <span>Terms & Conditions</span>
            </button>
            <button
              onClick={handleOpenCookieSettings}
              className="hover:text-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Cookie className="w-3 h-3 text-slate-400" />
              <span>Cookie Preferences</span>
            </button>
          </nav>
        </div>

        {/* Bottom Disclaimer Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} ArogyaSwift Healthcare Technologies. Compliant with Drugs and Cosmetics Act & DPDP Act 2023.
          </p>
          <div className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
            <span>⚠️</span>
            <span>Demo Prototype: Medicines & pharmacy profiles are mock data for platform demonstration.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
