/**
 * ArogyaSwift Privacy-Preserving Analytics Module
 * Respects user Cookie Consent settings stored in localStorage
 */

declare global {
  interface Window {
    __arogyaswift_analytics_initialized?: boolean;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function isAnalyticsAllowed(): boolean {
  try {
    const consent = localStorage.getItem("arogyaswift_cookie_consent");
    return consent === "all";
  } catch {
    return false;
  }
}

/**
 * Initialize analytics beacons (e.g. Google Analytics 4, Cloudflare Web Analytics, Plausible)
 * Only runs if user explicitly granted consent.
 */
export function initAnalytics(measurementId?: string): void {
  if (typeof window === "undefined") return;
  if (!isAnalyticsAllowed()) {
    console.info("[ArogyaSwift Analytics] Suppressed (Cookie consent restricted to essential)");
    return;
  }

  if (window.__arogyaswift_analytics_initialized) {
    return;
  }

  const gaId = measurementId || import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (gaId && gaId.startsWith("G-")) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId, {
      anonymize_ip: true,
      cookie_flags: "SameSite=None;Secure",
    });
  }

  window.__arogyaswift_analytics_initialized = true;
  console.info("[ArogyaSwift Analytics] Initialized in privacy-preserving mode.");
}

/**
 * Safely track user journey milestones (order placed, quote requested, role switched)
 */
export function trackEvent(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  if (!isAnalyticsAllowed()) return;

  if (window.gtag) {
    window.gtag("event", eventName, {
      ...params,
      platform: "ArogyaSwift Hyperlocal",
      timestamp: new Date().toISOString(),
    });
  }

  if (import.meta.env.DEV) {
    console.log(`[Analytics Event] ${eventName}:`, params);
  }
}

// Listen for live consent updates
if (typeof window !== "undefined") {
  window.addEventListener("arogyaswift_consent_update", (e: any) => {
    if (e.detail?.level === "all") {
      initAnalytics();
    }
  });
}

