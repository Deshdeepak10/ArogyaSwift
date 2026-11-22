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
  LogIn,
  UserPlus
} from "lucide-react";

export default function LoginHome() {
  const [, setLocation] = useLocation();
  const { loginAsRole, openRoleAuth } = useAuth();

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
              Pilot · Indiranagar, Bengaluru • Real-time Notifications Enabled
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
                onClick={() => openRoleAuth("pharmacy", "login")}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-emerald-100 hover:text-white hover:bg-emerald-800/60 transition-all text-sm border border-emerald-700/60 cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Chemist Sign In / Register</span>
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
              User Portals & Dedicated Accounts
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Select your role to sign in, create a dedicated account, or test the live workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Patient Role Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Patient Portal</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Upload prescription, verify extracted medicine names, receive quotes from nearby chemists, and track drops with delivery OTP.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => openRoleAuth("patient", "login")}
                  className="w-full py-2.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Patient Sign In / Register</span>
                </button>
                <button
                  onClick={() => handleRoleNavigation("patient")}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Patient View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. Pharmacy Role Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Pharmacy Chemist</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Licensed chemists review prescriptions, verify medicine inventory, submit itemised price quotes, and hand over sealed bags.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => openRoleAuth("pharmacy", "login")}
                  className="w-full py-2.5 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Chemist Sign In / Register</span>
                </button>
                <button
                  onClick={() => handleRoleNavigation("pharmacy")}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Pharmacy Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. Delivery Partner Role Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Delivery Partner</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Riders aggregate multi-pickup stops across Indiranagar, verify tamper-evident bags via pickup OTP, and complete doorstep delivery.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => openRoleAuth("delivery", "login")}
                  className="w-full py-2.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Rider Sign In / Register</span>
                </button>
                <button
                  onClick={() => handleRoleNavigation("delivery")}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Delivery App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4. Admin Role Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Admin Console</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Live operational oversight, cold-chain temperature telemetry, CDSCO drug license auditing, and centralized fleet dispatch.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => openRoleAuth("admin", "login")}
                  className="w-full py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Console Access</span>
                </button>
                <button
                  onClick={() => handleRoleNavigation("admin")}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Admin View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LovableFooter />
    </div>
  );
}
