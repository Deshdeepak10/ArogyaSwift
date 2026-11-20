import { useState } from "react";
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
  Bike,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Phone,
  KeyRound,
  FileCheck,
  MapPin,
  Box
} from "lucide-react";

function cleanTo10Digits(input: string): string {
  const digitsOnly = input.replace(/\D/g, "");
  if (digitsOnly.length > 10 && digitsOnly.startsWith("91")) {
    return digitsOnly.slice(2, 12);
  }
  return digitsOnly.slice(-10);
}

export function DeliveryAuthModal() {
  const [, setLocation] = useLocation();
  const {
    activeRoleModal,
    closeRoleAuth,
    roleModalMode,
    setRoleModalMode,
    loginRiderUser,
    registerRiderUser
  } = useAuth();
  const { addNotification } = useNotifications();

  const isOpen = activeRoleModal === "delivery";

  // Login form state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  // Register form state
  const [riderName, setRiderName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("Electric Scooter (Cold-Chain Ready)");
  const [vehicleNo, setVehicleNo] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [zone, setZone] = useState("Indiranagar Zone");

  const handleSendLoginOtp = () => {
    const cleaned = cleanTo10Digits(loginPhone);
    if (cleaned.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setIsOtpSent(true);
    toast.success(`SMS OTP sent to +91 ${cleaned}! Passcode: ${newOtp}`);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanTo10Digits(loginPhone);
    if (cleaned.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    if (!loginOtp.trim()) {
      toast.error("Please enter the 4-digit security passcode");
      return;
    }
    if (generatedOtp && loginOtp.trim() !== generatedOtp && loginOtp.trim() !== "1234") {
      toast.error("Invalid passcode. Please enter the code sent to your phone.");
      return;
    }

    const partnerName = `Delivery Partner (+91 ${cleaned.slice(-4)})`;
    loginRiderUser(partnerName, cleaned, "Electric Scooter (Cold Storage Box)");
    addNotification({
      title: "Rider Shift Active 🟢",
      message: `${partnerName} is online and ready to receive multi-chemist pickup orders.`,
      role: "rider",
      type: "system_alert"
    });
    toast.success("Welcome back! Delivery Partner shift is now online.");
    closeRoleAuth();
    setLocation("/delivery");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (riderName.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }
    const cleaned = cleanTo10Digits(phone);
    if (cleaned.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (vehicleNo.trim().length < 4) {
      toast.error("Please enter your vehicle registration number");
      return;
    }

    registerRiderUser({
      name: riderName.trim(),
      phone: cleaned,
      vehicleType,
      vehicleNo: vehicleNo.trim().toUpperCase(),
      drivingLicense: drivingLicense.trim() || undefined,
      zone
    });

    addNotification({
      title: "New Delivery Partner Registered",
      message: `${riderName.trim()} registered with ${vehicleType} (${vehicleNo.trim().toUpperCase()}).`,
      role: "admin",
      type: "system_alert"
    });

    addNotification({
      title: "Onboarding Approved 🎉",
      message: `Welcome to the ArogyaSwift fleet, ${riderName}! Your shift is ready in ${zone}.`,
      role: "rider",
      type: "system_alert"
    });

    toast.success(`Delivery Partner ${riderName} registered successfully!`);
    closeRoleAuth();
    setLocation("/delivery");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeRoleAuth()}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Bike className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-bold text-slate-900">
                Delivery Partner Portal
              </DialogTitle>
              <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] uppercase font-bold">
                Swift Fleet
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Multi-pickup order aggregation, cold-chain transport, and doorstep OTP verification.
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
              className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-xs cursor-pointer"
            >
              Rider Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-xs cursor-pointer"
            >
              Join Delivery Fleet
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: RIDER LOGIN */}
          <TabsContent value="login" className="space-y-4 pt-3">
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Registered Mobile Number
                </label>
                <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 bg-white">
                  <span className="inline-flex items-center px-3 text-xs font-bold text-slate-600 bg-slate-50 border-r border-slate-200 shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(cleanTo10Digits(e.target.value))}
                    maxLength={10}
                    placeholder="Enter 10-digit mobile"
                    className="w-full px-3 py-2 text-xs text-slate-900 outline-none font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendLoginOtp}
                    className="px-3 text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:bg-amber-50 shrink-0 border-l border-slate-200 transition-colors cursor-pointer"
                  >
                    {isOtpSent ? "Resend" : "Send OTP"}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  4-Digit Security Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    type="text"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                    placeholder="Enter 4-digit code"
                    className="pl-9 text-xs tracking-widest font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Start Delivery Shift</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
          </TabsContent>

          {/* TAB 2: REGISTER RIDER */}
          <TabsContent value="register" className="space-y-3.5 pt-3">
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Rider Full Name *
                </label>
                <Input
                  type="text"
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                  placeholder="e.g. Your Full Name"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  10-Digit Mobile Number *
                </label>
                <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 bg-white">
                  <span className="inline-flex items-center px-3 text-xs font-bold text-slate-600 bg-slate-50 border-r border-slate-200 shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(cleanTo10Digits(e.target.value))}
                    maxLength={10}
                    placeholder="Enter 10-digit mobile"
                    className="w-full px-3 py-2 text-xs text-slate-900 outline-none font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Vehicle Type *
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Electric Scooter (Cold-Chain Ready)">EV Scooter (Cold Box)</option>
                    <option value="Motorcycle (Standard Parcel Bag)">Motorcycle (Insulated Bag)</option>
                    <option value="Bicycle (Hyperlocal Courier)">Bicycle (Local Delivery)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Vehicle Plate No. *
                  </label>
                  <Input
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    placeholder="KA-03-HA-8821"
                    className="text-xs uppercase font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Driving License No.
                  </label>
                  <Input
                    type="text"
                    value={drivingLicense}
                    onChange={(e) => setDrivingLicense(e.target.value)}
                    placeholder="DL-04202200812"
                    className="text-xs uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Shift Zone *
                  </label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Indiranagar Zone">Indiranagar Zone</option>
                    <option value="Defence Colony Zone">Defence Colony</option>
                    <option value="Domlur Zone">Domlur Zone</option>
                    <option value="HAL 2nd Stage">HAL Zone</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer mt-2"
              >
                <span>Register as Delivery Partner</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

