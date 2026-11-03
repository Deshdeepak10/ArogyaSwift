import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithGoogleAccount,
  signOutGoogle,
  isGoogleAuthConfigured,
  type GoogleUserProfile
} from "@/lib/googleAuth";

export type UserRole = "customer" | "patient" | "pharmacy" | "rider" | "admin";

export interface PharmacyStoreData {
  id: string;
  ownerName: string;
  shopName: string;
  licenseNo: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  distance: string;
  rating: string;
  coldChainReady: boolean;
  stockMatched: number;
  etaMinutes: number;
}

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  badge: string;
  avatar: string;
  location?: string;
  licenseNo?: string;
  shopName?: string;
  vehicleType?: string;
  isGoogleUser?: boolean;
}

export const PRESET_USERS: Record<UserRole, UserSession> = {
  customer: {
    id: "u-cust-101",
    name: "Aarav Sharma",
    role: "customer",
    email: "aarav.sharma@example.in",
    phone: "+91 98765 43210",
    badge: "Verified Customer #AS-8821",
    avatar: "👤",
    location: "Indiranagar, Bengaluru"
  },
  patient: {
    id: "u-patient-101",
    name: "Asha Rao",
    role: "patient",
    email: "asha.rao@example.in",
    phone: "98450 12345",
    badge: "Verified Patient #AS-8821",
    avatar: "👩‍💼",
    location: "Defence Colony, Indiranagar, Bengaluru"
  },
  pharmacy: {
    id: "u-pharmacy-202",
    name: "Shree Ganesh Medicals",
    role: "pharmacy",
    email: "partner@arogyaswift.in",
    phone: "+91 98765 11223",
    badge: "Verified Pharmacy #KA-BLR-20B-1142",
    avatar: "🏥",
    licenseNo: "KA-BLR-20B-1142",
    shopName: "Shree Ganesh Medicals (Indiranagar)",
    location: "12th Main Rd, Indiranagar, Bengaluru"
  },
  rider: {
    id: "u-rider-303",
    name: "Ravi Kumar",
    role: "rider",
    email: "rider@arogyaswift.in",
    phone: "+91 98765 99887",
    badge: "Verified Delivery Partner #AS-R4402",
    avatar: "🏍️",
    location: "Indiranagar Zone, Bengaluru",
    vehicleType: "Electric Scooter (Cold-Chain Ready)"
  },
  admin: {
    id: "u-admin-404",
    name: "Control Center Admin",
    role: "admin",
    email: "admin@arogyaswift.in",
    phone: "+91 98111 22334",
    badge: "Platform SuperAdmin #AS-HQ",
    avatar: "🛡️",
    location: "ArogyaSwift HQ - Operations Center"
  }
};

