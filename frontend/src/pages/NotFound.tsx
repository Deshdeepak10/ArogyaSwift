import { useLocation } from "wouter";
import { LovableHeader } from "@/components/LovableHeader";
import { LovableFooter } from "@/components/LovableFooter";
import {
  Home,
  User,
  Store,
  Bike,
  Shield,
  HelpCircle,
  Search,
  ArrowRight,
  PhoneCall
} from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <LovableHeader activeRole="none" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center justify-center text-center space-y-8">
        {/* Visual Badge */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-emerald-50 text-[#065F46] flex items-center justify-center font-black text-4xl shadow-md border border-emerald-200">
            404
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
            Not Found
          </span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-3 max-w-md">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Prescription or Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The page, quotation, or delivery run you are attempting to access has expired, moved, or does not exist. Choose one of our verified portals below:
          </p>
        </div>

        {/* 4 Quick Portal Recovery Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full max-w-xl text-left">
          {/* 1. Patient */}
          <button
            onClick={() => setLocation("/patient")}
            className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-[#065F46] group-hover:text-white transition-colors">
              <User className="w-4 h-4" />
            </div>
            <div className="mt-4">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Patient</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Order medicines</p>
            </div>
          </button>

          {/* 2. Pharmacy */}
          <button
            onClick={() => setLocation("/pharmacy")}
            className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-[#065F46] group-hover:text-white transition-colors">
              <Store className="w-4 h-4" />
            </div>
            <div className="mt-4">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Pharmacy</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Partner portal</p>
            </div>
          </button>

          {/* 3. Rider */}
          <button
            onClick={() => setLocation("/delivery")}
            className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-[#065F46] group-hover:text-white transition-colors">
              <Bike className="w-4 h-4" />
            </div>
            <div className="mt-4">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Rider</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Delivery runs</p>
            </div>
          </button>

          {/* 4. Admin */}
          <button
            onClick={() => setLocation("/admin")}
            className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-[#065F46] group-hover:text-white transition-colors">
              <Shield className="w-4 h-4" />
            </div>
            <div className="mt-4">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Admin</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Control center</p>
            </div>
          </button>
        </div>

        {/* Return to Home & Emergency Support */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
          <button
            onClick={() => setLocation("/")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#044E39] text-white font-bold transition-all shadow-xs cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>

          <a
            href="mailto:support@arogyaswift.in"
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
            <span>Need emergency order assistance?</span>
          </a>
        </div>
      </main>

      <LovableFooter />
    </div>
  );
}
