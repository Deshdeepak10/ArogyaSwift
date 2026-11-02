import { useLocation } from "wouter";
import { LovableHeader } from "@/components/LovableHeader";
import { LovableFooter } from "@/components/LovableFooter";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  PackageCheck,
  User,
  Store,
  Bike,
  Shield,
  FileText
} from "lucide-react";

export default function LoginHome() {
  const [, setLocation] = useLocation();
  const { loginAsRole, setIsAuthModalOpen } = useAuth();

  const handleRoleNavigation = (role: "patient" | "pharmacy" | "delivery" | "admin" | "customer") => {
    if (role === "patient" || role === "customer") {
      loginAsRole("patient");
      setLocation("/patient");
    } else if (role === "pharmacy") {
      loginAsRole("pharmacy");
      setLocation("/pharmacy");
    } else if (role === "delivery") {
      loginAsRole("rider");
      setLocation("/delivery");
    } else if (role === "admin") {
      loginAsRole("admin");
      setLocation("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <LovableHeader activeRole="none" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Hero Section */}
        <div className="bg-[#065F46] rounded-2xl text-white p-8 sm:p-12 shadow-xl shadow-emerald-950/10 relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 pointer-events-none" />
          <div className="absolute right-40 -bottom-20 w-60 h-60 rounded-full bg-emerald-400/10 pointer-events-none" />

          <div className="max-w-3xl relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-emerald-800/80 border border-emerald-600/40 text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Pilot · Indiranagar, Bengaluru • Google Authentication Verified
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Medicines from your neighbourhood pharmacies
            </h1>

            <p className="text-base sm:text-xl text-emerald-100 font-normal leading-relaxed max-w-2xl">
              Independent local chemists, reviewed by real pharmacists, delivered together in one trip.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              {/* Single Clear Dominant CTA */}
              <button
                onClick={() => handleRoleNavigation("patient")}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-extrabold bg-[#DCFCE7] text-[#065F46] hover:bg-white transition-all shadow-lg hover:shadow-xl active:scale-[0.98] text-base sm:text-lg cursor-pointer border border-emerald-300 group"
              >
                <span>Order Medicines Now</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Subordinated Partner Login Action */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-emerald-100 hover:text-white hover:bg-emerald-800/60 transition-all text-sm border border-emerald-700/60 cursor-pointer"
              >
                <span>Chemist & Partner Sign In</span>
              </button>
            </div>
          </div>

          {/* 3 Value Pillars */}
          <div className="mt-12 pt-8 border-t border-emerald-700/60 grid grid-cols-1 md:grid-cols-3 gap-6 text-emerald-100 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <span>Pharmacist review</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200/90 leading-normal">
                Every request verified against prescription by a licensed chemist before payment.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                <Lock className="w-5 h-5 text-emerald-300" />
                <span>Private by design</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200/90 leading-normal">
                Chemists see only prescription lines. Delivery partners see no medicine names.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                <PackageCheck className="w-5 h-5 text-emerald-300" />
                <span>One delivery</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200/90 leading-normal">
                Multiple pharmacies combined into a single scheduled drop to your door.
              </p>
            </div>
          </div>
        </div>

        {/* Explore By Role Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Explore the platform by role
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Switch roles anytime from the top bar to test each workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Patient Role Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Patient</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Upload a prescription or search medicines, receive quotes from nearby chemists, and track delivery with a secure OTP.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRoleNavigation("patient")}
                className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-700 font-semibold text-xs border border-slate-200/80 group-hover:border-emerald-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Patient View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pharmacy Role Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Pharmacy</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Review incoming prescriptions, verify stock, quote prices, and dispatch via in-house rider or shared partner.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRoleNavigation("pharmacy")}
                className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-700 font-semibold text-xs border border-slate-200/80 group-hover:border-emerald-600 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Open Pharmacy Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Delivery Partner Role Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Delivery partner</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Route multi-pickup runs across Indiranagar, verify order bags, and complete contact-free drops.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRoleNavigation("delivery")}
                className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-700 font-semibold text-xs border border-slate-200/80 group-hover:border-emerald-600 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Open Delivery App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Admin Role Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Admin</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Live operations oversight, pharmacy verification roster, partner dispatch, and compliance tracking.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRoleNavigation("admin")}
                className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-700 font-semibold text-xs border border-slate-200/80 group-hover:border-emerald-600 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Open Admin Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <LovableFooter />
    </div>
  );
}
