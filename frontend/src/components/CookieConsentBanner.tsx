import { useState, useEffect } from "react";
import { Cookie, Check, X, Shield, Settings } from "lucide-react";
import { useLocation } from "wouter";

export function CookieConsentBanner() {
  const [, setLocation] = useLocation();
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("arogyaswift_cookie_consent");
      if (!consent) {
        setShowBanner(true);
      }
    } catch {
      // Storage access disabled
    }

    const handleOpenBanner = () => {
      setShowBanner(true);
      setShowCustomize(true);
    };

    window.addEventListener("arogyaswift_open_cookie_settings", handleOpenBanner);
    return () => window.removeEventListener("arogyaswift_open_cookie_settings", handleOpenBanner);
  }, []);

  const saveConsent = (level: "all" | "essential") => {
    try {
      localStorage.setItem("arogyaswift_cookie_consent", level);
      window.dispatchEvent(
        new CustomEvent("arogyaswift_consent_update", { detail: { level } })
      );
    } catch {
      // ignore
    }
    setShowBanner(false);
    setShowCustomize(false);
  };

  const handleCustomSave = () => {
    saveConsent(analyticsConsent ? "all" : "essential");
  };

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent Banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 text-slate-900 font-sans"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#065F46] flex items-center justify-center shrink-0 border border-emerald-200">
          <Cookie className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-slate-900">Cookie & Privacy Preferences</h2>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-600 leading-normal">
            We use essential cookies to maintain secure sessions, multi-role auth, and prescription access controls. You can optionally allow privacy-preserving analytics to help optimize delivery routing.
          </p>
        </div>
      </div>

      {showCustomize && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                <span>Strictly Necessary Cookies</span>
              </div>
              <p className="text-[11px] text-slate-500">Authentication, OTP handoff & session security</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              Required
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">Performance & Analytics</div>
              <p className="text-[11px] text-slate-500">Anonymous load time & delivery route telemetry</p>
            </div>
            <input
              type="checkbox"
              checked={analyticsConsent}
              onChange={(e) => setAnalyticsConsent(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 flex-wrap">
        {showCustomize ? (
          <button
            onClick={handleCustomSave}
            className="flex-1 py-2.5 px-4 bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        ) : (
          <>
            <button
              onClick={() => saveConsent("all")}
              className="flex-1 py-2 px-3 bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept All</span>
            </button>
            <button
              onClick={() => saveConsent("essential")}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              <span>Essential Only</span>
            </button>
            <button
              onClick={() => setShowCustomize(true)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Customize Preferences"
            >
              <Settings className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-2 pt-0.5">
        <button
          onClick={() => setLocation("/privacy")}
          className="hover:underline text-emerald-700 font-medium cursor-pointer"
        >
          Privacy Policy
        </button>
        <span>•</span>
        <button
          onClick={() => setLocation("/terms")}
          className="hover:underline text-emerald-700 font-medium cursor-pointer"
        >
          Terms of Service
        </button>
      </div>
    </aside>
  );
}

