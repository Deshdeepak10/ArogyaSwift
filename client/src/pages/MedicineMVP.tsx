import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Truck,
  Thermometer,
  Clock,
  Pill,
  FileText,
  Sparkles,
  ChevronRight,
  Search,
  Building2,
  UserCheck,
  Lock,
  PhoneCall,
  Check,
  RefreshCw,
  LocateFixed,
  Zap,
  Info,
  ShieldAlert,
  HelpCircle,
  FileBadge2,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import RevenueCalculator from "@/components/RevenueCalculator";
import { LiveTrackingMap } from "@/components/LiveTrackingMap";
import { ProfileModal } from "@/components/ProfileModal";
import { useAuth } from "@/contexts/AuthContext";

interface PrescribedMed {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  quantity: number;
  price: number;
  genericPrice: number;
  requiresColdChain: boolean;
  isRxRequired: boolean;
  warnings?: string[];
  stockConfirmed?: boolean;
}

const SAMPLE_RX_DATA: Record<string, { doctor: string; patient: string; meds: PrescribedMed[]; date: string }> = {
  diabetes: {
    doctor: "Dr. Sarah Jenkins, MD (Endocrinology - Reg #MD-99481)",
    patient: "Aarav Sharma (Age: 52)",
    date: "Today, 10:15 AM",
    meds: [
      {
        id: "m1",
        name: "Lantus SoloStar Insulin Injection",
        genericName: "Insulin Glargine 100 IU/ml",
        dosage: "10 Units at Bedtime",
        frequency: "Once Daily",
        quantity: 2,
        price: 950,
        genericPrice: 620,
        requiresColdChain: true,
        isRxRequired: true,
        stockConfirmed: true,
        warnings: ["Requires cold storage (2°C - 8°C)", "Do not freeze"]
      },
      {
        id: "m2",
        name: "Glycomet-SR 500mg",
        genericName: "Metformin Hydrochloride",
        dosage: "500mg after meal",
        frequency: "Twice Daily",
        quantity: 30,
        price: 120,
        genericPrice: 65,
        requiresColdChain: false,
        isRxRequired: true,
        stockConfirmed: true,
        warnings: ["Take with meals to reduce GI side effects"]
      }
    ]
  },
  infection: {
    doctor: "Dr. Rajesh Sharma, MBBS (General Physician - Reg #MC-44821)",
    patient: "Anita Verma (Age: 34)",
    date: "Today, 02:30 PM",
    meds: [
      {
        id: "m3",
        name: "Augmentin 625 Duo",
        genericName: "Amoxicillin + Clavulanic Acid 625mg",
        dosage: "1 Tablet every 12 hours",
        frequency: "Twice Daily for 5 days",
        quantity: 10,
        price: 210,
        genericPrice: 135,
        requiresColdChain: false,
        isRxRequired: true,
        stockConfirmed: true,
        warnings: ["Complete 5-day course full cycle", "Take with food"]
      },
      {
        id: "m4",
        name: "Dolo 650",
        genericName: "Paracetamol 650mg",
        dosage: "1 Tablet when needed for fever",
        frequency: "Max 3 times daily",
        quantity: 15,
        price: 35,
        genericPrice: 20,
        requiresColdChain: false,
        isRxRequired: false,
        stockConfirmed: true,
        warnings: ["Do not exceed 4000mg Paracetamol per day"]
      }
    ]
  }
};

const PHARMACIES = [
  {
    id: "p1",
    name: "Sanjivani Medicos & Local Hub (Raj Nagar)",
    distance: "0.8 km",
    rating: "4.9 ★",
    coldChainReady: true,
    stockMatched: 100,
    etaMinutes: 18,
    pharmacistOnDuty: "Pharm. Priya Nair (Lic #UP-2021-00921)",
    riderType: "Pharmacy's Own Rider"
  },
  {
    id: "p2",
    name: "Apollo Express Hub (Kavi Nagar)",
    distance: "1.6 km",
    rating: "4.8 ★",
    coldChainReady: true,
    stockMatched: 100,
    etaMinutes: 25,
    pharmacistOnDuty: "Pharm. Suresh Kumar (Lic #UP-2019-04120)",
    riderType: "Shared Rider Network"
  },
  {
    id: "p3",
    name: "Wellness Forever (Indirapuram)",
    distance: "2.4 km",
    rating: "4.7 ★",
    coldChainReady: false,
    stockMatched: 80,
    etaMinutes: 32,
    pharmacistOnDuty: "Pharm. Ananya Rao (Lic #UP-2022-08819)",
    riderType: "Shared Rider Network"
  }
];

const LOCAL_ZONES = [
  "Raj Nagar Extension, Ghaziabad (UP)",
  "Kavi Nagar Main Rd, Ghaziabad (UP)",
  "Indirapuram, Ghaziabad (UP)",
  "Vaishali Sector 4, Ghaziabad (UP)",
  "Sector 62, Noida (UP)",
  "Indiranagar, Bangalore (KA)"
];

