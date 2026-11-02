/**
 * ArogyaSwift Google Authentication Service
 * Supports:
 * 1. Google Identity Services (GIS Official Rendered Button & OAuth 2.0 Token Client)
 * 2. Firebase Google Auth (signInWithPopup with GoogleAuthProvider)
 * 3. Graceful fallback & instant demo mode if origins are pending authorization in Google Console
 */

import { auth, googleProvider, signInWithPopup, signOut as fbSignOut } from "./firebase";

export interface GoogleUserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  idToken?: string;
  isDemo?: boolean;
}

const STORAGE_KEY_GOOGLE_CLIENT_ID = "arogya_google_client_id";

/**
 * Retrieve Google OAuth Client ID from localStorage or Vite environment variable
 */
export function getGoogleClientId(): string | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GOOGLE_CLIENT_ID);
    if (saved && saved.trim().length > 10) {
      return saved.trim();
    }
  } catch (err) {
    console.warn("Could not read Google Client ID from storage:", err);
  }

  const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (envId && typeof envId === "string" && envId.trim().length > 10) {
    return envId.trim();
  }

  return null;
}

export function saveGoogleClientId(clientId: string): void {
  const cleanId = clientId.trim();
  if (cleanId.length < 10) {
    throw new Error("Invalid Google Client ID format");
  }
  localStorage.setItem(STORAGE_KEY_GOOGLE_CLIENT_ID, cleanId);
}

export function clearGoogleClientId(): void {
  localStorage.removeItem(STORAGE_KEY_GOOGLE_CLIENT_ID);
}

export function isGoogleAuthConfigured(): boolean {
  if (auth) return true;
  const clientId = getGoogleClientId();
  return Boolean(clientId && !clientId.includes("YOUR_"));
}

/**
 * Helper to safely decode Google JWT without external dependencies
 */
export function parseGoogleJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * Ensure Google Identity Services SDK is loaded
 */
export function ensureGoogleGsiLoaded(): Promise<boolean> {
  const g = typeof window !== "undefined" ? (window as any).google : undefined;
  if (g?.accounts?.id || g?.accounts?.oauth2) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(false);
      return;
    }

    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      setTimeout(() => resolve(Boolean((window as any).google?.accounts)), 1200);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

// Preload GSI immediately upon module evaluation
if (typeof window !== "undefined") {
  ensureGoogleGsiLoaded();
}

/**
 * Render official Google Sign In button in a specified container
 */
export function renderOfficialGoogleButton(
  container: HTMLElement,
  onSuccess: (profile: GoogleUserProfile) => void,
  onError?: (err: Error) => void
): boolean {
  const clientId = getGoogleClientId();
  if (!clientId || typeof window === "undefined") return false;

  const g = (window as any).google;
  if (!g?.accounts?.id) return false;

  try {
    g.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        if (!response.credential) {
          onError?.(new Error("No credential received from Google"));
          return;
        }

        const payload = parseGoogleJwt(response.credential);
        if (!payload) {
          onError?.(new Error("Could not parse Google ID token"));
          return;
        }

        const profile: GoogleUserProfile = {
          uid: payload.sub || `google-${Date.now()}`,
          displayName: payload.name || payload.given_name || "Google User",
          email: payload.email || "user@gmail.com",
          photoURL: payload.picture,
          idToken: response.credential,
          isDemo: false
        };

        // Sync with backend asynchronously
        syncGoogleProfileWithBackend(response.credential, "patient");
        onSuccess(profile);
      }
    });

    container.innerHTML = "";
    g.accounts.id.renderButton(container, {
      type: "standard",
      shape: "pill",
      theme: "outline",
      text: "continue_with",
      size: "large",
      logo_alignment: "left",
      width: Math.min(320, window.innerWidth - 60)
    });

    return true;
  } catch (err: any) {
    console.warn("Could not render official Google button:", err);
    return false;
  }
}

/**
 * Helper to sync user profile with backend Supabase database
 */
export async function syncGoogleProfileWithBackend(
  idToken: string,
  role: string = "patient"
): Promise<void> {
  try {
    await fetch("/api/auth/google/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, role })
    });
  } catch (e) {
    console.warn("Could not sync Google user with backend:", e);
  }
}

/**
 * Trigger Google Sign In / Registration
 * 1. Uses Google Identity Services with Client ID (via popup OAuth token flow) with strict timeout & error handling
 * 2. Uses Firebase Google Auth if configured
 * 3. Falls back gracefully with instant demo mode if origins are pending in Google Console
 */
