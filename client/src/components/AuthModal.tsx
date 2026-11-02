import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import {
  saveGoogleClientId,
  getGoogleClientId,
  isGoogleAuthConfigured,
  renderOfficialGoogleButton
} from "@/lib/googleAuth";
import {
  User,
  Building2,
  Bike,
  ShieldCheck,
  ArrowRight,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Settings,
  Sparkles,
  Globe,
  LogIn
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { PhoneSignupSchema, PharmacyRegisterSchema } from "@shared/schemas";

function GoogleLogo({ className = "w-4 h-4" }: { className?: string }) {
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

export function AuthModal() {
  const [, setLocation] = useLocation();
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginAsRole,
    loginWithGoogle,
    registerWithGoogle,
    applyGoogleProfile,
    isGoogleReady,
    registerPharmacyStore,
    registerUserWithPhone
  } = useAuth();

  const [mainTab, setMainTab] = useState<"google" | "roles" | "config">("google");
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Render official Google button when modal opens
  useEffect(() => {
    if (isAuthModalOpen && mainTab === "google" && googleBtnRef.current) {
      renderOfficialGoogleButton(
        googleBtnRef.current,
        (profile) => {
          applyGoogleProfile(profile, selectedRole);
          toast.success(`Welcome, ${profile.displayName}! Signed in with Google.`);
          setIsAuthModalOpen(false);
          navigateRole(selectedRole);
        },
        (err) => {
          console.warn("Official Google button error:", err);
        }
      );
    }
  }, [isAuthModalOpen, mainTab, selectedRole]);

  // In-browser Google Configuration State
  const [customGoogleClientId, setCustomGoogleClientId] = useState(getGoogleClientId() || "");

  // Role Form States
  const [activeRole, setActiveRole] = useState<UserRole>("patient");

  // Patient Login Form State
  const [patientData, setPatientData] = useState({
    name: "Sarah Chen",
    phone: "9876543210",
    email: "sarah.chen@example.com",
    address: "Shipra Sun City, Indirapuram, Ghaziabad",
    otp: "7392"
  });

  // Pharmacy Login Form State
  const [pharmacyData, setPharmacyData] = useState({
    ownerName: "Pharm. Priya Nair",
    shopName: "Apollo Express Pharmacy (Raj Nagar, Ghaziabad)",
    licenseNo: "UP-2021-00921",
    category: "Cold-Chain Certified Retail",
    address: "Kavi Nagar Main Rd, Ghaziabad",
    phone: "9876511223",
    email: "hub.ghaziabad@apollopharmacy.in",
    coldChainVerified: true
  });

  // Rider Login Form State
  const [riderData, setRiderData] = useState({
    name: "Vikram Singh",
    phone: "9876599887",
    email: "vikram.rider@arogyaswift.in",
    vehicleType: "EV Scooter (Cold Storage Box)",
    vehicleNo: "UP-14-EV-8821",
    location: "Ghaziabad Central Zone",
    equipmentVerified: true
  });

  // Launch Google Sign In
  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);

    const safetyWatchdog = setTimeout(() => {
      setIsSigningIn(false);
    }, 12000);

    try {
      const profile = await loginWithGoogle(selectedRole);
      clearTimeout(safetyWatchdog);
      toast.success(`Welcome, ${profile.displayName}! Signed in with Google.`);
      setIsAuthModalOpen(false);
      navigateRole(selectedRole);
    } catch (err: any) {
      clearTimeout(safetyWatchdog);
      console.warn("Google sign in issue:", err);
      toast.error(err.message || "Google popup was closed or blocked. Check popup settings in your browser.");
    } finally {
      setIsSigningIn(false);
    }
  };

  // Launch Google Sign Up / Register
  const handleGoogleSignUp = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);

    const safetyWatchdog = setTimeout(() => {
      setIsSigningIn(false);
    }, 12000);

    try {
      const profile = await registerWithGoogle(selectedRole);
      clearTimeout(safetyWatchdog);
      toast.success(`Account registered with Google for ${profile.displayName}!`);
      setIsAuthModalOpen(false);
      navigateRole(selectedRole);
    } catch (err: any) {
      clearTimeout(safetyWatchdog);
      console.warn("Google registration issue:", err);
      toast.error(err.message || "Google registration was cancelled or failed");
    } finally {
      setIsSigningIn(false);
    }
  };

  // Save custom Google Client ID
  const handleSaveGoogleKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (customGoogleClientId.trim().length < 10) {
      toast.error("Please enter a valid Google Client ID (from Google Cloud Console)");
      return;
    }
    saveGoogleClientId(customGoogleClientId.trim());
    toast.success("Google Client ID saved! Ready for Google Sign-In.");
    setMainTab("google");
  };

  const navigateRole = (role: UserRole) => {
    if (role === "patient" || role === "customer") setLocation("/patient");
    else if (role === "pharmacy") setLocation("/pharmacy");
    else if (role === "rider") setLocation("/delivery");
    else if (role === "admin") setLocation("/admin");
  };

  // Quick Demo Phone Auth submit
  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = PhoneSignupSchema.safeParse({
      name: patientData.name,
      phone: patientData.phone,
      role: "patient",
      locationPin: patientData.address
    });
    if (!val.success) {
      toast.error(val.error.issues[0]?.message || "Invalid patient information");
      return;
    }
    registerUserWithPhone({
      name: val.data.name,
      phone: val.data.phone,
      role: "patient",
      email: patientData.email,
      location: patientData.address
    });
    toast.success(`Patient profile loaded for ${patientData.name}!`);
    setIsAuthModalOpen(false);
    setLocation("/patient");
  };

  // Quick Demo Pharmacy Auth submit
  const handlePharmacySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = PharmacyRegisterSchema.safeParse({
      ownerName: pharmacyData.ownerName,
      shopName: pharmacyData.shopName,
      licenseNo: pharmacyData.licenseNo,
      phone: pharmacyData.phone,
      email: pharmacyData.email,
      category: pharmacyData.category,
      address: pharmacyData.address
    });
    if (!val.success) {
      toast.error(val.error.issues[0]?.message || "Invalid pharmacy data");
      return;
    }
    registerPharmacyStore({
      ownerName: val.data.ownerName,
      shopName: val.data.shopName,
      licenseNo: val.data.licenseNo,
      category: val.data.category,
      address: val.data.address,
      phone: val.data.phone,
      email: val.data.email,
      coldChainReady: pharmacyData.coldChainVerified
    });
    toast.success(`Pharmacy verified: ${pharmacyData.shopName}`);
    setIsAuthModalOpen(false);
    setLocation("/pharmacy");
  };

  // Quick Demo Rider Auth submit
  const handleRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = PhoneSignupSchema.safeParse({
      name: riderData.name,
      phone: riderData.phone,
      role: "rider",
      vehicleType: riderData.vehicleType
    });
    if (!val.success) {
      toast.error(val.error.issues[0]?.message || "Invalid rider info");
      return;
    }
    registerUserWithPhone({
      name: val.data.name,
      phone: val.data.phone,
      role: "rider",
      email: riderData.email,
      vehicleType: val.data.vehicleType,
      location: riderData.location
    });
    toast.success(`Delivery shift active for ${riderData.name}!`);
    setIsAuthModalOpen(false);
    setLocation("/delivery");
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
      <DialogContent className="sm:max-w-xl bg-white border-slate-200 text-slate-900 shadow-2xl rounded-3xl p-0 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 p-6 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>ArogyaSwift Authentication</span>
                </DialogTitle>
                <DialogDescription className="text-emerald-100 text-xs mt-0.5 font-medium flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-white font-semibold">
                    <GoogleLogo className="w-3.5 h-3.5" /> Sign in with Google
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-cyan-200">
                    <Globe className="w-3 h-3" /> Universal Portal Access
                  </span>
                </DialogDescription>
              </div>
            </div>
            <Badge className="bg-emerald-500/30 text-emerald-100 border-emerald-400/40 text-[11px] font-bold py-1 px-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" /> Google OAuth 2.0
            </Badge>
          </div>

          {/* Top navigation tabs between Google & Role Presets */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-white/15">
            <button
              onClick={() => setMainTab("google")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mainTab === "google"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <GoogleLogo className="w-3.5 h-3.5" />
              <span>Google Auth</span>
            </button>
            <button
              onClick={() => setMainTab("roles")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mainTab === "roles"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Demo / Role Presets</span>
            </button>
            <button
              onClick={() => setMainTab("config")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer ${
                mainTab === "config"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              title="Google API Settings"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Google API</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: GOOGLE AUTHENTICATION */}
          {mainTab === "google" && (
            <div className="space-y-5">
              {/* Google Benefits Banner */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <GoogleLogo className="w-3.5 h-3.5" />
                    Fast, Secure Google Authentication
                  </p>
                  <p className="text-emerald-700 mt-0.5 leading-relaxed">
                    Sign in or register using your verified Google Account with one click. Works across desktop and mobile devices.
                  </p>
                </div>
              </div>

              {/* Target Portal Role Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Select Portal to Enter with Google:</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "patient", label: "Patient", icon: User },
                    { id: "pharmacy", label: "Pharmacy", icon: Building2 },
                    { id: "rider", label: "Rider", icon: Bike },
                    { id: "admin", label: "Admin", icon: ShieldCheck }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedRole === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedRole(item.id as UserRole)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-600" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Google Actions */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-300 font-extrabold py-5 rounded-2xl shadow-xs text-sm flex items-center justify-center gap-3 cursor-pointer transition-all"
                >
                  <GoogleLogo className="w-5 h-5" />
                  <span>
                    {isSigningIn ? "Connecting to Google..." : `Sign In with Google as ${selectedRole.toUpperCase()}`}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
                </Button>

                {/* Connecting Helper & Cancel Option */}
                {isSigningIn && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-center">
                    <p className="text-xs text-amber-800 font-semibold">
                      Waiting for Google Sign-In popup...
                    </p>
                    <p className="text-[11px] text-amber-700">
                      If no popup appeared, check if your browser blocked popups in the URL address bar.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsSigningIn(false)}
                        className="text-xs font-bold text-slate-700 hover:text-slate-900 underline cursor-pointer"
                      >
                        Cancel
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSigningIn(false);
                          loginAsRole(selectedRole);
                          toast.success(`Entered as Demo ${selectedRole.toUpperCase()}`);
                          setIsAuthModalOpen(false);
                          navigateRole(selectedRole);
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                      >
                        Skip with instant demo &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* Official Google One-Tap / Native Button */}
                <div className="pt-1">
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-white px-2 text-slate-400 font-bold">Or One-Tap with Google</span>
                    </div>
                  </div>
                  <div className="flex justify-center min-h-[44px]">
                    <div ref={googleBtnRef} className="flex justify-center" />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleGoogleSignUp}
                  disabled={isSigningIn}
                  className="w-full border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 font-bold text-xs py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <GoogleLogo className="w-4 h-4" />
                  <span>Register New Account with Google</span>
                </Button>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>Want to test quickly?</span>
                  <button
                    onClick={() => {
                      setIsSigningIn(false);
                      loginAsRole(selectedRole);
                      toast.success(`Entered as Demo ${selectedRole.toUpperCase()}`);
                      setIsAuthModalOpen(false);
                      navigateRole(selectedRole);
                    }}
                    className="text-emerald-700 hover:underline font-semibold cursor-pointer"
                  >
                    Skip with instant demo account &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEMO & PRESET ROLES */}
          {mainTab === "roles" && (
            <div className="space-y-5">
              <Tabs value={activeRole} onValueChange={(val) => setActiveRole(val as UserRole)} className="w-full">
                <TabsList className="grid grid-cols-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                  <TabsTrigger
                    value="patient"
                    className="rounded-xl font-extrabold text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <User className="w-4 h-4" /> Patient
                  </TabsTrigger>
                  <TabsTrigger
                    value="pharmacy"
                    className="rounded-xl font-extrabold text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Building2 className="w-4 h-4" /> Pharmacy
                  </TabsTrigger>
                  <TabsTrigger
                    value="rider"
                    className="rounded-xl font-extrabold text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Bike className="w-4 h-4" /> Rider
                  </TabsTrigger>
                </TabsList>

                {/* PATIENT TAB */}
                <TabsContent value="patient" className="mt-4 space-y-4">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-emerald-900">Patient Demo Account</h4>
                      <p className="text-[11px] text-emerald-700">Sarah Chen • +91 98765 43210</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        loginAsRole("patient");
                        toast.success("Signed in with demo patient account!");
                        setIsAuthModalOpen(false);
                        setLocation("/patient");
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                    >
                      Instant Sign In
                    </Button>
                  </div>

                  <form onSubmit={handlePatientSubmit} className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700">Patient Name</Label>
                        <Input
                          value={patientData.name}
                          onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                          className="bg-slate-50 border-slate-300 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700">Mobile Phone</Label>
                        <Input
                          value={patientData.phone}
                          onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                          className="bg-slate-50 border-slate-300 text-sm font-mono"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-[#065F46] hover:bg-[#044E39] text-white font-bold py-4 rounded-xl text-xs">
                      Enter Patient Portal
                    </Button>
                  </form>
                </TabsContent>

                {/* PHARMACY TAB */}
                <TabsContent value="pharmacy" className="mt-4 space-y-4">
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-amber-900">Apollo Express Pharmacy</h4>
                      <p className="text-[11px] text-amber-700">UP-2021-00921 • Cold-Chain Certified</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        loginAsRole("pharmacy");
                        toast.success("Signed in with demo pharmacy account!");
                        setIsAuthModalOpen(false);
                        setLocation("/pharmacy");
                      }}
                      className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs"
                    >
                      Instant Sign In
                    </Button>
                  </div>

                  <form onSubmit={handlePharmacySubmit} className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700">Pharmacy Shop Name</Label>
                        <Input
                          value={pharmacyData.shopName}
                          onChange={(e) => setPharmacyData({ ...pharmacyData, shopName: e.target.value })}
                          className="bg-slate-50 border-slate-300 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700">Drug License No (Form 20B/21B)</Label>
                        <Input
                          value={pharmacyData.licenseNo}
                          onChange={(e) => setPharmacyData({ ...pharmacyData, licenseNo: e.target.value })}
                          className="bg-slate-50 border-slate-300 text-sm font-mono"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-4 rounded-xl text-xs">
                      Enter Pharmacy Console
                    </Button>
                  </form>
                </TabsContent>

                {/* RIDER TAB */}
                <TabsContent value="rider" className="mt-4 space-y-4">
                  <div className="p-3.5 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-cyan-900">Vikram Singh (EV Scooter)</h4>
                      <p className="text-[11px] text-cyan-700">UP-14-EV-8821 • Cold Box Equipped</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        loginAsRole("rider");
                        toast.success("Signed in with demo rider account!");
                        setIsAuthModalOpen(false);
                        setLocation("/delivery");
                      }}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs"
                    >
                      Instant Sign In
                    </Button>
                  </div>

                  <form onSubmit={handleRiderSubmit} className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700">Rider Name</Label>
                        <Input
                          value={riderData.name}
                          onChange={(e) => setRiderData({ ...riderData, name: e.target.value })}
                          className="bg-slate-50 border-slate-300 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700">Vehicle Number</Label>
                        <Input
                          value={riderData.vehicleNo}
                          onChange={(e) => setRiderData({ ...riderData, vehicleNo: e.target.value })}
                          className="bg-slate-50 border-slate-300 text-sm font-mono"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-xl text-xs">
                      Start Rider Shift
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* TAB 3: GOOGLE AUTH CONFIGURATION SETUP */}
          {mainTab === "config" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <GoogleLogo className="w-4 h-4" />
                  Configuring Google Authentication:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-blue-800 pt-1">
                  <li>Go to <strong>Google Cloud Console</strong> &gt; <em>APIs & Services</em> &gt; <em>Credentials</em>.</li>
                  <li>Create an <strong>OAuth 2.0 Client ID</strong> (Web application).</li>
                  <li>Add your authorized JavaScript origins (e.g. <code>http://localhost:3000</code> and your Cloudflare domain).</li>
                  <li>Copy your <strong>Client ID</strong> and save it below, or add <code>VITE_GOOGLE_CLIENT_ID</code> to your <code>.env</code> file.</li>
                </ol>
              </div>

              <form onSubmit={handleSaveGoogleKey} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Google OAuth 2.0 Client ID</Label>
                  <Input
                    value={customGoogleClientId}
                    onChange={(e) => setCustomGoogleClientId(e.target.value)}
                    placeholder="xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                    className="bg-slate-50 border-slate-300 text-xs font-mono"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-[#065F46] hover:bg-[#044E39] text-white font-bold py-4 rounded-xl text-xs">
                  Save Google Client ID & Enable
                </Button>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
