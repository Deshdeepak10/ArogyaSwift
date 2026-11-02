import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const STORAGE_KEY_SUPABASE_URL = "arogya_supabase_url";
const STORAGE_KEY_SUPABASE_ANON_KEY = "arogya_supabase_anon_key";

/**
 * Retrieve Supabase configuration from environment or localStorage override
 */
export function getSupabaseConfig(): { url: string | null; anonKey: string | null } {
  try {
    const savedUrl = localStorage.getItem(STORAGE_KEY_SUPABASE_URL);
    const savedKey = localStorage.getItem(STORAGE_KEY_SUPABASE_ANON_KEY);
    if (savedUrl && savedKey) {
      return { url: savedUrl.trim(), anonKey: savedKey.trim() };
    }
  } catch (err) {
    console.warn("Could not read Supabase config from storage:", err);
  }

  const envUrl = import.meta.env.VITE_SUPABASE_URL || null;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || null;

  return { url: envUrl, anonKey: envKey };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_SUPABASE_ANON_KEY, anonKey.trim());
  window.location.reload();
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);
  localStorage.removeItem(STORAGE_KEY_SUPABASE_ANON_KEY);
  window.location.reload();
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(
    url &&
      anonKey &&
      !url.includes("YOUR_") &&
      !anonKey.includes("YOUR_") &&
      url.startsWith("https://")
  );
}

// Initialize Supabase Client
const { url, anonKey } = getSupabaseConfig();

export const supabase: SupabaseClient | null =
  url && anonKey && url.startsWith("https://")
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;
