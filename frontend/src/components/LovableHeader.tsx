import { useLocation } from "wouter";
import { User, Store, Bike, Shield, Plus, LogOut, LogIn, UserPlus } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { NotificationCenter } from "@/components/NotificationCenter";
import { toast } from "sonner";

function GoogleLogo({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

interface HeaderProps {
  activeRole?: "patient" | "customer" | "pharmacy" | "delivery" | "admin" | "none";
}

export function LovableHeader({ activeRole = "none" }: HeaderProps) {
  const [, setLocation] = useLocation();
  const {
    user,
    isAuthenticated,
    loginAsRole,
    logout,
    openRoleAuth
  } = useAuth();

  const handleRoleSwitch = (role: "patient" | "pharmacy" | "delivery" | "admin") => {
    if (role === "patient") {
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

  const handleLogout = async () => {
    await logout();
    toast.info("Signed out from ArogyaSwift");
    setLocation("/");
  };

  const isPatientActive = activeRole === "patient" || activeRole === "customer";

  const getTargetRoleName = (): "patient" | "pharmacy" | "delivery" | "admin" => {
    if (activeRole === "pharmacy") return "pharmacy";
    if (activeRole === "delivery") return "delivery";
    if (activeRole === "admin") return "admin";
    return "patient";
  };

  const targetRole = getTargetRoleName();

  const getRoleAuthButtonLabel = () => {
    if (activeRole === "pharmacy") return "Chemist Sign In / Register";
    if (activeRole === "delivery") return "Rider Sign In / Register";
    if (activeRole === "admin") return "Admin Access";
    return "Patient Sign In / Register";
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#065F46] text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-[#044E39] transition-colors">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 text-lg tracking-tight leading-none">
              ArogyaSwift
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Cloudflare Edge • Verified Local Chemist
            </span>
          </div>
        </button>

        {/* Center: 4 Strictly Separated Roles */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60 text-xs">
          <span className="text-slate-400 font-semibold px-2 hidden sm:inline uppercase text-[10px] tracking-wider">
            Role
          </span>

          {/* 1. PATIENT */}
          <button
            onClick={() => handleRoleSwitch("patient")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              isPatientActive
                ? "bg-white text-emerald-800 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-700" />
            <span>Patient</span>
          </button>

          {/* 2. PHARMACY */}
          <button
            onClick={() => handleRoleSwitch("pharmacy")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              activeRole === "pharmacy"
                ? "bg-white text-emerald-800 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pharmacy</span>
          </button>

          {/* 3. DELIVERY */}
          <button
            onClick={() => handleRoleSwitch("delivery")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              activeRole === "delivery"
                ? "bg-white text-emerald-800 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-emerald-700" />
            <span>Delivery</span>
          </button>

          {/* 4. ADMIN */}
          <button
            onClick={() => handleRoleSwitch("admin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              activeRole === "admin"
                ? "bg-white text-emerald-800 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>Admin</span>
          </button>
        </div>

        {/* Right: Notifications, Dedicated Role Auth & Profile Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Real-time In-App Notification Center */}
          <NotificationCenter />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div
                onClick={() => openRoleAuth(user.role === "rider" ? "delivery" : user.role, "login")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-slate-100 cursor-pointer transition-all"
                title="Account Profile & Session"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold border border-emerald-200 overflow-hidden relative">
                  {user.avatar && user.avatar.startsWith("http") ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name ? user.name.slice(0, 1).toUpperCase() : "U"}</span>
                  )}
                  {user.isGoogleUser && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-xs">
                      <GoogleLogo className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[120px] flex items-center gap-1">
                    {user.name}
                    {user.isGoogleUser && <GoogleLogo className="w-2.5 h-2.5 inline shrink-0" />}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-100"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openRoleAuth(targetRole, "login")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{getRoleAuthButtonLabel()}</span>
              </button>

              <button
                onClick={() => openRoleAuth(targetRole, "register")}
                title="Register New Account"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
