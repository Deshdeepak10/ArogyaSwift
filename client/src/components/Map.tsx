/**
 * MAPBOX GL INTEGRATION WITH REAL DEVICE GEOLOCATION & HYPERLOCAL ROUTING
 * Supports:
 * 1. Official Mapbox Vector / 3D Navigation Styles with VITE_MAPBOX_TOKEN or custom token
 * 2. High-performance fallback raster style (OpenStreetMap) with zero configuration required
 * 3. Animated delivery rider marker, pharmacy pickup hub, and doorstep customer pins
 * 4. Real-time Device GPS Geolocation
 */

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Navigation,
  Crosshair,
  Loader2,
  KeyRound,
  Compass,
  CheckCircle2,
  Sparkles,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  riderLocation?: { lat: number; lng: number };
  showRoute?: boolean;
  onMapReady?: (map: mapboxgl.Map) => void;
}

const STORAGE_KEY_MAPBOX_TOKEN = "arogya_mapbox_token";

export function getMapboxToken(): string | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MAPBOX_TOKEN);
    if (saved && saved.trim().startsWith("pk.")) {
      return saved.trim();
    }
  } catch (e) {
    // ignore
  }

  const envToken = import.meta.env.VITE_MAPBOX_TOKEN;
  if (envToken && typeof envToken === "string" && envToken.trim().startsWith("pk.")) {
    return envToken.trim();
  }

  return null;
}

export function saveMapboxToken(token: string): void {
  const clean = token.trim();
  if (!clean.startsWith("pk.")) {
    throw new Error("Invalid Mapbox token format. Public tokens start with 'pk.'");
  }
  localStorage.setItem(STORAGE_KEY_MAPBOX_TOKEN, clean);
}

