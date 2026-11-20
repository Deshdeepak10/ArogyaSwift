import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { UserRole } from "./AuthContext";

export type NotificationType =
  | "order_status"
  | "quote_ready"
  | "rider_dispatch"
  | "pickup_ready"
  | "delivery_complete"
  | "system_alert";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  role: "patient" | "pharmacy" | "rider" | "admin" | "all";
  type: NotificationType;
  orderId?: string;
  timestamp: string;
  createdAt: number;
  read: boolean;
  priority?: "normal" | "high" | "urgent";
  actionUrl?: string;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  toastsEnabled: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  settings: NotificationSettings;
  setSoundEnabled: (enabled: boolean) => void;
  setToastsEnabled: (enabled: boolean) => void;
  getRoleNotifications: (role: UserRole | string) => AppNotification[];
  getRoleUnreadCount: (role: UserRole | string) => number;
  addNotification: (
    notif: Omit<AppNotification, "id" | "createdAt" | "read" | "timestamp"> & {
      timestamp?: string;
    }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (role?: UserRole | string) => void;
  clearNotifications: (role?: UserRole | string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = "arogyaswift_notifications_v3";
const SETTINGS_KEY = "arogyaswift_notif_settings_v1";

// Zero fake notifications: start with a clean real state
const INITIAL_NOTIFICATIONS: AppNotification[] = [];

// Gentle Web Audio API dual-tone chime
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: 880.00 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.08, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch (err) {
    // Autoplay restrictions or unavailable audio device
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Purge legacy fake seed data from localStorage on first run
  useEffect(() => {
    try {
      localStorage.removeItem("arogyaswift_notifications_v1");
      localStorage.removeItem("arogyaswift_notifications_v2");
    } catch {
      // ignore
    }
  }, []);

  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return { soundEnabled: true, toastsEnabled: true };
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Inter-tab sync listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, soundEnabled: enabled }));
  }, []);

  const setToastsEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, toastsEnabled: enabled }));
  }, []);

  const addNotification = useCallback(
    (
      notif: Omit<AppNotification, "id" | "createdAt" | "read" | "timestamp"> & {
        timestamp?: string;
      }
    ) => {
      const newNotification: AppNotification = {
        ...notif,
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: Date.now(),
        timestamp: notif.timestamp || "Just now",
        read: false
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Sound feedback if enabled
      if (settings.soundEnabled) {
        playNotificationChime();
      }

      // Toast feedback if enabled
      if (settings.toastsEnabled) {
        toast(notif.title, {
          description: notif.message,
          duration: 4000
        });
      }
    },
    [settings]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }, []);

  const markAllAsRead = useCallback((role?: UserRole | string) => {
    setNotifications((prev) =>
      prev.map((item) => {
        if (!role || role === "all" || item.role === role || item.role === "all") {
          return { ...item, read: true };
        }
        return item;
      })
    );
  }, []);

  const clearNotifications = useCallback((role?: UserRole | string) => {
    setNotifications((prev) => {
      if (!role || role === "all") {
        return [];
      }
      return prev.filter((item) => item.role !== role && item.role !== "all");
    });
  }, []);

  const getRoleNotifications = useCallback(
    (role: UserRole | string) => {
      const normalizedRole = role === "customer" ? "patient" : role;
      return notifications.filter(
        (n) => n.role === normalizedRole || n.role === "all"
      );
    },
    [notifications]
  );

  const getRoleUnreadCount = useCallback(
    (role: UserRole | string) => {
      const normalizedRole = role === "customer" ? "patient" : role;
      return notifications.filter(
        (n) => (n.role === normalizedRole || n.role === "all") && !n.read
      ).length;
    },
    [notifications]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        settings,
        setSoundEnabled,
        setToastsEnabled,
        getRoleNotifications,
        getRoleUnreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