export async function signInWithGoogleAccount(roleName: string = "patient"): Promise<GoogleUserProfile> {
  const clientId = getGoogleClientId();

  // 1. If Google Client ID is configured, launch Google Identity Services OAuth popup
  if (clientId) {
    await ensureGoogleGsiLoaded();
    const g = typeof window !== "undefined" ? (window as any).google : undefined;

    if (g?.accounts?.oauth2) {
      try {
        const userProfile = await new Promise<GoogleUserProfile>((resolve, reject) => {
          let hasSettled = false;

          // 15-second watchdog timer to prevent getting stuck on "Connecting to Google..."
          const watchdogTimer = setTimeout(() => {
            if (!hasSettled) {
              hasSettled = true;
              reject(
                new Error(
                  "Google Sign-In popup took too long or was closed. Please check if your browser blocked popups for localhost."
                )
              );
            }
          }, 15000);

          try {
            const client = g.accounts.oauth2.initTokenClient({
              client_id: clientId,
              scope: "openid profile email",
              callback: async (tokenResponse: any) => {
                if (hasSettled) return;
                clearTimeout(watchdogTimer);
                hasSettled = true;

                if (tokenResponse.error) {
                  if (tokenResponse.error === "access_denied") {
                    reject(new Error("Google Sign-In was cancelled."));
                  } else {
                    reject(
                      new Error(`Google Sign-In error: ${tokenResponse.error_description || tokenResponse.error}`)
                    );
                  }
                  return;
                }

                try {
                  // Fetch verified profile info from Google userinfo API
                  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: {
                      Authorization: `Bearer ${tokenResponse.access_token}`
                    }
                  });

                  if (!res.ok) {
                    throw new Error(`Failed to fetch Google profile (status ${res.status})`);
                  }

                  const data = await res.json();
                  const profile: GoogleUserProfile = {
                    uid: data.sub || `g-${Date.now()}`,
                    displayName: data.name || data.given_name || "Google User",
                    email: data.email || "user@gmail.com",
                    photoURL: data.picture,
                    idToken: tokenResponse.access_token,
                    isDemo: false
                  };

                  // Sync to Supabase in backend
                  syncGoogleProfileWithBackend(tokenResponse.access_token, roleName);
                  resolve(profile);
                } catch (fetchErr) {
                  reject(fetchErr);
                }
              },
              error_callback: (err: any) => {
                if (hasSettled) return;
                clearTimeout(watchdogTimer);
                hasSettled = true;

                const msg =
                  err?.type === "popup_closed"
                    ? "Google popup was closed."
                    : err?.type === "popup_failed_to_open"
                    ? "Google popup was blocked by your browser. Please allow popups for localhost."
                    : `Google login: ${err?.type || "Connection interrupted"}`;
                reject(new Error(msg));
              }
            });

            // Request Google access token
            client.requestAccessToken({ prompt: "select_account" });
          } catch (initErr: any) {
            clearTimeout(watchdogTimer);
            hasSettled = true;
            reject(initErr);
          }
        });

        return userProfile;
      } catch (gisError: any) {
        console.warn("Google Identity Services popup error:", gisError);
        // Throw user-meaningful error so AuthModal can show toast & reset loading state
        throw gisError;
      }
    }
  }

  // 2. If Firebase Auth is configured, fallback to Firebase popup
  if (auth) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      return {
        uid: user.uid,
        displayName: user.displayName || user.email?.split("@")[0] || "Google User",
        email: user.email || "user@gmail.com",
        photoURL: user.photoURL || undefined,
        isDemo: false
      };
    } catch (error: any) {
      console.warn("Firebase Google popup error:", error);
      if (error?.code === "auth/popup-closed-by-user") {
        throw new Error("Google Sign-In was cancelled.");
      }
      throw error;
    }
  }

  // 3. Fallback demo profile if no keys configured
  const roleDisplay = roleName.charAt(0).toUpperCase() + roleName.slice(1);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  return {
    uid: `google-user-${randomSuffix}`,
    displayName: `${roleDisplay} Account (Google)`,
    email: `${roleName}.${randomSuffix}@gmail.com`,
    photoURL: "https://lh3.googleusercontent.com/a/default-user=s96-c",
    isDemo: true
  };
}

/**
 * Sign out of Google session
 */
export async function signOutGoogle(): Promise<void> {
  const g = typeof window !== "undefined" ? (window as any).google : undefined;
  if (g?.accounts?.id) {
    try {
      g.accounts.id.disableAutoSelect();
    } catch (e) {
      // ignore
    }
  }

  if (auth) {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.warn("Firebase sign out error:", err);
    }
  }
}
