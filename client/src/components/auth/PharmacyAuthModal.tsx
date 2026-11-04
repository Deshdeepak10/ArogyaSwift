import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Store,
  Building2,
  FileCheck2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Snowflake,
  UserCheck
} from "lucide-react";

function cleanTo10Digits(input: string): string {
  const digitsOnly = input.replace(/\D/g, "");
  if (digitsOnly.length > 10 && digitsOnly.startsWith("91")) {
    return digitsOnly.slice(2, 12);
  }
  return digitsOnly.slice(-10);
}

export function PharmacyAuthModal() {
  const [, setLocation] = useLocation();
  const {
    activeRoleModal,
    closeRoleAuth,
    roleModalMode,
    setRoleModalMode,
    loginPharmacyUser,
    registerPharmacyUser,
    registeredPharmacies
  } = useAuth();
  const { addNotification } = useNotifications();

  const isOpen = activeRoleModal === "pharmacy";

  // Login form state
  const [loginShopName, setLoginShopName] = useState("Shree Ganesh Medicals");
  const [loginLicense, setLoginLicense] = useState("KA-BLR-20B-1142");

  // Registration form state
  const [ownerName, setOwnerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [category, setCategory] = useState("Cold-Chain Certified Retail");
  const [address, setAddress] = useState("");
  const [zone, setZone] = useState("Indiranagar, Bengaluru");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [coldChainReady, setColdChainReady] = useState(true);

  // License validator simulation state
  const [isVerifyingLicense, setIsVerifyingLicense] = useState(false);
  const [isLicenseVerified, setIsLicenseVerified] = useState(false);

  const handleVerifyLicense = () => {
    if (!licenseNo || licenseNo.trim().length < 5) {
      toast.error("Enter a valid Drug License Number (e.g. KA-BLR-20B-1142)");
      return;
    }
    setIsVerifyingLicense(true);
    setTimeout(() => {
      setIsVerifyingLicense(false);
      setIsLicenseVerified(true);
      toast.success(`License ${licenseNo.trim().toUpperCase()} verified against CDSCO Registry!`);
    }, 800);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginShopName.trim()) {
      toast.error("Please enter your pharmacy name");
      return;
    }
    loginPharmacyUser(loginShopName.trim(), loginLicense.trim());
    addNotification({
      title: "Chemist Portal Online",
      message: `${loginShopName.trim()} is now active to receive prescription orders.`,
      role: "pharmacy",
      type: "system_alert"
    });
    toast.success(`Welcome to Chemist Portal, ${loginShopName}!`);
    closeRoleAuth();
    setLocation("/pharmacy");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ownerName.trim().length < 2) {
      toast.error("Enter pharmacist / owner name");
      return;
    }
    if (shopName.trim().length < 3) {
      toast.error("Enter pharmacy store title");
      return;
    }
    if (licenseNo.trim().length < 4) {
      toast.error("Enter valid drug license number");
      return;
    }
    const cleanPhone = cleanTo10Digits(phone);
    if (cleanPhone.length !== 10) {
      toast.error("Enter valid 10-digit mobile number");
      return;
    }

    registerPharmacyUser({
      ownerName: ownerName.trim(),
      shopName: shopName.trim(),
      licenseNo: licenseNo.trim().toUpperCase(),
      category,
      address: `${address.trim()}, ${zone}`,
      phone: `+91 ${cleanPhone}`,
      email: email.trim() || `store-${cleanPhone}@arogyaswift.in`,
      coldChainReady,
      area: zone
    });

    addNotification({
      title: "New Pharmacy Onboarded",
      message: `${shopName.trim()} registered with Drug License #${licenseNo.trim().toUpperCase()}.`,
      role: "admin",
      type: "system_alert"
    });

    addNotification({
      title: "Store Registration Complete 🎉",
      message: `${shopName.trim()} is ready to receive prescription quotations in ${zone}.`,
      role: "pharmacy",
      type: "system_alert"
    });

    toast.success(`🎉 Pharmacy ${shopName} successfully registered!`);
    closeRoleAuth();
    setLocation("/pharmacy");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeRoleAuth()}>
      <DialogContent className="sm:max-w-xl bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Store className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-bold text-slate-900">
                Pharmacy Partner Portal
              </DialogTitle>
              <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-[10px] uppercase font-bold">
                Chemist Network
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Review doctor prescriptions, check stock, quote prices, and dispatch sealed parcels.
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
              className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-xs cursor-pointer"
            >
              Pharmacy Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-xs cursor-pointer"
            >
              Register New Pharmacy
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PHARMACY LOGIN */}
          <TabsContent value="login" className="space-y-4 pt-3">
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Pharmacy Name / Hub Title
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    type="text"
                    value={loginShopName}
                    onChange={(e) => setLoginShopName(e.target.value)}
                    placeholder="e.g. Shree Ganesh Medicals"
                    className="pl-9 text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Drug License Number (Form 20B / 21B)
                </label>
                <div className="relative">
                  <FileCheck2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    type="text"
                    value={loginLicense}
                    onChange={(e) => setLoginLicense(e.target.value)}
                    placeholder="KA-BLR-20B-1142"
                    className="pl-9 text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Enter Pharmacy Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200" />
              <span className="shrink mx-2 text-[10px] text-slate-400 uppercase font-semibold">
                Quick Preset Chemist Accounts
              </span>
              <div className="grow border-t border-slate-200" />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  loginPharmacyUser("Shree Ganesh Medicals", "KA-BLR-20B-1142");
                  toast.success("Loaded Shree Ganesh Medicals (Indiranagar 12th Main)");
                  setLocation("/pharmacy");
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-bold text-slate-800">Shree Ganesh Medicals</div>
                  <div className="text-[10px] text-slate-500">12th Main, Indiranagar • DL #KA-BLR-20B-1142</div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-none text-[10px]">Active Partner</Badge>
              </button>

              <button
                type="button"
                onClick={() => {
                  loginPharmacyUser("Apollo Pharmacy - Express Hub", "KA-BLR-2021-00921");
                  toast.success("Loaded Apollo Pharmacy Express Hub (CMH Road)");
                  setLocation("/pharmacy");
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-bold text-slate-800">Apollo Pharmacy Express</div>
                  <div className="text-[10px] text-slate-500">CMH Road, Indiranagar • Cold-Chain Hub</div>
                </div>
                <Badge className="bg-teal-100 text-teal-800 border-none text-[10px]">Cold-Chain</Badge>
              </button>
            </div>
          </TabsContent>

          {/* TAB 2: REGISTER PHARMACY */}
          <TabsContent value="register" className="space-y-3.5 pt-3">
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Pharmacist / Owner Name *
                  </label>
                  <Input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Pharm. Ramesh Patel"
                    className="text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Pharmacy Store Title *
                  </label>
                  <Input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Sri Sai Medicals & Surgicals"
                    className="text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Drug License Number (Form 20B/21B) *
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={licenseNo}
                    onChange={(e) => {
                      setLicenseNo(e.target.value);
                      setIsLicenseVerified(false);
                    }}
                    placeholder="e.g. KA-BLR-20B-8891"
                    className="text-xs font-mono font-bold uppercase"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleVerifyLicense}
                    disabled={isVerifyingLicense}
                    className="shrink-0 text-xs text-teal-800 border-teal-300 hover:bg-teal-50 cursor-pointer"
                  >
                    {isVerifyingLicense ? "Checking..." : isLicenseVerified ? "✓ CDSCO Verified" : "Verify CDSCO"}
                  </Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Store Address *
                  </label>
                  <Input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="No. 45, 100ft Road"
                    className="text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Operating Zone *
                  </label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="Indiranagar, Bengaluru">Indiranagar Zone</option>
                    <option value="Defence Colony, Indiranagar">Defence Colony Zone</option>
                    <option value="Domlur, Bengaluru">Domlur Zone</option>
                    <option value="HAL 2nd Stage, Bengaluru">HAL Zone</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Store Contact Mobile *
                  </label>
                  <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-teal-600 bg-white">
                    <span className="inline-flex items-center px-2.5 text-xs font-bold text-slate-600 bg-slate-50 border-r border-slate-200 shrink-0">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(cleanTo10Digits(e.target.value))}
                      maxLength={10}
                      placeholder="9876511223"
                      className="w-full px-2.5 py-1.5 text-xs text-slate-900 outline-none font-medium"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Store Official Email *
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@srisaipharmacy.in"
                    className="text-xs"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200/80 rounded-xl flex items-start gap-2.5">
                <Checkbox
                  id="coldChainReady"
                  checked={coldChainReady}
                  onCheckedChange={(checked) => setColdChainReady(!!checked)}
                  className="mt-0.5 border-teal-600 data-[state=checked]:bg-teal-700"
                />
                <label htmlFor="coldChainReady" className="text-xs text-slate-700 cursor-pointer">
                  <span className="font-bold text-teal-900 block flex items-center gap-1">
                    <Snowflake className="w-3.5 h-3.5 text-teal-600" />
                    Cold-Chain Storage Unit Available (2°C - 8°C)
                  </span>
                  Our chemist store operates a certified 24x7 temperature-logged medical refrigerator for insulin, vaccines, and biologics.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer mt-2"
              >
                <span>Complete Chemist Registration</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

