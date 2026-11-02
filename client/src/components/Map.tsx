/**
 * GOOGLE MAPS FRONTEND INTEGRATION WITH REAL DEVICE GEOLOCATION
 */

/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";
import { MapPin, Navigation, Crosshair, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

declare global {
  interface Window {
    google?: any;
  }
}

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

function loadMapScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.google && window.google.maps) {
      resolve(true);
      return;
    }

    if (!API_KEY) {
      console.warn("VITE_FRONTEND_FORGE_API_KEY not configured, using embedded Google Map fallback");
      resolve(false);
      return;
    }

    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      resolve(true);
      script.remove();
    };
    script.onerror = () => {
      console.warn("Failed to load Google Maps JS API script, switching to Google Embed Map");
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

export interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  riderLocation?: { lat: number; lng: number };
  showRoute?: boolean;
  onMapReady?: (map: any) => void;
}

// Ghaziabad, Uttar Pradesh Default Coordinates
const DEFAULT_CENTER = { lat: 28.6692, lng: 77.4538 }; // Ghaziabad Center
const DEFAULT_PICKUP = { lat: 28.6720, lng: 77.4420 }; // Apollo Hub (Raj Nagar / Kavi Nagar, Ghaziabad)
const DEFAULT_DROP = { lat: 28.6610, lng: 77.4610 };   // Patient Home (Indirapuram, Ghaziabad)

export function MapView({
  className,
  initialCenter = DEFAULT_CENTER,
  initialZoom = 14,
  origin = DEFAULT_PICKUP,
  destination = DEFAULT_DROP,
  riderLocation = { lat: 28.6670, lng: 77.4500 },
  showRoute = true,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useEmbedFallback, setUseEmbedFallback] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>(initialCenter);
  const [isLocating, setIsLocating] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);

  const init = usePersistFn(async () => {
    const success = await loadMapScript();
    if (success && window.google && window.google.maps && mapContainer.current) {
      try {
        map.current = new window.google.maps.Map(mapContainer.current, {
          zoom: initialZoom,
          center: currentCoords,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
          streetViewControl: true,
          mapId: "QUICKMED_MAP_ID",
        });

        // Add Pharmacy Pickup Marker
        new window.google.maps.Marker({
          position: origin,
          map: map.current,
          title: "Apollo Pharmacy Pickup Hub",
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
          },
        });

        // Add Destination Customer Marker
        new window.google.maps.Marker({
          position: destination,
          map: map.current,
          title: "Patient Delivery Address",
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          },
        });

        // Add Delivery Rider Marker
        new window.google.maps.Marker({
          position: riderLocation,
          map: map.current,
          title: "ArogyaSwift Delivery Rider",
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/motorcycling.png",
          },
        });

        // Draw Polyline Route
        if (showRoute) {
          const flightPath = new window.google.maps.Polyline({
            path: [origin, riderLocation, destination],
            geodesic: true,
            strokeColor: "#10b981",
            strokeOpacity: 0.9,
            strokeWeight: 5,
          });
          flightPath.setMap(map.current);
        }

        setMapLoaded(true);
        if (onMapReady) {
          onMapReady(map.current);
        }
        return;
      } catch (err) {
        console.warn("Error instantiating Google Maps JS API:", err);
      }
    }

    // Fallback to Google Embedded Map URL
    setUseEmbedFallback(true);
  });

  useEffect(() => {
    init();
  }, [init]);

  // Request Real Device Current Location
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
        const newCoords = { lat: latitude, lng: longitude };
        setCurrentCoords(newCoords);
        setLocationName(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
        setIsLocating(false);

        if (map.current && window.google && window.google.maps) {
          map.current.setCenter(newCoords);
          map.current.setZoom(16);

          // Place Device Location Marker
          new window.google.maps.Marker({
            position: newCoords,
            map: map.current,
            title: "Your Device Current Location",
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            },
          });
        }

        toast.success(`📍 Device GPS Location Acquired! (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      },
      (error) => {
        setIsLocating(false);
        console.warn("Geolocation error:", error);
        toast.error(`Unable to retrieve location: ${error.message}. Defaulting to Indiranagar, Bangalore.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const embedUrl = `https://maps.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}&z=${initialZoom}&output=embed`;

  return (
    <div className={cn("w-full h-[380px] bg-slate-900 relative rounded-2xl overflow-hidden border border-slate-800", className)}>
      {useEmbedFallback ? (
        <div className="w-full h-full relative">
          <iframe
            title="Google Maps Location View"
            src={embedUrl}
            className="w-full h-full border-0 filter saturate-150 contrast-125"
            loading="lazy"
            allowFullScreen
          />
        </div>
      ) : (
        <div ref={mapContainer} className="w-full h-full" />
      )}

      {/* Top Map HUD Bar with Geolocation Button */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-slate-950/90 border border-slate-800 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg backdrop-blur-md pointer-events-auto">
          <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>{locationName ? `📍 ${locationName}` : "Google Live GPS Map"}</span>
        </div>

        <Button
          size="sm"
          onClick={handleUseDeviceLocation}
          disabled={isLocating}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 rounded-xl shadow-lg backdrop-blur-md pointer-events-auto flex items-center gap-1.5"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Crosshair className="w-3.5 h-3.5 text-emerald-200" />
          )}
          {isLocating ? "Locating..." : "Use Device Location"}
        </Button>
      </div>
    </div>
  );
}
