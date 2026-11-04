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

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
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

const STORAGE_KEY = "arogyaswift_notifications_v1";

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-seed-1",
    title: "Price Quotation Ready",
    message: "Chemist at Shree Ganesh Medicals quoted ₹187 for order #AS-1043. Please confirm to proceed.",
    role: "patient",
    type: "quote_ready",
    orderId: "AS-1043",
    timestamp: "5 mins ago",
    createdAt: Date.now() - 5 * 60 * 1000,
    read: false,
    priority: "high",
    actionUrl: "/patient"
  },
  {
    id: "notif-seed-2",
    title: "Rider En Route to Store",
    message: "Ravi Kumar (Ekart Shared Partner) is picking up parcel 2 of 2 for order #AS-1044.",
    role: "patient",
    type: "rider_dispatch",
    orderId: "AS-1044",
    timestamp: "12 mins ago",
    createdAt: Date.now() - 12 * 60 * 1000,
    read: true,
    actionUrl: "/patient"
  },
  {
    id: "notif-seed-3",
    title: "New Prescription Request",
    message: "Patient Vikram Mehta submitted 1 medicine for verification (#AS-1041, HAL 2nd Stage).",
    role: "pharmacy",
    type: "order_status",
    orderId: "AS-1041",
    timestamp: "8 mins ago",
    createdAt: Date.now() - 8 * 60 * 1000,
    read: false,
    priority: "urgent",
    actionUrl: "/pharmacy"
  },
  {
    id: "notif-seed-4",
    title: "Pickup OTP Handover Needed",
    message: "Rider Ravi Kumar arrived for parcel handover #AS-1044. Verify pickup OTP 5823.",
    role: "pharmacy",
    type: "pickup_ready",
    orderId: "AS-1044",
    timestamp: "18 mins ago",
    createdAt: Date.now() - 18 * 60 * 1000,
    read: true,
    actionUrl: "/pharmacy"
  },
  {
    id: "notif-seed-5",
    title: "New Multi-Stop Run Available",
    message: "Order #AS-1044 ready for pickup across 2 pharmacies in Indiranagar. Payout ₹45.",
    role: "rider",
    type: "rider_dispatch",
    orderId: "AS-1044",
    timestamp: "14 mins ago",
    createdAt: Date.now() - 14 * 60 * 1000,
    read: false,
    priority: "high",
    actionUrl: "/delivery"
  },
  {
    id: "notif-seed-6",
    title: "Delivery Payout Settled",
    message: "Order #AS-1042 completed to Defence Colony. Verified with customer OTP 9102. +₹40 added.",
    role: "rider",
    type: "delivery_complete",
    orderId: "AS-1042",
    timestamp: "45 mins ago",
    createdAt: Date.now() - 45 * 60 * 1000,
    read: true,
    actionUrl: "/delivery"
  },
  {
    id: "notif-seed-7",
    title: "Platform Cold-Chain Alert",
    message: "Indiranagar Zone: 4 active temperature-controlled vaccine batches in transit. All sensor readings normal (3.8°C).",
    role: "admin",
    type: "system_alert",
    timestamp: "20 mins ago",
    createdAt: Date.now() - 20 * 60 * 1000,
    read: false,
    priority: "normal",
    actionUrl: "/admin"
  },
  {
    id: "notif-seed-8",
    title: "Chemist Verification Audited",
    message: "Drug License #KA-BLR-20B-1142 for Shree Ganesh Medicals CDSCO status verified.",
    role: "admin",
    type: "system_alert",
    timestamp: "1 hour ago",
    createdAt: Date.now() - 60 * 60 * 1000,
    read: true,
    actionUrl: "/admin"
  }
];

// Play gentle Web Audio API dual-tone chime
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
    // Audio context may be restricted by autoplay policy before user gesture
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

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

      // Sound and toast feedback
      playNotificationChime();
      toast(notif.title, {
        description: notif.message,
        duration: 4000
      });
    },
    []
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

