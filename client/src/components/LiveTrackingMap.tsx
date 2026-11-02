import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapView } from "@/components/Map";
import {
  Navigation,
  Bike,
  Building2,
  Home,
  Thermometer,
  ShieldCheck,
  Play,
  Pause,
  RotateCcw,
  Signal,
  PhoneCall,
  MessageSquare,
  KeyRound,
  Layers,
  MapPin,
  Compass,
  Zap,
  Volume2,
  VolumeX,
  Star,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

interface LiveTrackingMapProps {
  pharmacyName?: string;
  patientAddress?: string;
  riderName?: string;
  orderStage?: number;
  riderProgress?: number;
  coldTemp?: number;
  riderPhone?: string;
  vehicleNo?: string;
}

export function LiveTrackingMap({
  pharmacyName = "Apollo Express Pharmacy (Raj Nagar, Ghaziabad)",
  patientAddress = "Flat 402, Shipra Sun City, Indirapuram, Ghaziabad",
  riderName = "Vikram Singh",
  orderStage = 4,
  riderProgress = 60,
  coldTemp = 3.8,
  riderPhone = "+91 98765 99887",
  vehicleNo = "KA-01-EV-9821"
}: LiveTrackingMapProps) {
  const [progress, setProgress] = useState(riderProgress);
  const [isLiveMoving, setIsLiveMoving] = useState(true);
  const [currentTemp, setCurrentTemp] = useState(coldTemp);
  const [riderSpeed, setRiderSpeed] = useState(28);
  const [mapMode, setMapMode] = useState<"arogyaswift_tech" | "google_maps">("google_maps");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCaptainCard, setShowCaptainCard] = useState(true);
  const [trafficCondition, setTrafficCondition] = useState<"Low" | "Moderate">("Low");

  // Sync external progress
  useEffect(() => {
    setProgress(riderProgress);
  }, [riderProgress]);

  // Simulate smooth GPS movement & temperature updates
  useEffect(() => {
    if (!isLiveMoving) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 96 ? prev + 0.8 : 12));
      setCurrentTemp((prev) => +(3.5 + Math.random() * 0.7).toFixed(1));
      setRiderSpeed((prev) => Math.floor(25 + Math.random() * 8));
      if (Math.random() > 0.8) {
        setTrafficCondition((prev) => (prev === "Low" ? "Moderate" : "Low"));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveMoving]);

  // Calculate SVG marker coordinates along a curved road path
  const pathX = 90 + (progress / 100) * 580;
  const pathY = 190 - Math.sin((progress / 100) * Math.PI * 2) * 45;

  const handleCallCaptain = () => {
    toast.info(`📞 Dialing Express Delivery Captain ${riderName}: ${riderPhone}`);
  };

  const handleMessageCaptain = () => {
    toast.success(`💬 Message sent to Captain ${riderName}: "Please deliver to Flat 402 security desk."`);
  };

  const handleUseDeviceGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info("📡 Requesting device GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        toast.success(`📍 Device GPS Acquired! (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      },
      (err) => {
        toast.error(`Unable to retrieve GPS location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative">
      {/* Top ArogyaSwift Navigation Bar */}
      <div className="p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center font-extrabold shadow-lg shadow-emerald-500/20">
            <Bike className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                ArogyaSwift <span className="text-emerald-400">Express Delivery</span>
              </h4>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] uppercase font-bold">
                <Signal className="w-3 h-3 mr-1 animate-pulse" /> Live Telemetry
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Order #QM-9821</span>
              <span>•</span>
              <span className="text-emerald-300 font-semibold">{riderName} ({vehicleNo})</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Map Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Device GPS Button */}
          <button
            type="button"
            onClick={handleUseDeviceGPS}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors border border-emerald-500/40 text-xs flex items-center gap-1"
            title="Use Device GPS Location"
          >
            Locate Me
          </button>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              toast.info(soundEnabled ? "🔇 Live Audio Navigation Muted" : "🔊 Live Voice Navigation Enabled");
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 text-xs flex items-center"
            title="Toggle Navigation Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Mode Switcher */}
          <div className="p-1 bg-slate-950 rounded-xl border border-slate-800 flex text-xs font-bold">
            <button
              type="button"
              onClick={() => setMapMode("arogyaswift_tech")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                mapMode === "arogyaswift_tech"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> ArogyaSwift Tech Map
            </button>
            <button
              type="button"
              onClick={() => setMapMode("google_maps")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                mapMode === "google_maps"
                  ? "bg-cyan-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Google Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Rendering Area */}
      <div className="relative w-full h-[380px] bg-slate-950 overflow-hidden">
        {mapMode === "google_maps" ? (
          <MapView
            initialCenter={{ lat: 28.6692, lng: 77.4538 }} // Ghaziabad Coordinates
            initialZoom={14}
            className="w-full h-full"
          />
        ) : (
          /* ArogyaSwift High-Tech Dark Vector Map Canvas */
          <div className="w-full h-full relative bg-slate-950">
            {/* Map Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />

            {/* Simulated Road Network Lines */}
            <svg className="w-full h-full absolute inset-0 pointer-events-none">
              <defs>
                <linearGradient id="arogyaswiftGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Background Grid Roads */}
              <line x1="0" y1="120" x2="800" y2="120" stroke="#1e293b" strokeWidth="6" strokeDasharray="10 10" />
              <line x1="0" y1="280" x2="800" y2="280" stroke="#1e293b" strokeWidth="6" strokeDasharray="10 10" />
              <line x1="200" y1="0" x2="200" y2="400" stroke="#1e293b" strokeWidth="6" strokeDasharray="10 10" />
              <line x1="550" y1="0" x2="550" y2="400" stroke="#1e293b" strokeWidth="6" strokeDasharray="10 10" />

              {/* Main Active Route Line */}
              <path
                d="M 90 190 C 230 110, 430 270, 670 190"
                fill="none"
                stroke="#334155"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 90 190 C 230 110, 430 270, 670 190"
                fill="none"
                stroke="url(#arogyaswiftGlow)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="12 8"
                className="animate-[dash_15s_linear_infinite]"
              />
            </svg>

            {/* 1. Pharmacy Store Pin (Start) */}
            <div className="absolute top-[145px] left-[50px] flex flex-col items-center z-10">
              <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-xl border-2 border-white shadow-emerald-500/30 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="mt-1.5 bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap">
                🏥 Hub: Apollo Ghaziabad
              </div>
            </div>

            {/* 2. Destination Customer Home Pin (End) */}
            <div className="absolute top-[145px] right-[50px] flex flex-col items-center z-10">
              <div className="bg-cyan-600 text-white p-3 rounded-2xl shadow-xl border-2 border-white shadow-cyan-500/30 flex items-center justify-center">
                <Home className="w-6 h-6" />
              </div>
              <div className="mt-1.5 bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap">
                🏠 Destination: Ghaziabad
              </div>
            </div>

            {/* 3. Live Animated Delivery Captain Marker */}
            <div
              className="absolute z-30 transition-all duration-700 ease-out flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pathX}px`, top: `${pathY}px` }}
            >
              {/* Cold Storage Box Floating Badge */}
              <div className="mb-1 bg-cyan-950 border border-cyan-400 text-cyan-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xl flex items-center gap-1 animate-pulse">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" /> {currentTemp}°C Cold Storage
              </div>

              {/* Bike Icon Marker */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-full p-0.5 shadow-2xl border-2 border-slate-950 flex items-center justify-center text-slate-950 font-bold">
                  <Bike className="w-7 h-7 animate-bounce text-slate-950" />
                </div>
                {/* Radar Ping Animation */}
                <span className="absolute -inset-1.5 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
              </div>

              <div className="mt-1 bg-slate-950 border border-emerald-500/60 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">
                ⚡ {riderSpeed} km/h • ArogyaSwift EV
              </div>
            </div>
          </div>
        )}

        {/* Floating Live Telemetry HUD (Top Right of Map) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl p-3 shadow-xl space-y-1 text-right pointer-events-auto">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Live Traffic</span>
            <span className="text-xs font-extrabold text-emerald-400 flex items-center justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> {trafficCondition} Traffic
            </span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl p-3 shadow-xl space-y-1 text-right pointer-events-auto">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">ETA Arrival</span>
            <span className="text-sm font-extrabold font-mono text-emerald-400">
              ~{Math.max(2, Math.ceil((100 - progress) * 0.14))} Mins
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Captain Info Card (Bottom Sheet) */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-4">
        {/* Progress Bar & Stage Indicator */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Delivery Route Progress</span>
            <span className="text-emerald-400 font-bold font-mono">{Math.round(progress)}% Completed</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-800" />
        </div>

        {/* Driver Card */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          {/* Captain Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              👨‍✈️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="font-extrabold text-white text-base">{riderName}</h5>
                <Badge className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] flex items-center gap-1">
                  <Star className="w-3 h-3 fill-slate-950" /> 4.9 Express Captain
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Vehicle: <strong className="text-slate-200">{vehicleNo}</strong></span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">2,410 Deliveries Done</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & OTP Verification */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-slate-900 border border-emerald-500/30 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Delivery OTP</span>
              <strong className="text-emerald-400 text-sm font-mono font-extrabold tracking-wider">7392</strong>
            </div>

            <Button
              size="sm"
              onClick={handleCallCaptain}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <PhoneCall className="w-4 h-4" /> Call
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleMessageCaptain}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" /> Chat
            </Button>
          </div>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Temperature monitored & cold-chain verified by CDSCO protocol</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsLiveMoving(!isLiveMoving)}
              className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs h-7"
            >
              {isLiveMoving ? <Pause className="w-3.5 h-3.5 mr-1 text-amber-400" /> : <Play className="w-3.5 h-3.5 mr-1 text-emerald-400" />}
              {isLiveMoving ? "Pause Simulation" : "Resume Live Simulation"}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setProgress(15)}
              className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs h-7"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