export default function MedicineMVP() {
  const [, setLocation] = useLocation();
  const {
    user,
    isAuthenticated,
    setIsAuthModalOpen,
    setIsPhoneSignupModalOpen,
    setPhoneSignupRole,
    registeredPharmacies,
    setIsPharmacyRegisterModalOpen,
    logout
  } = useAuth();
  const [activeTab, setActiveTab] = useState("ocr");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Delivery Location State
  const [selectedLocation, setSelectedLocation] = useState(LOCAL_ZONES[0]);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);

  // Delivery Service Level: Standard vs Priority Express
  const [deliveryOption, setDeliveryOption] = useState<"standard" | "express">("standard");

  // Prescription Privacy Consent
  const [hasGivenConsent, setHasGivenConsent] = useState(true);

  // Switch default tab based on logged in role
  useEffect(() => {
    if (user.role === "pharmacy") {
      setActiveTab("verification");
    } else if (user.role === "rider") {
      setActiveTab("delivery");
    } else if (user.role === "admin") {
      setActiveTab("admin");
    } else {
      setActiveTab("ocr");
    }
  }, [user.role]);

  // Workflow State
  const [selectedPreset, setSelectedPreset] = useState<"diabetes" | "infection">("diabetes");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedData, setScannedData] = useState<typeof SAMPLE_RX_DATA.diabetes | null>(SAMPLE_RX_DATA.diabetes);
  
  // Search query state for catalogue lookup
  const [searchQuery, setSearchQuery] = useState("");
  const [searchNotice, setSearchNotice] = useState<string | null>(null);

  // Generic substitution toggles
  const [useGenerics, setUseGenerics] = useState<Record<string, boolean>>({});

  // Pharmacist Verification State
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [pharmacistNote, setPharmacistNote] = useState(
    "Prescription verified by registered pharmacist. Doctor registration verified on CDSCO portal. Cold chain items flagged for insulated refrigeration packaging."
  );

  // Pharmacy Selection State
  const [selectedPharmacy, setSelectedPharmacy] = useState(PHARMACIES[0]);

  // Delivery Tracking State
  const [orderStage, setOrderStage] = useState<number>(1); // 1: Verified, 2: Packing, 3: Dispatch, 4: Out for Delivery, 5: Delivered
  const [riderProgress, setRiderProgress] = useState(25);
  const [coldTemp, setColdTemp] = useState(3.8); // Cold chain °C
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isDelivered, setIsDelivered] = useState(false);

  // Delivery Mode for selected pharmacy: own rider vs shared network
  const [riderMode, setRiderMode] = useState<"own" | "shared">("own");

  // Pill Reminder Checklist
  const [takenMeds, setTakenMeds] = useState<Record<string, boolean>>({});

  // Start OCR Animation when preset changes or manual trigger
  const runOcrScan = (presetKey: "diabetes" | "infection") => {
    setSelectedPreset(presetKey);
    setIsScanning(true);
    setScanProgress(10);
    setScannedData(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScannedData(SAMPLE_RX_DATA[presetKey]);
          toast.success("Prescription scanned & verified successfully!");
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  // Simulate rider movement and temperature fluctuations
  useEffect(() => {
    if (orderStage === 3 || orderStage === 4) {
      const interval = setInterval(() => {
        setRiderProgress((prev) => (prev < 90 ? prev + 5 : prev));
        setColdTemp((prev) => +(3.6 + Math.random() * 0.8).toFixed(1));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [orderStage]);

  const toggleGeneric = (id: string) => {
    setUseGenerics((prev) => ({ ...prev, [id]: !prev[id] }));
    toast.info("Switched to generic alternative for cost savings");
  };

  const calculateSubtotal = () => {
    if (!scannedData) return 0;
    return scannedData.meds.reduce((acc, med) => {
      const price = useGenerics[med.id] ? med.genericPrice : med.price;
      return acc + price;
    }, 0);
  };

  const platformFee = 15;
  const deliveryFee = deliveryOption === "express" ? 65 : 25;
  const totalPayable = calculateSubtotal() + platformFee + deliveryFee;

  const handleApprovePrescription = () => {
    setVerificationStatus("approved");
    toast.success("Pharmacist digital signature (#0x9F82) applied! Order unlocked for local hub quotation.");
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === "4829") {
      setIsDelivered(true);
      setOrderStage(5);
      setRiderProgress(100);
      toast.success("Delivery verified! Medicine handed over with CDSCO safety confirmation.");
    } else {
      toast.error("Invalid delivery OTP. Please verify 4-digit code with customer.");
    }
  };

  const handleDeviceLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          toast.success(`Device Location Acquired: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          setSelectedLocation("Current Device Location (Auto-detected)");
        },
        () => {
          toast.error("Location permission denied. Defaulting to Ghaziabad Zone.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleUrgentCall = () => {
    toast.info("Connecting to 24/7 Urgent Medicine Desk: +91 1800-6334-5465", {
      description: "Direct dispatch to verified local pharmacy partners for critical medications."
    });
  };

  const handleSearchMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchNotice(
      `Availability for "${searchQuery}" is currently UNCONFIRMED. Sourcing requests have been sent to 3 nearby pharmacies to check stock and provide quotations.`
    );
    toast.info(`Checking nearby pharmacy inventory for "${searchQuery}"...`);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 font-sans flex flex-col justify-between pb-16 md:pb-0">
      {/* Top Header */}
      <header className="border-b border-teal-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/")}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-teal-700 to-teal-900 rounded-xl text-white shadow-md shadow-teal-900/20">
                <Pill className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-lg font-black text-teal-950 tracking-tight flex items-center gap-1.5">
                  ArogyaSwift <span className="text-teal-600">Local</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                  Hyperlocal Independent Pharmacy Marketplace
                </p>
              </div>
            </div>
          </div>

          {/* Hyperlocal Location Pill */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsLocationSelectorOpen(!isLocationSelectorOpen)}
              className="flex items-center gap-1.5 bg-teal-50/80 hover:bg-teal-100/70 border border-teal-200/80 px-3 py-1.5 rounded-full text-xs font-semibold text-teal-900 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              <span className="truncate max-w-[200px]">{selectedLocation}</span>
              <span className="text-[10px] text-teal-600 font-normal">Change</span>
            </button>

            {isLocationSelectorOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Delivery Zone
                </div>
                {LOCAL_ZONES.map((zone) => (
                  <button
                    key={zone}
                    onClick={() => {
                      setSelectedLocation(zone);
                      setIsLocationSelectorOpen(false);
                      toast.success(`Delivery zone updated to ${zone}`);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedLocation === zone
                        ? "bg-teal-50 text-teal-900 font-bold border border-teal-200"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {zone}
                  </button>
                ))}
                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={handleDeviceLocation}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-teal-700 hover:bg-teal-50 transition-colors"
                  >
                    <LocateFixed className="w-3.5 h-3.5" /> Use Device GPS Location
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Urgent Helpline & Profile Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleUrgentCall}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 sm:px-3 py-1.5 shadow-xs flex items-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Urgent Medicine</span>
            </Button>

            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
              <span className="text-sm">{user.avatar}</span>
              <div className="text-left hidden lg:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight">{user.name}</span>
                <span className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider block">{user.role}</span>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs px-2 sm:px-2.5 py-1.5"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <UserCheck className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-500 hover:text-slate-900 text-xs px-2 py-1.5"
              onClick={() => {
                logout();
                setLocation("/");
              }}
            >
              Exit
            </Button>
          </div>
        </div>
      </header>

      {/* Role State Banner */}
      <div className="bg-teal-950 text-white py-2 px-4 text-xs font-medium border-b border-teal-800">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{user.avatar}</span>
            <span>
              Operating as <strong className="text-teal-300 font-bold">{user.name}</strong> ({user.badge})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-teal-800 text-teal-200 border-teal-700 text-[10px]">
              Zone: {selectedLocation.split(",")[0]}
            </Badge>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-teal-300 hover:text-white underline text-[11px] font-semibold"
            >
              Switch Role
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 py-2.5 shadow-xs sticky top-[61px] z-40">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-100 border border-slate-200 p-1 rounded-xl flex overflow-x-auto md:grid md:grid-cols-7 gap-1 w-full scrollbar-none">
              <TabsTrigger value="ocr" className="shrink-0 whitespace-nowrap data-[state=active]:bg-teal-800 data-[state=active]:text-white font-bold text-xs py-2">
                1. Customer & Rx
              </TabsTrigger>
              <TabsTrigger value="verification" className="shrink-0 whitespace-nowrap data-[state=active]:bg-teal-800 data-[state=active]:text-white font-bold text-xs py-2">
                2. Pharmacist Audit
              </TabsTrigger>
              <TabsTrigger value="dispatch" className="shrink-0 whitespace-nowrap data-[state=active]:bg-teal-800 data-[state=active]:text-white font-bold text-xs py-2">
                3. Pharmacy Quotes
              </TabsTrigger>
              <TabsTrigger value="delivery" className="shrink-0 whitespace-nowrap data-[state=active]:bg-teal-800 data-[state=active]:text-white font-bold text-xs py-2">
                4. Rider Delivery
              </TabsTrigger>
              <TabsTrigger value="reminders" className="shrink-0 whitespace-nowrap data-[state=active]:bg-teal-800 data-[state=active]:text-white font-bold text-xs py-2">
                5. Pill Vault
              </TabsTrigger>
              <TabsTrigger value="admin" className="shrink-0 whitespace-nowrap data-[state=active]:bg-teal-800 data-[state=active]:text-white font-bold text-xs py-2">
                6. Admin Console
              </TabsTrigger>
              <TabsTrigger value="revenue" className="shrink-0 whitespace-nowrap data-[state=active]:bg-teal-800 data-[state=active]:text-white font-bold text-xs py-2">
                7. Marketplace Fees
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT 1: CUSTOMER RX & SEARCH */}
            <TabsContent value="ocr" className="mt-6 space-y-6">
              {/* Medicine Search & Unconfirmed Inventory Disclaimer */}
              <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Search className="w-4 h-4 text-teal-700" /> Search Medicines Across Local Pharmacies
                    </h3>
                    <p className="text-xs text-slate-500">
                      We query licensed pharmacies near {selectedLocation.split(",")[0]}. Prices and availability are confirmed directly by pharmacy partners.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-[10px] font-semibold">
                    <Info className="w-3 h-3 mr-1" /> Unconfirmed Until Pharmacy Quote
                  </Badge>
                </div>

                <form onSubmit={handleSearchMedicine} className="flex gap-2">
                  <Input
                    placeholder="Search by brand name or salt (e.g., Lantus, Metformin, Augmentin, Dolo 650, Telmisartan)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border-slate-300 text-sm focus:border-teal-600"
                  />
                  <Button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 text-xs">
                    Search
                  </Button>
                </form>

                {searchNotice && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{searchNotice}</span>
                  </div>
                )}
              </div>

              {/* Delivery Service Level Toggle */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setDeliveryOption("standard")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    deliveryOption === "standard"
                      ? "border-teal-600 bg-teal-50/70 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-700" />
                      <span className="font-bold text-sm text-slate-900">Standard Delivery</span>
                    </div>
                    <Badge className="bg-teal-100 text-teal-800 border-teal-200 text-xs">Target: ~3 Hours</Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Optimal for routine prescriptions and daily refills. Prepared and verified with scheduled dispatch.
                  </p>
                  <div className="mt-2 text-xs font-semibold text-teal-800">Delivery Fee: ₹25</div>
                </div>

                <div
                  onClick={() => setDeliveryOption("express")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    deliveryOption === "express"
                      ? "border-emerald-600 bg-emerald-50/70 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-sm text-slate-900">Priority Express</span>
                    </div>
                    <Badge className="bg-emerald-600 text-white text-xs font-bold">Target: ~30 Mins</Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    For urgent acute medications. Subject to immediate local pharmacy confirmation and rider proximity.
                  </p>
                  <div className="mt-2 text-xs font-semibold text-emerald-800">Express Delivery Fee: ₹65 (incl. ₹40 surcharge)</div>
                </div>
              </div>

              {/* Prescription Upload & Privacy Consent */}
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Upload Column */}
                <div className="lg:col-span-5 space-y-5">
                  <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-teal-800 text-base">
                        <Upload className="w-4 h-4 text-teal-600" /> Upload Medical Prescription
                      </CardTitle>
                      <CardDescription className="text-slate-600 text-xs">
                        Private encrypted upload reviewed strictly by licensed pharmacy professionals.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Preset Rx Selector */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => runOcrScan("diabetes")}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            selectedPreset === "diabetes"
                              ? "border-teal-600 bg-teal-50 text-slate-900 shadow-xs"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block mb-1">Rx Sample A</span>
                          <span className="font-bold block text-xs">Insulin & Glycomet</span>
                          <span className="text-[11px] text-cyan-700 font-medium mt-1 block">❄️ Cold-chain (2°C-8°C)</span>
                        </button>

                        <button
                          onClick={() => runOcrScan("infection")}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            selectedPreset === "infection"
                              ? "border-teal-600 bg-teal-50 text-slate-900 shadow-xs"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block mb-1">Rx Sample B</span>
                          <span className="font-bold block text-xs">Augmentin & Dolo 650</span>
                          <span className="text-[11px] text-slate-500 mt-1 block">Regulated Antibiotic</span>
                        </button>
                      </div>

                      {/* Drag & Drop Prescription Box */}
                      <div className="border-2 border-dashed border-teal-200 rounded-xl p-5 text-center hover:border-teal-500 transition-colors cursor-pointer bg-teal-50/30">
                        <FileText className="w-7 h-7 text-teal-600 mx-auto mb-1.5" />
                        <p className="text-xs font-semibold text-slate-800">Upload Doctor Prescription (Photo / PDF)</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Encrypted private storage. Max file size: 10MB</p>
                        <Button size="sm" variant="outline" className="mt-3 border-teal-300 text-teal-700 hover:bg-teal-50 text-xs">
                          Choose File
                        </Button>
                      </div>

                      {/* Mandatory Privacy Consent Checkbox */}
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={hasGivenConsent}
                            onChange={(e) => setHasGivenConsent(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span>
                            <strong>Explicit Privacy Consent:</strong> I agree to privately share this prescription with verified pharmacy professionals for dispensing verification and quotations. It will not be made public.
                          </span>
                        </label>
                      </div>

                      {/* OCR Scanner Animation */}
                      {isScanning && (
                        <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-teal-900 font-semibold flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 animate-spin text-teal-600" /> Reading Prescription Details...
                            </span>
                            <span className="font-mono text-teal-700 font-bold">{scanProgress}%</span>
                          </div>
                          <Progress value={scanProgress} className="h-1.5 bg-teal-200" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Parsed Prescription & Generic Suggestions */}
                <div className="lg:col-span-7 space-y-5">
                  {scannedData ? (
                    <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                      <CardHeader className="border-b border-slate-100 pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Extracted Medicines & Generic Alternatives
                            </CardTitle>
                            <CardDescription className="text-slate-600 text-xs mt-0.5">
                              Doctor: <span className="text-slate-900 font-medium">{scannedData.doctor}</span> • Date: {scannedData.date}
                            </CardDescription>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                            Verified Rx Match
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4">
                        <div className="space-y-3">
                          {scannedData.meds.map((med) => {
                            const isGeneric = useGenerics[med.id];
                            const currentPrice = isGeneric ? med.genericPrice : med.price;
                            const savings = med.price - med.genericPrice;

                            return (
                              <div
                                key={med.id}
                                className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl space-y-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-sm text-slate-900">{med.name}</h4>
                                      {med.requiresColdChain && (
                                        <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300 text-[10px]">
                                          ❄️ 2°C - 8°C Cold Chain
                                        </Badge>
                                      )}
                                      <Badge className="bg-slate-200 text-slate-800 text-[10px]">
                                        Qty: {med.quantity}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      Active Salt: <span className="font-semibold text-slate-700">{med.genericName}</span>
                                    </p>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                      Dose: {med.dosage} • Frequency: {med.frequency}
                                    </p>
                                    {med.warnings && (
                                      <div className="mt-1 text-[11px] text-amber-800 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3 text-amber-600" /> {med.warnings[0]}
                                      </div>
                                    )}
                                  </div>

                                  <div className="text-right flex-shrink-0">
                                    <span className="text-base font-bold text-slate-900 block">₹{currentPrice}</span>
                                    {isGeneric && (
                                      <span className="text-[10px] text-emerald-700 font-bold block">Save ₹{savings}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Generic Alternative Toggle */}
                                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                                  <div>
                                    <span className="text-slate-600 font-medium">Affordable Generic Option: </span>
                                    <span className="font-bold text-slate-900">{med.genericName}</span>
                                    <span className="text-emerald-700 font-bold ml-1.5">(₹{med.genericPrice})</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant={isGeneric ? "default" : "outline"}
                                    onClick={() => toggleGeneric(med.id)}
                                    className={
                                      isGeneric
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs h-7"
                                        : "border-slate-300 text-slate-700 text-xs h-7"
                                    }
                                  >
                                    {isGeneric ? "Using Generic ✓" : "Switch & Save"}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Price Breakdown Footer */}
                        <div className="bg-teal-50/70 p-4 rounded-xl border border-teal-200/80 space-y-2">
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Medicines Estimate</span>
                            <span className="font-semibold text-slate-900">₹{calculateSubtotal()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Platform Facilitation Fee</span>
                            <span className="font-semibold text-slate-900">₹{platformFee}</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Delivery ({deliveryOption === "express" ? "Priority Express ~30m" : "Standard ~3h"})</span>
                            <span className="font-semibold text-slate-900">₹{deliveryFee}</span>
                          </div>
                          <div className="pt-2 border-t border-teal-200 flex items-center justify-between">
                            <div>
                              <span className="text-xs text-teal-900 block font-bold">Estimated Total Payable</span>
                              <span className="text-2xl font-black text-teal-900">₹{totalPayable}</span>
                            </div>
                            <Button
                              size="lg"
                              disabled={!hasGivenConsent}
                              className="bg-teal-700 text-white hover:bg-teal-800 font-bold text-xs sm:text-sm px-5 py-5 shadow-sm"
                              onClick={() => {
                                setActiveTab("verification");
                                toast.success("Prescription submitted to pharmacist audit queue");
                              }}
                            >
                              Proceed to Pharmacist Review <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="h-64 border border-slate-200 rounded-xl bg-white flex items-center justify-center text-slate-500 text-xs">
                      Select or scan a prescription to view parsed items
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB CONTENT 2: PHARMACIST AUDIT PORTAL */}
            <TabsContent value="verification" className="mt-6 space-y-6">
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-teal-700" /> Licensed Pharmacist Clinical Audit
                          </CardTitle>
                          <CardDescription className="text-slate-600 text-xs mt-0.5">
                            Evaluating Pharmacist: Pharm. Rajesh Menon (Registration #UP-2020-00812)
                          </CardDescription>
                        </div>
                        <Badge
                          className={
                            verificationStatus === "approved"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 text-xs"
                              : "bg-amber-100 text-amber-800 border-amber-300 text-xs"
                          }
                        >
                          Status: {verificationStatus.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {/* Regulatory Checks */}
                      <div className="space-y-2.5">
                        <h4 className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                          Statutory Prescription Checks (CDSCO & Pharmacy Act)
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-2.5">
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                            <span className="text-slate-700">Prescribing Doctor Verification</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> NMC Registered
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                            <span className="text-slate-700">Drug-Drug Interaction Check</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> No Contraindications
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                            <span className="text-slate-700">Dosage & Duration Validity</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Within Limits
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                            <span className="text-slate-700">Cold Chain Packaging Requirement</span>
                            <span className="text-cyan-700 font-bold">Insulated 2°C-8°C Box</span>
                          </div>
                        </div>
                      </div>

                      {/* Audit Note */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Pharmacist Dispensing Review Note</label>
                        <Input
                          value={pharmacistNote}
                          onChange={(e) => setPharmacistNote(e.target.value)}
                          className="bg-slate-50 border-slate-300 text-slate-900 text-xs"
                        />
                      </div>

                      {/* Digital Seal */}
                      {verificationStatus === "approved" && (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                            ✓
                          </div>
                          <div>
                            <h5 className="font-bold text-emerald-900 text-xs">Pharmacist Digital Signature Applied</h5>
                            <p className="text-[11px] text-slate-600">
                              Cryptographic Stamp: #0x9F82A41B | Logged in compliance audit trail with timestamp.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={handleApprovePrescription}
                          className="flex-1 bg-teal-700 text-white hover:bg-teal-800 font-bold text-xs py-4"
                        >
                          Approve & Sign Prescription (#0x9F82)
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setVerificationStatus("rejected");
                            toast.error("Prescription rejected by pharmacist.");
                          }}
                          className="border-rose-200 text-rose-600 hover:bg-rose-50 text-xs"
                        >
                          Reject Prescription
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-4 space-y-5">
                  <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-teal-700" /> Regulatory Protocol
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs text-slate-600">
                      <div className="flex gap-2">
                        <Lock className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                        <span>All Schedule H and H1 medications require review by an authorized pharmacist under Indian law.</span>
                      </div>
                      <div className="flex gap-2">
                        <PhoneCall className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <span>If dosage is ambiguous, the pharmacist conducts a direct consultation prior to order confirmation.</span>
                      </div>
                    </CardContent>
                  </Card>

                  {verificationStatus === "approved" && (
                    <Button
                      size="lg"
                      className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-bold py-5 text-xs sm:text-sm shadow-sm"
                      onClick={() => setActiveTab("dispatch")}
                    >
                      Compare Pharmacy Quotes <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB CONTENT 3: LOCAL PHARMACY QUOTES & SELECTION */}
            <TabsContent value="dispatch" className="mt-6 space-y-6">
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-teal-700" /> Confirmed Pharmacy Quotations Near You
                      </h3>
                      <p className="text-slate-500 text-xs">
                        Participating neighborhood pharmacies have quoted prices and confirmed stock availability.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsPharmacyRegisterModalOpen(true)}
                      className="border-teal-200 text-teal-700 hover:bg-teal-50 font-bold text-xs"
                    >
                      + Register Pharmacy
                    </Button>
                  </div>

                  <div className="space-y-3.5">
                    {registeredPharmacies.map((pharmacy) => {
                      const isSelected = selectedPharmacy.id === pharmacy.id;
                      return (
                        <div
                          key={pharmacy.id}
                          onClick={() => setSelectedPharmacy({
                            id: pharmacy.id,
                            name: pharmacy.shopName,
                            distance: pharmacy.distance,
                            rating: pharmacy.rating,
                            coldChainReady: pharmacy.coldChainReady,
                            stockMatched: pharmacy.stockMatched,
                            etaMinutes: pharmacy.etaMinutes,
                            pharmacistOnDuty: pharmacy.ownerName + ` (Lic #${pharmacy.licenseNo})`,
                            riderType: "Pharmacy's Own Rider"
                          })}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "border-teal-600 bg-teal-50/70 text-slate-900 shadow-sm"
                              : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900">{pharmacy.shopName}</h4>
                                <Badge variant="outline" className="border-teal-200 text-teal-800 bg-teal-50 text-[10px]">
                                  {pharmacy.rating}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-teal-600" /> {pharmacy.distance} away • ETA ~{pharmacy.etaMinutes} mins
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Pharmacist: {pharmacy.ownerName} (Lic #{pharmacy.licenseNo})
                              </p>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-bold">
                                Stock Match: {pharmacy.stockMatched}% Confirmed
                              </Badge>
                              <div className="text-xs font-bold text-teal-900 mt-1">
                                Quoted: ₹{calculateSubtotal()}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="flex items-center gap-1 text-cyan-700 font-medium text-[11px]">
                              <Thermometer className="w-3.5 h-3.5" /> Cold Storage 2°C–8°C Ready
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-600">
                                {isSelected ? "Own Rider Assigned" : "Own Rider Available"}
                              </Badge>
                              <Button
                                size="sm"
                                variant={isSelected ? "default" : "outline"}
                                className={isSelected ? "bg-teal-700 text-white font-bold text-xs h-7" : "border-slate-300 text-xs h-7"}
                              >
                                {isSelected ? "Selected Shop ✓" : "Select Shop"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final Order Breakdown & Checkout */}
                <div className="lg:col-span-5 space-y-5">
                  <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-teal-700" /> Transparent Order Payable Breakdown
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Disclosed transparently prior to order confirmation.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3.5 text-xs">
                      <div className="space-y-2 border-b border-slate-100 pb-3">
                        <div className="flex justify-between text-slate-600">
                          <span>Medicines Quoted Cost</span>
                          <span className="font-semibold text-slate-900">₹{calculateSubtotal()}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Cold-Chain Insulated Box</span>
                          <span className="text-emerald-700 font-bold">FREE (Compliant)</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Platform Facilitation Fee</span>
                          <span className="font-semibold text-slate-900">₹{platformFee}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>
                            Delivery ({deliveryOption === "express" ? "Priority Express ~30m" : "Standard ~3h"})
                          </span>
                          <span className="font-semibold text-slate-900">₹{deliveryFee}</span>
                        </div>
                      </div>

                      {/* Rider Arrangement Toggle */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                        <span className="text-[11px] font-bold text-slate-700 block uppercase">
                          Delivery Fulfilment Arrangement:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setRiderMode("own")}
                            className={`p-2 rounded-lg text-left text-xs font-semibold border transition-all ${
                              riderMode === "own"
                                ? "bg-white border-teal-600 text-teal-900 shadow-xs"
                                : "border-slate-200 text-slate-600"
                            }`}
                          >
                            🚴 Pharmacy's Rider
                          </button>
                          <button
                            type="button"
                            onClick={() => setRiderMode("shared")}
                            className={`p-2 rounded-lg text-left text-xs font-semibold border transition-all ${
                              riderMode === "shared"
                                ? "bg-white border-teal-600 text-teal-900 shadow-xs"
                                : "border-slate-200 text-slate-600"
                            }`}
                          >
                            🏍️ Shared Network Rider
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1">
                        <span>Final Total Payable</span>
                        <span className="text-teal-900 text-xl font-black">₹{totalPayable}</span>
                      </div>

                      <Button
                        size="lg"
                        className="w-full bg-teal-700 text-white hover:bg-teal-800 font-bold py-5 text-sm mt-3 shadow-sm"
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast.info(`Please enter your mobile number to confirm your order with ${selectedPharmacy.name}`, {
                              description: "Your cart and quotation are safely preserved. We'll send live SMS delivery updates."
                            });
                            setPhoneSignupRole("patient");
                            setIsPhoneSignupModalOpen(true);
                            return;
                          }
                          setOrderStage(3);
                          setActiveTab("delivery");
                          toast.success("Order confirmed with " + selectedPharmacy.name);
                        }}
                      >
                        Confirm Order & Track Delivery <Truck className="w-4 h-4 ml-1.5" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* TAB CONTENT 4: RIDER DELIVERY & LIVE TELEMETRY */}
            <TabsContent value="delivery" className="mt-6 space-y-6">
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-5">
                  {/* Live Satellite GPS Tracking Map */}
                  <LiveTrackingMap
                    pharmacyName={selectedPharmacy.name}
                    riderProgress={riderProgress}
                    coldTemp={coldTemp}
                  />

                  {/* Cold Chain Live Telemetry */}
                  <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-cyan-600 animate-pulse" /> Cold-Chain Telemetry (2°C–8°C)
                        </CardTitle>
                        <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300 text-[10px]">
                          LIVE Sensor Reading
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-cyan-50/50 border border-cyan-200/80 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                            Active Box Sensor
                          </span>
                          <span className="text-3xl font-black text-cyan-800 mt-0.5 block">{coldTemp} °C</span>
                          <span className="text-xs text-emerald-700 font-semibold mt-0.5 block">
                            ✓ Compliant with CDSCO Cold Chain Norms
                          </span>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 font-bold">
                          ❄️
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Delivery Route Progress</span>
                          <span className="text-teal-800 font-bold">{riderProgress}%</span>
                        </div>
                        <Progress value={riderProgress} className="h-2 bg-slate-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recipient OTP Verification */}
                <div className="lg:col-span-5 space-y-5">
                  <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-600" /> Secure Recipient OTP Verification
                      </CardTitle>
                      <CardDescription className="text-slate-600 text-xs">
                        Medicines are handed over only upon verifying the 4-digit PIN.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center space-y-1.5">
                        <span className="text-xs text-amber-800 font-semibold uppercase tracking-wider">
                          Recipient Handoff PIN
                        </span>
                        <span className="text-3xl font-mono font-black text-amber-800 tracking-widest block">4829</span>
                        <p className="text-[11px] text-slate-500">Provide this PIN to your delivery rider upon arrival</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">Rider Handshake Simulation (Enter 4829)</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter 4-digit PIN"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value)}
                            maxLength={4}
                            className="bg-slate-50 border-slate-300 text-center font-mono text-base text-slate-900"
                          />
                          <Button
                            onClick={handleVerifyOtp}
                            className="bg-teal-700 text-white hover:bg-teal-800 font-bold px-5 text-xs shadow-xs"
                          >
                            Verify
                          </Button>
                        </div>
                      </div>

                      {isDelivered && (
                        <div className="p-3.5 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-950 text-xs font-semibold flex items-center gap-2.5">
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                          <span>Delivery fulfilled! Recipient verified and digital proof logged.</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* TAB CONTENT 5: PILL REMINDER CABINET */}
            <TabsContent value="reminders" className="mt-6 space-y-6">
              <div className="max-w-4xl mx-auto space-y-5">
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-700" /> Digital Dosage Cabinet & Reminder Vault
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-xs">
                      Synced from your verified prescriptions to ensure complete medication compliance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scannedData?.meds.map((med) => {
                      const isTaken = takenMeds[med.id];
                      return (
                        <div
                          key={med.id}
                          className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${isTaken ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                              <Pill className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{med.name}</h4>
                              <p className="text-[11px] text-slate-600">{med.dosage} • {med.frequency}</p>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => {
                              setTakenMeds((prev) => ({ ...prev, [med.id]: !prev[med.id] }));
                              toast.success(isTaken ? "Marked dose as pending" : "Dose logged as taken!");
                            }}
                            variant={isTaken ? "default" : "outline"}
                            className={isTaken ? "bg-emerald-600 text-white font-bold text-xs" : "border-slate-300 text-slate-700 text-xs"}
                          >
                            {isTaken ? "Taken ✓" : "Mark Taken"}
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB CONTENT 6: ADMIN GOVERNANCE & REGULATORY AUDIT */}
            <TabsContent value="admin" className="mt-6 space-y-6">
              <div className="max-w-5xl mx-auto space-y-5">
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                  <CardHeader className="border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-indigo-700" /> ArogyaSwift Administrator Regulatory Console
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Central dashboard for credential auditing, pharmacy verification, and settlement oversight.
                        </CardDescription>
                      </div>
                      <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-xs">
                        Admin Role
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Verified Pharmacies</span>
                        <span className="text-xl font-black text-teal-900 mt-1 block">18 Active</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Pending License Audits</span>
                        <span className="text-xl font-black text-amber-700 mt-1 block">2 Pending</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Active Express Riders</span>
                        <span className="text-xl font-black text-cyan-800 mt-1 block">34 On Duty</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Customer Resolution Rate</span>
                        <span className="text-xl font-black text-emerald-700 mt-1 block">99.4%</span>
                      </div>
                    </div>

                    {/* Verification Queue Table */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Pharmacy License Verification Queue (Form 20/21)
                      </h4>
                      <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="p-3">Pharmacy Shop</th>
                              <th className="p-3">License No.</th>
                              <th className="p-3">Zone</th>
                              <th className="p-3">Cold Chain</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr>
                              <td className="p-3 font-medium">Sanjivani Medicos</td>
                              <td className="p-3 font-mono">UP-2021-00921</td>
                              <td className="p-3">Raj Nagar, Ghaziabad</td>
                              <td className="p-3 text-emerald-700 font-bold">✓ Insulated</td>
                              <td className="p-3">
                                <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Verified</Badge>
                              </td>
                              <td className="p-3">
                                <Button size="sm" variant="outline" className="text-xs h-7">Inspect</Button>
                              </td>
                            </tr>
                            <tr>
                              <td className="p-3 font-medium">Kavi Nagar Chemist</td>
                              <td className="p-3 font-mono">UP-2024-08819</td>
                              <td className="p-3">Kavi Nagar, Ghaziabad</td>
                              <td className="p-3 text-slate-500">Standard</td>
                              <td className="p-3">
                                <Badge className="bg-amber-100 text-amber-800 text-[10px]">Pending Review</Badge>
                              </td>
                              <td className="p-3">
                                <Button size="sm" className="bg-teal-700 text-white text-xs h-7">Audit License</Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB CONTENT 7: MARKETPLACE UNIT ECONOMICS */}
            <TabsContent value="revenue" className="mt-6 space-y-6">
              <RevenueCalculator darkTheme={false} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Fixed Mobile App Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => setActiveTab("ocr")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            activeTab === "ocr" ? "text-teal-700 font-extrabold" : "text-slate-500"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Customer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("verification")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            activeTab === "verification" ? "text-teal-700 font-extrabold" : "text-slate-500"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Pharmacist</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dispatch")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            activeTab === "dispatch" ? "text-teal-700 font-extrabold" : "text-slate-500"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Quotes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("delivery")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            activeTab === "delivery" ? "text-teal-700 font-extrabold" : "text-slate-500"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Rider</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("admin")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            activeTab === "admin" ? "text-teal-700 font-extrabold" : "text-slate-500"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Admin</span>
        </button>
      </nav>

      {/* User, Rider & Pharmacy Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
