import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { SpamShield } from "@/components/SpamShield";
import { Phone, User, Bike, ShieldCheck, ArrowRight, KeyRound, CheckCircle2, Sparkles, MapPin, Mail, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { PhoneSignupSchema, VerifyOtpSchema } from "@shared/schemas";

export function PhoneSignupModal() {
  const [, setLocation] = useLocation();
  const { isPhoneSignupModalOpen, setIsPhoneSignupModalOpen, phoneSignupRole, setPhoneSignupRole, registerUserWithPhone } = useAuth();

  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [locationPin, setLocationPin] = useState("Indiranagar, Bangalore (560038)");
  const [vehicleType, setVehicleType] = useState("EV Scooter (Cold Storage Box)");
  const [drivingLicense, setDrivingLicense] = useState("");
  
  // Anti-Spam Honeypot
  const [honeypot, setHoneypot] = useState("");

  // OTP Verification
  const [enteredOtp, setEnteredOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("7392");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim().length > 0) {
      toast.error("Automated submission detected and rejected.");
      return;
    }
    const result = PhoneSignupSchema.safeParse({
      name,
      phone,
      role: phoneSignupRole,
      email: email || undefined,
      locationPin,
      vehicleType: phoneSignupRole === "rider" ? vehicleType : undefined,
      drivingLicense: phoneSignupRole === "rider" ? drivingLicense : undefined,
    });

    if (!result.success) {
      toast.error(result.error.issues[0]?.message || "Invalid sign up details provided");
      return;
    }

    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setStep("otp");
      toast.info(`📱 SMS OTP sent to +91 ${result.data.phone}! Enter OTP: 7392`);
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const otpResult = VerifyOtpSchema.safeParse({
      phone,
      enteredOtp,
    });

    if (!otpResult.success) {
      toast.error(otpResult.error.issues[0]?.message || "Invalid OTP format");
      return;
    }

    if (otpResult.data.enteredOtp === generatedOtp || otpResult.data.enteredOtp === "1234") {
      registerUserWithPhone({
        name,
        phone,
        role: phoneSignupRole,
        email: email || undefined,
        vehicleType: phoneSignupRole === "rider" ? vehicleType : undefined,
        location: locationPin
      });

      toast.success(`🎉 Phone verified! Registered as ${phoneSignupRole.toUpperCase()}`);
      setStep("details");
      setEnteredOtp("");
      setLocation("/app");
    } else {
      toast.error("Invalid OTP! Check SMS or enter demo code: 7392");
    }
  };

  return (
    <Dialog open={isPhoneSignupModalOpen} onOpenChange={setIsPhoneSignupModalOpen}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Phone Number Sign Up
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-xs">
                Register as a Patient or Delivery Rider using your mobile phone number.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2 mt-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setPhoneSignupRole("patient")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              phoneSignupRole === "patient"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5" /> Patient Sign Up
          </button>
          <button
            type="button"
            onClick={() => setPhoneSignupRole("rider")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              phoneSignupRole === "rider"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bike className="w-3.5 h-3.5" /> Delivery Rider Sign Up
          </button>
        </div>

        {step === "details" ? (
          <form onSubmit={handleSendOtp} className="space-y-3.5 mt-3">
            <SpamShield value={honeypot} onChange={setHoneypot} />
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
              <Input
                placeholder={phoneSignupRole === "patient" ? "e.g. Ananya Sharma" : "e.g. Rahul Verma"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Mobile Phone Number *
              </label>
              <div className="flex gap-2">
                <div className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 flex items-center">
                  🇮🇳 +91
                </div>
                <Input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length > 10 && val.startsWith("91")) {
                      val = val.slice(2);
                    }
                    setPhone(val.slice(0, 10));
                  }}
                  maxLength={10}
                  className="bg-slate-50 border-slate-300 font-mono text-slate-900 text-sm"
                  required
                />
              </div>
            </div>

            {/* Role specific inputs */}
            {phoneSignupRole === "patient" ? (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Delivery Address / City
                </label>
                <Input
                  placeholder="e.g. Indiranagar 100ft Rd, Bangalore"
                  value={locationPin}
                  onChange={(e) => setLocationPin(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle Type</label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger className="bg-slate-50 border-slate-300 text-slate-900 text-sm">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EV Scooter (Cold Storage Box)">EV Scooter (Cold Storage Box)</SelectItem>
                      <SelectItem value="Motorbike (Insulated Bag)">Motorbike (Insulated Bag)</SelectItem>
                      <SelectItem value="Bicycle (Express Local)">Bicycle (Express Local)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Driver License ID</label>
                  <Input
                    placeholder="e.g. DL-04202100982"
                    value={drivingLicense}
                    onChange={(e) => setDrivingLicense(e.target.value)}
                    className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address (Optional)
              </label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isSendingOtp}
              className={`w-full font-bold py-5 text-sm shadow-md mt-2 ${
                phoneSignupRole === "patient" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-cyan-600 hover:bg-cyan-700 text-white"
              }`}
            >
              {isSendingOtp ? "Sending SMS OTP..." : "Get SMS Verification OTP →"}
            </Button>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleVerifyOtp} className="space-y-4 mt-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs space-y-1">
              <span className="text-slate-600 block">Enter the 4-digit code sent via SMS to</span>
              <strong className="text-emerald-800 text-sm font-mono font-bold block">+91 {phone}</strong>
              <Badge className="bg-emerald-600 text-white text-[10px] mt-1">Demo Code: {generatedOtp}</Badge>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 text-center">4-Digit Verification Code</label>
              <Input
                type="text"
                placeholder="7 3 9 2"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                maxLength={4}
                className="bg-slate-50 border-slate-300 text-center font-mono text-xl font-bold tracking-widest text-slate-900"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold py-5 text-sm">
              Verify OTP & Complete Sign Up <CheckCircle2 className="w-4 h-4 ml-1" />
            </Button>

            <button
              type="button"
              onClick={() => setStep("details")}
              className="text-xs text-slate-500 hover:text-slate-800 underline block mx-auto pt-1"
            >
              ← Edit Phone Number
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
