/**
 * Google Maps integration utilities for ArogyaSwift delivery partners
 * Generates universal Google Maps URLs that automatically open:
 * - Native Google Maps App on mobile devices (Android / iOS)
 * - Google Maps web portal with turn-by-turn navigation on desktop
 */

export interface GoogleMapsDirectionsParams {
  origin?: string;
  destination: string;
  waypoints?: string[];
  travelMode?: "two_wheeler" | "driving" | "bicycling" | "walking";
}

/**
 * Normalizes address with city / region if missing to ensure accurate Google Maps pins
 */
export function formatAddressForMaps(address: string, area?: string): string {
  if (!address || !address.trim()) {
    return "Indiranagar, Bengaluru, Karnataka, India";
  }
  const clean = address.trim();
  const hasRegion = /bengaluru|bangalore|delhi|mumbai|hyderabad|chennai|pune|kolkata|noida|gurgaon|ghaziabad|karnataka/i.test(
    clean
  );

  if (!hasRegion) {
    const areaSuffix = area && !clean.toLowerCase().includes(area.toLowerCase()) ? `, ${area}` : "";
    return `${clean}${areaSuffix}, Bengaluru, Karnataka, India`;
  }
  return clean;
}

/**
 * Generates universal Google Maps turn-by-turn navigation URL.
 * Works seamlessly on mobile (opens Google Maps app) and desktop (opens google.com/maps).
 */
export function getGoogleMapsDirectionsUrl({
  origin,
  destination,
  waypoints = [],
  travelMode = "two_wheeler"
}: GoogleMapsDirectionsParams): string {
  const formattedDest = formatAddressForMaps(destination);
  const params = new URLSearchParams();
  params.set("api", "1");
  params.set("destination", formattedDest);
  params.set("travelmode", travelMode);

  if (origin && origin.trim()) {
    params.set("origin", formatAddressForMaps(origin));
  }

  if (waypoints.length > 0) {
    const formattedWaypoints = waypoints.map((w) => formatAddressForMaps(w)).join("|");
    params.set("waypoints", formattedWaypoints);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Generates Google Maps search / pin preview URL
 */
export function getGoogleMapsSearchUrl(address: string): string {
  const formatted = formatAddressForMaps(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatted)}`;
}

/**
 * Generates zero-config Google Maps iframe embed URL for inline route preview
 */
export function getGoogleMapsEmbedUrl({
  origin,
  destination
}: {
  origin?: string;
  destination: string;
}): string {
  const formattedDest = formatAddressForMaps(destination);

  if (origin && origin.trim()) {
    const formattedOrigin = formatAddressForMaps(origin);
    return `https://maps.google.com/maps?saddr=${encodeURIComponent(
      formattedOrigin
    )}&daddr=${encodeURIComponent(formattedDest)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(
    formattedDest
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

/**
 * Helper to launch Google Maps in a new tab or trigger the native Maps app
 */
export function openGoogleMapsNavigation(params: GoogleMapsDirectionsParams): void {
  const url = getGoogleMapsDirectionsUrl(params);
  window.open(url, "_blank", "noopener,noreferrer");
}