// Free OpenStreetMap Style (Fallback when no Mapbox token is set - zero API key required)
const FREE_OSM_STYLE: mapboxgl.Style = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors"
    }
  },
  layers: [
    {
      id: "osm-tiles-layer",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

// Ghaziabad, Uttar Pradesh Default Coordinates (NCR Hub)
const DEFAULT_CENTER = { lat: 28.6692, lng: 77.4538 }; // Ghaziabad Center
const DEFAULT_PICKUP = { lat: 28.6720, lng: 77.4420 }; // Apollo Hub (Raj Nagar / Kavi Nagar, Ghaziabad)
const DEFAULT_DROP = { lat: 28.6610, lng: 77.4610 };   // Patient Home (Indirapuram, Ghaziabad)

export function MapView({
  className,
  initialCenter = DEFAULT_CENTER,
  initialZoom = 13,
  origin = DEFAULT_PICKUP,
  destination = DEFAULT_DROP,
  riderLocation = { lat: 28.6670, lng: 77.4500 },
  showRoute = true,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const riderMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const [hasToken, setHasToken] = useState<boolean>(Boolean(getMapboxToken()));
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);

  // Initialize Mapbox GL instance
  useEffect(() => {
    if (!mapContainer.current) return;

    const token = getMapboxToken();
    let styleToUse: string | mapboxgl.Style = FREE_OSM_STYLE;

    if (token) {
      mapboxgl.accessToken = token;
      styleToUse = "mapbox://styles/mapbox/streets-v12";
      setHasToken(true);
    } else {
      setHasToken(false);
    }

    try {
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: styleToUse,
        center: [initialCenter.lng, initialCenter.lat],
        zoom: initialZoom,
        attributionControl: false
      });

      // Add navigation controls (Zoom + Compass rotation)
      mapInstance.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");

      mapInstance.on("load", () => {
        // 1. Add Pharmacy Pickup Marker (Green)
        const pharmacyEl = document.createElement("div");
        pharmacyEl.className =
          "flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white shadow-xl border-2 border-white text-base cursor-pointer hover:scale-110 transition-transform";
        pharmacyEl.innerHTML = "🏥";
        new mapboxgl.Marker({ element: pharmacyEl })
          .setLngLat([origin.lng, origin.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              "<div class='p-1 text-xs font-bold text-slate-800'>🏥 Pharmacy Pickup Hub</div>"
            )
          )
          .addTo(mapInstance);

        // 2. Add Patient Destination Marker (Blue)
        const dropEl = document.createElement("div");
        dropEl.className =
          "flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white shadow-xl border-2 border-white text-base cursor-pointer hover:scale-110 transition-transform";
        dropEl.innerHTML = "🏠";
        new mapboxgl.Marker({ element: dropEl })
          .setLngLat([destination.lng, destination.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              "<div class='p-1 text-xs font-bold text-slate-800'>🏠 Patient Doorstep Destination</div>"
            )
          )
          .addTo(mapInstance);

        // 3. Add Live Delivery Rider Marker with Animated Pulse Ring
        const riderEl = document.createElement("div");
        riderEl.className = "relative flex items-center justify-center w-10 h-10 cursor-pointer";
        riderEl.innerHTML = `
          <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75"></span>
          <div class="relative w-8 h-8 rounded-full bg-slate-900 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-2xl text-sm z-10">
            🏍️
          </div>
        `;
        const marker = new mapboxgl.Marker({ element: riderEl })
          .setLngLat([riderLocation.lng, riderLocation.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              "<div class='p-1 text-xs font-bold text-slate-800'>🏍️ ArogyaSwift Cold-Chain Rider</div>"
            )
          )
          .addTo(mapInstance);
        riderMarkerRef.current = marker;

        // 4. Draw Route Line Layer
        if (showRoute) {
          mapInstance.addSource("delivery-route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [
                  [origin.lng, origin.lat],
                  [riderLocation.lng, riderLocation.lat],
                  [destination.lng, destination.lat]
                ]
              }
            }
          });

          mapInstance.addLayer({
            id: "delivery-route-line",
            type: "line",
            source: "delivery-route",
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            paint: {
              "line-color": "#10b981",
              "line-width": 5,
              "line-opacity": 0.85
            }
          });
        }

        if (onMapReady) {
          onMapReady(mapInstance);
        }
      });

      map.current = mapInstance;

      return () => {
        mapInstance.remove();
      };
    } catch (err) {
      console.warn("Error mounting Mapbox GL map:", err);
    }
  }, [initialCenter.lat, initialCenter.lng, initialZoom, origin.lat, origin.lng, destination.lat, destination.lng, showRoute]);

  // Update Rider Location Dynamically if coords change
  useEffect(() => {
    if (riderMarkerRef.current && riderLocation) {
      riderMarkerRef.current.setLngLat([riderLocation.lng, riderLocation.lat]);
    }
  }, [riderLocation.lat, riderLocation.lng]);

  // Request Real Device GPS Location
  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    toast.info("📡 Requesting device GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setIsLocating(false);
        setLocationName(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);

        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            essential: true
          });

          // Add Device GPS marker
          const deviceEl = document.createElement("div");
          deviceEl.className =
            "flex items-center justify-center w-7 h-7 rounded-full bg-red-600 text-white shadow-xl border-2 border-white text-xs font-bold";
          deviceEl.innerHTML = "📍";
          new mapboxgl.Marker({ element: deviceEl })
            .setLngLat([longitude, latitude])
            .addTo(map.current);
        }

        toast.success(`📍 Device GPS Location Acquired! (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      },
      (error) => {
        setIsLocating(false);
        console.warn("Geolocation error:", error);
        toast.error(`Unable to retrieve location: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      saveMapboxToken(tokenInput);
      setHasToken(true);
      setIsTokenModalOpen(false);
      toast.success("Mapbox token saved! Reloading high-definition vector map...");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Invalid Mapbox token");
    }
  };

  return (
    <div className={cn("w-full h-[380px] bg-slate-950 relative rounded-2xl overflow-hidden border border-slate-800", className)}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Top Map HUD Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-950/90 border border-slate-800 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
            <span>{locationName ? `📍 ${locationName}` : "Mapbox 3D Engine"}</span>
          </div>

          <button
            onClick={() => setIsTokenModalOpen(true)}
            className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-1 shadow-md transition-all cursor-pointer backdrop-blur-md ${
              hasToken
                ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/90"
                : "bg-amber-950/80 border-amber-500/40 text-amber-300 hover:bg-amber-900/90"
            }`}
            title="Configure Mapbox Token"
          >
            <KeyRound className="w-3 h-3" />
            <span>{hasToken ? "Mapbox Active" : "Add Mapbox Token"}</span>
          </button>
        </div>

        <Button
          size="sm"
          onClick={handleUseDeviceLocation}
          disabled={isLocating}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 rounded-xl shadow-lg backdrop-blur-md pointer-events-auto flex items-center gap-1.5 cursor-pointer"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Crosshair className="w-3.5 h-3.5 text-emerald-200" />
          )}
          {isLocating ? "Locating..." : "Device GPS"}
        </Button>
      </div>

      {/* Mapbox Token Configuration Dialog */}
      <Dialog open={isTokenModalOpen} onOpenChange={setIsTokenModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Mapbox Access Token</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Enter your public Mapbox access token (<code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800">pk.eyJ...</code>) to enable high-definition Mapbox 3D vector tiles, dark/light modes, and traffic.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveToken} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Public Token (pk.eyJ...)</label>
              <Input
                placeholder="pk.eyJ1IjoieW91cm5hbWUiLCJhIjoiY2...}"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="font-mono text-xs rounded-xl"
              />
              <p className="text-[11px] text-slate-500">
                Get a free token with 50,000 monthly map loads at{" "}
                <a
                  href="https://account.mapbox.com/access-tokens/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 underline font-semibold"
                >
                  mapbox.com
                </a>.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTokenModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Save & Apply
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
