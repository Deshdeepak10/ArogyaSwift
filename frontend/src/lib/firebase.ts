import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
  type Auth
} from "firebase/auth";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

// Storage key for custom user-provided Firebase config via UI settings
const STORAGE_KEY_FIREBASE_CONFIG = "arogya_firebase_config";

/**
 * Retrieve active Firebase config from either:
 * 1. Vite Environment variables (import.meta.env.VITE_FIREBASE_*)
 * 2. LocalStorage override (configured directly from the UI)
 */
export function getFirebaseConfig(): FirebaseConfig | null {
  // Check localStorage first for user override
  try {
    const savedConfig = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      if (parsed.apiKey && parsed.projectId && parsed.authDomain) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to parse saved Firebase config from storage:", err);
  }

  // Check Vite env variables
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: envAuthDomain || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
    };
  }

  return null;
}

export function saveCustomFirebaseConfig(config: FirebaseConfig): void {
  localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
  // Force reload to reinitialize app cleanly
  window.location.reload();
}

export function clearCustomFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
  window.location.reload();
}

export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config && config.apiKey && config.projectId && !config.apiKey.includes("YOUR_"));
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

try {
  const config = getFirebaseConfig();
  if (config && config.apiKey && !config.apiKey.includes("YOUR_")) {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
    auth = getAuth(app);
  }
} catch (error) {
  console.warn("Firebase initialization warning (safe fallback enabled):", error);
}

export {
  app,
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
  type Auth
};