interface AuthContextType {
  user: UserSession;
  isAuthenticated: boolean;
  googleUser: GoogleUserProfile | null;
  isGoogleReady: boolean;
  loginWithGoogle: (role?: UserRole) => Promise<GoogleUserProfile>;
  registerWithGoogle: (role?: UserRole) => Promise<GoogleUserProfile>;
  applyGoogleProfile: (profile: GoogleUserProfile, role?: UserRole) => void;
  loginAsRole: (role: UserRole) => void;
  loginWithCustom: (name: string, role: UserRole, email: string) => void;
  registerPharmacyStore: (store: Omit<PharmacyStoreData, "id" | "distance" | "rating" | "stockMatched" | "etaMinutes">) => void;
  registerUserWithPhone: (data: { name: string; phone: string; role: "patient" | "rider"; email?: string; vehicleType?: string; location?: string }) => void;
  registeredPharmacies: PharmacyStoreData[];
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isPharmacyRegisterModalOpen: boolean;
  setIsPharmacyRegisterModalOpen: (open: boolean) => void;
  isPhoneSignupModalOpen: boolean;
  setIsPhoneSignupModalOpen: (open: boolean) => void;
  phoneSignupRole: "patient" | "rider";
  setPhoneSignupRole: (role: "patient" | "rider") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = "arogya_active_role";
const GOOGLE_SESSION_KEY = "arogya_google_profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(PRESET_USERS.patient);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUserProfile | null>(null);
  const [isGoogleReady, setIsGoogleReady] = useState(isGoogleAuthConfigured());

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPharmacyRegisterModalOpen, setIsPharmacyRegisterModalOpen] = useState(false);
  const [isPhoneSignupModalOpen, setIsPhoneSignupModalOpen] = useState(false);
  const [phoneSignupRole, setPhoneSignupRole] = useState<"patient" | "rider">("patient");

  const [registeredPharmacies, setRegisteredPharmacies] = useState<PharmacyStoreData[]>([
    {
      id: "p1",
      ownerName: "Pharm. Priya Nair",
      shopName: "Apollo Pharmacy - Express Hub (Raj Nagar, Ghaziabad)",
      licenseNo: "UP-2021-00921",
      category: "Cold-Chain Certified Retail",
      address: "Kavi Nagar Main Rd, Ghaziabad",
      phone: "+91 98765 43210",
      email: "hub.ghaziabad@apollopharmacy.in",
      distance: "0.8 km",
      rating: "4.9 ★",
      coldChainReady: true,
      stockMatched: 100,
      etaMinutes: 18
    },
    {
      id: "p2",
      ownerName: "Pharm. Suresh Kumar",
      shopName: "MedPlus Superstore (Indirapuram, Ghaziabad)",
      licenseNo: "UP-2019-04120",
      category: "Retail Pharmacy Hub",
      address: "Shipra Sun City, Indirapuram, Ghaziabad",
      phone: "+91 98765 12345",
      email: "indirapuram@medplus.in",
      distance: "1.6 km",
      rating: "4.7 ★",
      coldChainReady: true,
      stockMatched: 100,
      etaMinutes: 25
    }
  ]);

  // Restore session from localStorage on startup
  useEffect(() => {
    setIsGoogleReady(isGoogleAuthConfigured());

    try {
      const storedGoogle = localStorage.getItem(GOOGLE_SESSION_KEY);
      const savedRole = (localStorage.getItem(ROLE_STORAGE_KEY) as UserRole) || "patient";

      if (storedGoogle) {
        const parsed = JSON.parse(storedGoogle) as GoogleUserProfile;
        setGoogleUser(parsed);
        setUser({
          id: parsed.uid,
          name: parsed.displayName,
          role: savedRole,
          email: parsed.email,
          badge: `Google Verified • ${savedRole.toUpperCase()}`,
          avatar: parsed.photoURL || (savedRole === "pharmacy" ? "🏥" : savedRole === "rider" ? "🏍️" : savedRole === "admin" ? "🛡️" : "👤"),
          location: "Indiranagar, Bengaluru",
          isGoogleUser: true
        });
        setIsAuthenticated(true);
      } else if (localStorage.getItem("arogya_demo_session") && savedRole) {
        setUser(PRESET_USERS[savedRole] || PRESET_USERS.patient);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.warn("Could not restore session:", e);
    }
  }, []);

  /**
   * Login with Google Authentication
   */
  const loginWithGoogle = async (role: UserRole = "patient"): Promise<GoogleUserProfile> => {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    localStorage.removeItem("arogya_demo_session");

    const profile = await signInWithGoogleAccount(role);
    setGoogleUser(profile);
    localStorage.setItem(GOOGLE_SESSION_KEY, JSON.stringify(profile));

    const roleName = role === "pharmacy" ? "Pharmacy Partner" : role === "rider" ? "Delivery Partner" : role === "admin" ? "Admin" : "Patient";

    setUser({
      id: profile.uid,
      name: profile.displayName || `${roleName} (Google)`,
      role,
      email: profile.email,
      badge: `Google Verified • ${role.toUpperCase()}`,
      avatar: profile.photoURL || (role === "pharmacy" ? "🏥" : role === "rider" ? "🏍️" : role === "admin" ? "🛡️" : "👤"),
      location: "Indiranagar, Bengaluru",
      isGoogleUser: true
    });

    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    return profile;
  };

  /**
   * Apply an authenticated Google Profile directly (e.g. from official Google rendered button)
   */
  const applyGoogleProfile = (profile: GoogleUserProfile, role: UserRole = "patient") => {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    localStorage.removeItem("arogya_demo_session");
    setGoogleUser(profile);
    localStorage.setItem(GOOGLE_SESSION_KEY, JSON.stringify(profile));

    const roleName = role === "pharmacy" ? "Pharmacy Partner" : role === "rider" ? "Delivery Partner" : role === "admin" ? "Admin" : "Patient";

    setUser({
      id: profile.uid,
      name: profile.displayName || `${roleName} (Google)`,
      role,
      email: profile.email,
      badge: `Google Verified • ${role.toUpperCase()}`,
      avatar: profile.photoURL || (role === "pharmacy" ? "🏥" : role === "rider" ? "🏍️" : role === "admin" ? "🛡️" : "👤"),
      location: "Indiranagar, Bengaluru",
      isGoogleUser: true
    });

    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  /**
   * Register with Google Authentication (Unified with Google sign-in)
   */
  const registerWithGoogle = async (role: UserRole = "patient"): Promise<GoogleUserProfile> => {
    return loginWithGoogle(role);
  };

  const loginAsRole = (role: UserRole) => {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    localStorage.setItem("arogya_demo_session", "true");
    localStorage.removeItem(GOOGLE_SESSION_KEY);
    setGoogleUser(null);
    setUser(PRESET_USERS[role]);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  const loginWithCustom = (name: string, role: UserRole, email: string) => {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    localStorage.setItem("arogya_demo_session", "true");
    localStorage.removeItem(GOOGLE_SESSION_KEY);
    setGoogleUser(null);
    setUser({
      id: `u-${Date.now()}`,
      name,
      role,
      email,
      badge: `${role.toUpperCase()} #${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: (role === "customer" || role === "patient") ? "👤" : role === "pharmacy" ? "🏥" : role === "rider" ? "🏍️" : "🛡️"
    });
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  const registerPharmacyStore = (storeInput: Omit<PharmacyStoreData, "id" | "distance" | "rating" | "stockMatched" | "etaMinutes">) => {
    const newStore: PharmacyStoreData = {
      ...storeInput,
      id: `p-${Date.now()}`,
      distance: "0.5 km",
      rating: "5.0 ★",
      stockMatched: 100,
      etaMinutes: 15
    };

    setRegisteredPharmacies((prev) => [newStore, ...prev]);

    setUser({
      id: newStore.id,
      name: newStore.shopName,
      role: "pharmacy",
      email: newStore.email,
      phone: newStore.phone,
      badge: `DL #${newStore.licenseNo}`,
      avatar: "🏥",
      shopName: newStore.shopName,
      licenseNo: newStore.licenseNo,
      location: newStore.address
    });

    setIsAuthenticated(true);
    setIsPharmacyRegisterModalOpen(false);
  };

  const registerUserWithPhone = (data: { name: string; phone: string; role: "patient" | "rider"; email?: string; vehicleType?: string; location?: string }) => {
    const formattedPhone = data.phone.startsWith("+91") ? data.phone : `+91 ${data.phone}`;

    setUser({
      id: `u-${Date.now()}`,
      name: data.name,
      role: data.role,
      phone: formattedPhone,
      email: data.email || `${data.phone}@arogyaswift.in`,
      badge: data.role === "patient" ? `Patient #${Math.floor(1000 + Math.random() * 9000)}` : `Rider #${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: data.role === "patient" ? "👩‍💼" : "🏍️",
      vehicleType: data.vehicleType,
      location: data.location || "Indiranagar, Bangalore"
    });

    setIsAuthenticated(true);
    setIsPhoneSignupModalOpen(false);
  };

  const logout = async () => {
    localStorage.removeItem("arogya_demo_session");
    localStorage.removeItem(GOOGLE_SESSION_KEY);
    try {
      await signOutGoogle();
    } catch (err) {
      console.warn("Google sign out error:", err);
    }
    setGoogleUser(null);
    setIsAuthenticated(false);
    setUser(PRESET_USERS.patient);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        googleUser,
        isGoogleReady,
        loginWithGoogle,
        registerWithGoogle,
        applyGoogleProfile,
        loginAsRole,
        loginWithCustom,
        registerPharmacyStore,
        registerUserWithPhone,
        registeredPharmacies,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isPharmacyRegisterModalOpen,
        setIsPharmacyRegisterModalOpen,
        isPhoneSignupModalOpen,
        setIsPhoneSignupModalOpen,
        phoneSignupRole,
        setPhoneSignupRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
