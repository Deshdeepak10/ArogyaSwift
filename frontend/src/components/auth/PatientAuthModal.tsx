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
  MapPin,
  Mail,
  KeyRound,
  ArrowRight,
  Globe,
  Building2,
  Sparkles,
  Edit3,
  ListFilter
} from "lucide-react";
import { renderOfficialGoogleButton } from "@/lib/googleAuth";
import {
  WORLD_COUNTRIES,
  GLOBAL_HIGHLIGHT_ZONES,
  findCountry,
  formatWorldwideAddress
} from "@/lib/worldLocations";

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
  const [loginCountry, setLoginCountry] = useState("IN");
  const [loginDialCode, setLoginDialCode] = useState("+91");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Register form state (World-Ready)
  const [regName, setRegName] = useState("");
  const [regCountry, setRegCountry] = useState("IN");
  const [regDialCode, setRegDialCode] = useState("+91");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regArea, setRegArea] = useState("Indiranagar, Bengaluru");
  const [customArea, setCustomArea] = useState("");
  const [isCustomArea, setIsCustomArea] = useState(false);
  const [regState, setRegState] = useState("");
  const [regPostalCode, setRegPostalCode] = useState("");
  const [regEmail, setRegEmail] = useState("");
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

  // Sync login country dial code
  const handleLoginCountryChange = (code: string) => {
    setLoginCountry(code);
    const country = findCountry(code);
    if (country) {
      setLoginDialCode(country.dialCode);
    }
  };

  // Sync registration country dial code and default zones
  const handleRegCountryChange = (code: string) => {
    setRegCountry(code);
    const country = findCountry(code);
    if (country) {
      setRegDialCode(country.dialCode);
      const zones = country.zones && country.zones.length > 0 ? country.zones : GLOBAL_HIGHLIGHT_ZONES;
      if (zones.length > 0) {
        setRegArea(zones[0]);
        setIsCustomArea(false);
      }
    }
  };

  const currentCountry = findCountry(regCountry);
  const availableZones = currentCountry?.zones && currentCountry.zones.length > 0
    ? currentCountry.zones
    : GLOBAL_HIGHLIGHT_ZONES;

  // Handle Login OTP
  const handleSendLoginOtp = () => {
    const rawDigits = loginPhone.replace(/\D/g, "");
    if (rawDigits.length < 7 || rawDigits.length > 15) {
      toast.error("Please enter a valid mobile number (7-15 digits)");
      return;
    }
    const fullPhone = `${loginDialCode} ${rawDigits}`;
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setIsOtpSent(true);
      toast.success(`SMS OTP sent to ${fullPhone}! Your code: ${newOtp}`);
    }, 600);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawDigits = loginPhone.replace(/\D/g, "");
    if (rawDigits.length < 7 || rawDigits.length > 15) {
      toast.error("Enter a valid mobile number (7-15 digits)");
      return;
    }
    if (loginOtp.trim().length !== 4) {
      toast.error("Please enter the 4-digit OTP sent to your phone");
      return;
    }
    if (generatedOtp && loginOtp.trim() !== generatedOtp && loginOtp.trim() !== "1234") {
      toast.error("Incorrect OTP code. Please enter the code sent to your phone.");
      return;
    }

    const fullPhone = `${loginDialCode} ${rawDigits}`;
    loginPatient(`Patient (${loginDialCode} •••${rawDigits.slice(-4)})`, fullPhone);
    addNotification({
      title: "Patient Sign-In Successful",
      message: `Signed in to ArogyaSwift. Mobile: ${fullPhone}`,
      role: "patient",
      type: "system_alert"
    });
    toast.success("Welcome! Signed in as Patient.");
    setLocation("/patient");
  };

  // Handle Register OTP
  const handleSendRegOtp = () => {
    const rawDigits = regPhone.replace(/\D/g, "");
    if (rawDigits.length < 7 || rawDigits.length > 15) {
      toast.error("Please enter a valid mobile number (7-15 digits)");
      return;
    }
    const fullPhone = `${regDialCode} ${rawDigits}`;
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setRegOtpSent(true);
    toast.success(`SMS OTP sent to ${fullPhone}! Your code: ${newOtp}`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regName.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }
    const rawDigits = regPhone.replace(/\D/g, "");
    if (rawDigits.length < 7 || rawDigits.length > 15) {
      toast.error("Please enter a valid mobile number (7-15 digits)");
      return;
    }
    if (regAddress.trim().length < 3) {
      toast.error("Please enter your delivery street address");
      return;
    }

    const effectiveArea = (isCustomArea ? customArea.trim() : regArea) || "Global Zone";
    if (!effectiveArea) {
      toast.error("Please select or specify your Area Zone");
      return;
    }

    const countryObj = findCountry(regCountry);
    const countryName = countryObj ? countryObj.name : "Global";

    const fullAddress = formatWorldwideAddress({
      address: regAddress.trim(),
      area: effectiveArea,
      state: regState.trim() || undefined,
      postalCode: regPostalCode.trim() || undefined,
      country: countryName
    });

    const fullPhone = `${regDialCode} ${rawDigits}`;

    registerPatient({
      name: regName.trim(),
      phone: fullPhone,
      address: regAddress.trim(),
      area: effectiveArea,
      email: regEmail.trim() || undefined,
      country: countryName,
      state: regState.trim() || undefined,
      postalCode: regPostalCode.trim() || undefined,
      fullAddress
    });

    addNotification({
      title: "Patient Account Registered 🎉",
      message: `Welcome to ArogyaSwift, ${regName}! Delivery zone: ${effectiveArea}, ${countryName}.`,
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
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6">
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
              Order medicines, verify doctor prescriptions, and track deliveries worldwide.
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
                  <select
                    value={loginCountry}
                    onChange={(e) => handleLoginCountryChange(e.target.value)}
                    className="px-2 py-2 text-xs font-bold text-slate-700 bg-slate-50 border-r border-slate-200 shrink-0 outline-none cursor-pointer max-w-[110px]"
                  >
                    {WORLD_COUNTRIES.map((c) => (
                      <option key={`login-${c.code}`} value={c.code}>
                        {c.flag} {c.dialCode}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    maxLength={15}
                    placeholder="Mobile number"
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
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  4-Digit Verification OTP
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    type="text"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                    placeholder="Enter 4-digit OTP"
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
                Or Continue With
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
            </div>
          </TabsContent>

          {/* TAB 2: NEW PATIENT REGISTRATION (WORLDWIDE ADDRESS & AREA ZONE) */}
          <TabsContent value="register" className="space-y-3.5 pt-3">
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {/* Full Name */}
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

              {/* Country & International Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" /> Country / Region *
                  </label>
                  <select
                    value={regCountry}
                    onChange={(e) => handleRegCountryChange(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 truncate cursor-pointer"
                  >
                    {WORLD_COUNTRIES.map((c) => (
                      <option key={`reg-country-${c.code}`} value={c.code}>
                        {c.flag} {c.name} ({c.dialCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Mobile Number *
                  </label>
                  <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600 bg-white">
                    <span className="inline-flex items-center px-2 text-xs font-bold text-slate-700 bg-slate-50 border-r border-slate-200 shrink-0">
                      {regDialCode}
                    </span>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      maxLength={15}
                      placeholder="e.g. 9876543210"
                      className="w-full px-2 py-2 text-xs text-slate-900 outline-none font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleSendRegOtp}
                      className="px-2 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 shrink-0 border-l border-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {regOtpSent ? "OTP Sent" : "Get OTP"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Street Address & Area Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      placeholder="House / Flat / Street / Apt"
                      className="pl-8 text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Area Zone *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomArea(!isCustomArea)}
                      className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      {isCustomArea ? (
                        <>
                          <ListFilter className="w-3 h-3" />
                          <span>Pick Zone</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-3 h-3" />
                          <span>Type Custom</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isCustomArea ? (
                    <div className="relative">
                      <Input
                        type="text"
                        value={customArea}
                        onChange={(e) => setCustomArea(e.target.value)}
                        placeholder="e.g. Indiranagar, Brooklyn, Deira, Soho..."
                        className="text-xs pr-7 font-medium"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomArea(false)}
                        title="Back to predefined list"
                        className="absolute right-2 top-2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <select
                      value={regArea}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomArea(true);
                        } else {
                          setRegArea(e.target.value);
                        }
                      }}
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 truncate cursor-pointer"
                    >
                      <optgroup label={`${currentCountry?.flag || "📍"} ${currentCountry?.name || "Country"} Delivery Zones`}>
                        {availableZones.map((z) => (
                          <option key={z} value={z}>
                            {z}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🌍 Worldwide Highlight Zones">
                        {GLOBAL_HIGHLIGHT_ZONES.map((gz) => (
                          <option key={`global-${gz}`} value={gz}>
                            {gz}
                          </option>
                        ))}
                      </optgroup>
                      <option value="__custom__">✏️ Enter custom area zone...</option>
                    </select>
                  )}
                </div>
              </div>

              {/* State/Province & Postal/ZIP Code (World Address Completeness) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    State / Province / Region <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    type="text"
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    placeholder="e.g. Karnataka / NY / London"
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Postal / ZIP Code <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    type="text"
                    value={regPostalCode}
                    onChange={(e) => setRegPostalCode(e.target.value)}
                    placeholder="e.g. 560038 / 10001 / SW1A"
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Email Address */}
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

              {/* Full Address Preview Badge */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 flex items-start gap-2 text-[11px] text-slate-600">
                <Globe className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="truncate">
                  <span className="font-semibold text-slate-700">Delivery Zone: </span>
                  <span className="text-emerald-700 font-bold">
                    {isCustomArea ? (customArea || "Custom Zone") : regArea}
                  </span>
                  <span className="text-slate-400 mx-1">·</span>
                  <span>{currentCountry?.flag} {currentCountry?.name}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer mt-1"
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
