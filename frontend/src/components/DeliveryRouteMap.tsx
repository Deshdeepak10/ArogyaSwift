import { useState } from "react";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Store,
  Home,
  Bike,
  Compass,
  Copy,
  CheckCircle2,
  Share2,
  Clock,
  ShieldCheck,
  Maximize2
} from "lucide-react";
import {
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedUrl,
  getGoogleMapsSearchUrl,
  formatAddressForMaps,
  openGoogleMapsNavigation
} from "@/lib/googleMaps";
import { toast } from "sonner";

export interface DeliveryRouteMapProps {
  orderId: string;
  patientName: string;
  patientAddress: string;
  patientPhone?: string;
  area?: string;
  pickupStops: {
    id: string;
    pharmacyName: string;
    address: string;
    isCollected: boolean;
    parcelLabel?: string;
  }[];
  currentStepIndex?: number;
  riderName?: string;
}

export function DeliveryRouteMap({
  orderId,
  patientName,
  patientAddress,
  patientPhone,
  area,
  pickupStops,
  currentStepIndex = 1,
  riderName
}: DeliveryRouteMapProps) {
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapViewMode, setMapViewMode] = useState<"route" | "destination" | "origin">("route");

  const firstStop = pickupStops[0];
  const originAddress = firstStop?.address || "Shree Ganesh Medicals, 12th Main Rd, Indiranagar, Bengaluru";
  const originName = firstStop?.pharmacyName || "Pharmacy Pickup";
  const destinationAddress = patientAddress || "Customer Delivery Address";

  // Google Maps URLs
  const fullRouteUrl = getGoogleMapsDirectionsUrl({
    origin: deviceCoords ? `${deviceCoords.lat},${deviceCoords.lng}` : originAddress,
    destination: destinationAddress,
    waypoints: pickupStops.length > 1 ? pickupStops.slice(1).map((s) => s.address) : [],
    travelMode: "two_wheeler"
  });

  const pharmacyNavigationUrl = getGoogleMapsDirectionsUrl({
    origin: deviceCoords ? `${deviceCoords.lat},${deviceCoords.lng}` : undefined,
    destination: originAddress,
    travelMode: "two_wheeler"
  });

  const customerNavigationUrl = getGoogleMapsDirectionsUrl({
    origin: deviceCoords ? `${deviceCoords.lat},${deviceCoords.lng}` : originAddress,
    destination: destinationAddress,
    travelMode: "two_wheeler"
  });

  // Embed URL for interactive view
  const embedUrl =
    mapViewMode === "destination"
      ? getGoogleMapsEmbedUrl({ destination: destinationAddress })
      : mapViewMode === "origin"
      ? getGoogleMapsEmbedUrl({ destination: originAddress })
      : getGoogleMapsEmbedUrl({ origin: originAddress, destination: destinationAddress });

  const handleUseLiveGPS = () => {
    if (!navigator.geolocation) {
      toast.error("GPS Geolocation is not supported by your browser");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDeviceCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsGettingLocation(false);
        toast.success(
          `Live Rider GPS Acquired (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})! Google Maps navigation will start from your exact location.`
        );
      },
      (err) => {
        setIsGettingLocation(false);
        toast.info("Using standard pharmacy origin. GPS permission was not granted.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-0">
      {/* HUD Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold shadow-inner">
            <Compass className="w-5 h-5 text-emerald-400 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                Google Maps Navigation
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                🛵 Two-Wheeler Route
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>Order #{orderId}</span>
              <span>•</span>
              <span className="text-emerald-300 font-semibold">{pickupStops.length} Pickup Stop{pickupStops.length > 1 ? "s" : ""} → Customer Doorstep</span>
            </p>
          </div>
        </div>

        {/* Action Button: Launch Full Google Maps */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleUseLiveGPS}
            disabled={isGettingLocation}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 transition-colors flex items-center gap-1 cursor-pointer"
            title="Use device GPS as starting point"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isGettingLocation ? "Syncing GPS..." : deviceCoords ? "GPS Synced ✓" : "Sync My GPS"}</span>
          </button>

          <a
            href={fullRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#10B981] hover:bg-[#059669] text-slate-950 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-950 font-bold" />
            <span>Open in Google Maps App / Site</span>
          </a>
        </div>
      </div>

      {/* Origin vs Destination Route Summary Card */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Origin / Pharmacy Stops */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Origin · Pharmacy Pickup</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {firstStop?.isCollected ? "Collected ✓" : "Step 1"}
            </span>
          </div>

          <div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm">{originName}</div>
            <div className="text-slate-500 text-xs mt-0.5 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{originAddress}</span>
            </div>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <a
              href={pharmacyNavigationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300 transition-colors cursor-pointer"
            >
              <Navigation className="w-3 h-3 text-emerald-700" />
              <span>Directions to Pharmacy</span>
              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
            </a>

            <button
              type="button"
              onClick={() => handleCopy(originAddress, "Pharmacy address")}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
              title="Copy address"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Destination / Customer Doorstep */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-rose-600" />
              <span>Destination · Customer Doorstep</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
              Step 2 · Dropoff
            </span>
          </div>

          <div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm">
              {patientName} {patientPhone ? `(${patientPhone})` : ""}
            </div>
            <div className="text-slate-500 text-xs mt-0.5 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span>{destinationAddress}</span>
            </div>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <a
              href={customerNavigationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-300 transition-colors cursor-pointer"
            >
              <Navigation className="w-3 h-3 text-rose-700" />
              <span>Directions to Doorstep</span>
              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
            </a>

            <button
              type="button"
              onClick={() => handleCopy(destinationAddress, "Customer address")}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
              title="Copy address"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Google Map Canvas */}
      <div className="relative">
        {/* Map View Mode Switcher Pills */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-xl shadow-md border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setMapViewMode("route")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              mapViewMode === "route"
                ? "bg-[#065F46] text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            🗺️ Full Route
          </button>
          <button
            type="button"
            onClick={() => setMapViewMode("origin")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              mapViewMode === "origin"
                ? "bg-[#065F46] text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            🏪 Pharmacy
          </button>
          <button
            type="button"
            onClick={() => setMapViewMode("destination")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              mapViewMode === "destination"
                ? "bg-[#065F46] text-white shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            📍 Customer
          </button>
        </div>

        {/* Open Full Google Maps floating button */}
        <div className="absolute top-3 right-3 z-10">
          <a
            href={fullRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 font-bold text-xs shadow-md border border-slate-200 transition-all cursor-pointer"
            title="Open live Google Maps app or site"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Launch Google Maps App</span>
            <span className="sm:hidden">Open Maps</span>
          </a>
        </div>

        {/* Google Maps iFrame */}
        <div className="w-full h-64 sm:h-80 bg-slate-100 relative">
          <iframe
            title={`Google Map Directions for order ${orderId}`}
            src={embedUrl}
            width="100%"
            height="100%"
            className="border-0 w-full h-full"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Live Trip Status Strip */}
        <div className="p-3 bg-emerald-50/90 border-t border-emerald-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-emerald-950 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping shrink-0" />
            <span>
              <strong>Rider Navigation Active:</strong> Follow Google Maps turn-by-turn guidance from <strong>{originName}</strong> to <strong>{patientName}</strong>.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={getGoogleMapsSearchUrl(destinationAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-800 hover:text-emerald-950 underline font-bold text-[11px] flex items-center gap-1"
            >
              <span>Explore nearby landmarks</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
