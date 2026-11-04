import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  User,
  Phone,
  MapPin,
  Mail,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { renderOfficialGoogleButton } from "@/lib/googleAuth";

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

function cleanTo10Digits(input: string): string {
  const digitsOnly = input.replace(/\D/g, "");
  if (digitsOnly.length > 10 && digitsOnly.startsWith("91")) {
    return digitsOnly.slice(2, 12);
  }
  return digitsOnly.slice(-10);
}

export function PatientAuthModal() {
  const [, setLocation] = useLocation();
  const {
    activeRoleModal,
    closeRoleAuth,
    roleModalMode,
    setRoleModalMode,
    loginPatient,
    registerPatient,
    loginWithGoogle,
    applyGoogleProfile
  } = useAuth();
  const { addNotification } = useNotifications();

  const isOpen = activeRoleModal === "patient";

  // Login form state
  const [loginPhone, setLoginPhone] = useState("9845012345");
  const [loginOtp, setLoginOtp] = useState("7392");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regArea, setRegArea] = useState("Indiranagar, Bengaluru");
  const [regEmail, setRegEmail] = useState("");
  const [regOtp, setRegOtp] = useState("7392");
  const [regOtpSent, setRegOtpSent] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && googleBtnRef.current) {
      renderOfficialGoogleButton(
        googleBtnRef.current,
        (profile) => {
          applyGoogleProfile(profile, "patient");
          addNotification({
            title: "Welcome to ArogyaSwift!",
            message: `Signed in as Patient ${profile.displayName}.`,
            role: "patient",
            type: "system_alert"
          });
          toast.success(`Welcome, ${profile.displayName}! Signed in with Google.`);
          closeRoleAuth();
          setLocation("/patient");
        },
        (err) => console.warn("Google button error:", err)
      );
    }
  }, [isOpen]);

  const handleSendLoginOtp = () => {
    const cleaned = cleanTo10Digits(loginPhone);
    if (cleaned.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setIsOtpSent(true);
      toast.success(`SMS OTP sent to +91 ${cleaned}! Demo code: 7392`);
    }, 600);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanTo10Digits(loginPhone);
    if (cleaned.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    if (loginOtp.trim() !== "7392" && loginOtp.trim() !== "1234" && loginOtp.trim().length !== 4) {
      toast.error("Please enter a valid 4-digit OTP (e.g. 7392)");
      return;
    }

    loginPatient(cleaned === "9845012345" ? "Asha Rao" : "Arogya Patient", cleaned);
    addNotification({
      title: "Patient Sign-In Successful",
      message: `Welcome back to ArogyaSwift. Verified mobile: +91 ${cleaned}`,
      role: "patient",
      type: "system_alert"
    });
    toast.success("Welcome back! Signed in as Patient.");
    setLocation("/patient");
  };

  const handleSendRegOtp = () => {
    const cleaned = cleanTo10Digits(regPhone);
    if (cleaned.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number for registration");
      return;
    }
    setRegOtpSent(true);
    toast.success(`SMS OTP sent to +91 ${cleaned}! Demo code: 7392`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regName.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }
    const cleaned = cleanTo10Digits(regPhone);
    if (cleaned.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (regAddress.trim().length < 4) {
      toast.error("Please enter your delivery street address");
      return;
    }

    registerPatient({
      name: regName.trim(),
      phone: cleaned,
      address: regAddress.trim(),
      area: regArea,
      email: regEmail.trim() || undefined
    });

    addNotification({
      title: "Patient Account Registered 🎉",
      message: `Welcome to ArogyaSwift, ${regName}! Your delivery address in ${regArea} is saved.`,
      role: "patient",
      type: "system_alert"
    });

    toast.success(`Patient account created for ${regName}!`);
    setLocation("/patient");
  };

  const handleGoogleQuick = async () => {
    try {
      const prof = await loginWithGoogle("patient");
      toast.success(`Signed in as ${prof.displayName} via Google`);
      setLocation("/patient");
    } catch (err: any) {
      toast.error(err.message || "Google sign in was cancelled");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeRoleAuth()}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <User className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-bold text-slate-900">
                Patient Portal
              </DialogTitle>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] uppercase font-bold">
                Patient Account
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Order medicines, verify doctor prescriptions, and track deliveries.
            </DialogDescription>
          </div>
        </div>

        <Tabs
          value={roleModalMode}
          onValueChange={(v) => setRoleModalMode(v as any)}
          className="mt-4"
        >
          <TabsList className="grid grid-cols-2 bg-slate-100/90 p-1 rounded-xl">
            <TabsTrigger
              value="login"
              className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-xs cursor-pointer"
            >
              Patient Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-xs cursor-pointer"
            >
              New Patient Register
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PATIENT SIGN IN */}
          <TabsContent value="login" className="space-y-4 pt-3">
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mobile Number (for OTP)
                </label>
                <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600 bg-white">
                  <span className="inline-flex items-center px-3 text-xs font-bold text-slate-600 bg-slate-50 border-r border-slate-200 shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(cleanTo10Digits(e.target.value))}
                    maxLength={10}
                    placeholder="9845012345"
                    className="w-full px-3 py-2 text-xs text-slate-900 outline-none font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendLoginOtp}
                    disabled={isSendingOtp}
                    className="px-3 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 shrink-0 border-l border-slate-200 transition-colors cursor-pointer"
                  >
                    {isSendingOtp ? "Sending..." : isOtpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    4-Digit Verification OTP
                  </label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                    Demo Code: 7392
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    type="text"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                    placeholder="7392"
                    className="pl-9 text-xs tracking-widest font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Verify & Sign In as Patient</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200" />
              <span className="shrink mx-2 text-[10px] text-slate-400 uppercase font-semibold">
                Or Quick Access
              </span>
              <div className="grow border-t border-slate-200" />
            </div>

            <div className="space-y-2">
              <div ref={googleBtnRef} className="w-full flex justify-center min-h-[40px]" />

              <button
                type="button"
                onClick={handleGoogleQuick}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <GoogleLogo className="w-4 h-4" />
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  loginPatient("Asha Rao", "9845012345");
                  toast.success("Loaded Asha Rao (Demo Patient Profile)");
                  setLocation("/patient");
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer text-center"
              >
                ⚡ Fast Demo Sign-In: <strong>Asha Rao</strong> (Defence Colony)
              </button>
            </div>
          </TabsContent>

          {/* TAB 2: NEW PATIENT REGISTRATION */}
          <TabsContent value="register" className="space-y-3.5 pt-3">
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Anita Sharma"
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  10-Digit Mobile Number *
                </label>
                <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600 bg-white">
                  <span className="inline-flex items-center px-3 text-xs font-bold text-slate-600 bg-slate-50 border-r border-slate-200 shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(cleanTo10Digits(e.target.value))}
                    maxLength={10}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 text-xs text-slate-900 outline-none font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendRegOtp}
                    className="px-3 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 shrink-0 border-l border-slate-200 transition-colors cursor-pointer"
                  >
                    {regOtpSent ? "OTP Sent" : "Get OTP"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Delivery Address *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <Input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="House / Flat / Street"
                      className="pl-8 text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Area Zone *
                  </label>
                  <select
                    value={regArea}
                    onChange={(e) => setRegArea(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Indiranagar, Bengaluru">Indiranagar</option>
                    <option value="Defence Colony, Indiranagar">Defence Colony</option>
                    <option value="Domlur, Bengaluru">Domlur</option>
                    <option value="HAL 2nd Stage, Bengaluru">HAL 2nd Stage</option>
                    <option value="Koramangala, Bengaluru">Koramangala</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional, for invoices)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="anita@example.com"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer mt-2"
              >
                <span>Complete Registration & Enter</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

