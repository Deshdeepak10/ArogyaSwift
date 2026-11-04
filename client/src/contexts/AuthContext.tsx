import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithGoogleAccount,
  signOutGoogle,
  isGoogleAuthConfigured,
  type GoogleUserProfile
} from "@/lib/googleAuth";

export type UserRole = "customer" | "patient" | "pharmacy" | "rider" | "admin";
export type AuthModalTarget = "patient" | "pharmacy" | "delivery" | "admin" | null;
export type AuthModalMode = "login" | "register";

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
  vehicleNo?: string;
  department?: string;
  isGoogleUser?: boolean;
}

export const PRESET_USERS: Record<UserRole, UserSession> = {
  customer: {
    id: "u-cust-101",
    name: "Aarav Sharma",
    role: "customer",
    email: "aarav.sharma@example.in",
    phone: "9876543210",
    badge: "Verified Customer #AS-8821",
    avatar: "👤",
    location: "Indiranagar, Bengaluru"
  },
  patient: {
    id: "u-patient-101",
    name: "Asha Rao",
    role: "patient",
    email: "asha.rao@example.in",
    phone: "9845012345",
    badge: "Verified Patient #AS-8821",
    avatar: "👩‍💼",
    location: "124, 4th Cross, Defence Colony, Indiranagar, Bengaluru"
  },
  pharmacy: {
    id: "u-pharmacy-202",
    name: "Shree Ganesh Medicals",
    role: "pharmacy",
    email: "partner@arogyaswift.in",
    phone: "9876511223",
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
    phone: "9876599887",
    badge: "Verified Delivery Partner #AS-R4402",
    avatar: "🏍️",
    location: "Indiranagar Zone, Bengaluru",
    vehicleType: "Electric Scooter (Cold-Chain Ready)",
    vehicleNo: "KA-03-EV-4402"
  },
  admin: {
    id: "u-admin-404",
    name: "Control Center Admin",
    role: "admin",
    email: "admin@arogyaswift.in",
    phone: "9811122334",
    badge: "Platform SuperAdmin #AS-HQ",
    avatar: "🛡️",
    location: "ArogyaSwift HQ - Operations Center",
    department: "Platform Control Center"
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
  
  // Modals state
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isPharmacyRegisterModalOpen: boolean;
  setIsPharmacyRegisterModalOpen: (open: boolean) => void;
  isPhoneSignupModalOpen: boolean;
  setIsPhoneSignupModalOpen: (open: boolean) => void;
  phoneSignupRole: "patient" | "rider";
  setPhoneSignupRole: (role: "patient" | "rider") => void;

  // Dedicated Separate Role Auth Modal Controls
  activeRoleModal: AuthModalTarget;
  setActiveRoleModal: (target: AuthModalTarget) => void;
  roleModalMode: AuthModalMode;
  setRoleModalMode: (mode: AuthModalMode) => void;
  openRoleAuth: (role: "patient" | "pharmacy" | "delivery" | "rider" | "admin" | "customer", mode?: AuthModalMode) => void;
  closeRoleAuth: () => void;

  // Dedicated Role Auth Handlers
  loginPatient: (name: string, phone: string, address?: string, area?: string) => void;
  registerPatient: (data: { name: string; phone: string; address: string; area: string; email?: string }) => void;
  loginPharmacyUser: (shopName: string, licenseNo: string, email?: string) => void;
  registerPharmacyUser: (data: { ownerName: string; shopName: string; licenseNo: string; category: string; address: string; phone: string; email: string; coldChainReady: boolean; area?: string }) => void;
  loginRiderUser: (name: string, phone: string, vehicleType?: string) => void;
  registerRiderUser: (data: { name: string; phone: string; vehicleType: string; vehicleNo: string; drivingLicense?: string; zone: string }) => void;
  loginAdminUser: (name: string, email: string, pin: string, roleTitle?: string) => void;
  registerAdminStaff: (data: { name: string; email: string; department: string; pin: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = "arogya_active_role";
const GOOGLE_SESSION_KEY = "arogya_google_profile";
const USER_SESSION_KEY = "arogya_active_user_session_v2";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(PRESET_USERS.patient);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUserProfile | null>(null);
  const [isGoogleReady, setIsGoogleReady] = useState(isGoogleAuthConfigured());

  // Generic / legacy modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPharmacyRegisterModalOpen, setIsPharmacyRegisterModalOpen] = useState(false);
  const [isPhoneSignupModalOpen, setIsPhoneSignupModalOpen] = useState(false);
  const [phoneSignupRole, setPhoneSignupRole] = useState<"patient" | "rider">("patient");

  // Separate Role Auth Modals
  const [activeRoleModal, setActiveRoleModal] = useState<AuthModalTarget>(null);
  const [roleModalMode, setRoleModalMode] = useState<AuthModalMode>("login");

  const [registeredPharmacies, setRegisteredPharmacies] = useState<PharmacyStoreData[]>([
    {
      id: "p1",
      ownerName: "Pharm. Priya Nair",
      shopName: "Apollo Pharmacy - Express Hub (Indiranagar)",
      licenseNo: "KA-BLR-2021-00921",
      category: "Cold-Chain Certified Retail",
      address: "CMH Road, Indiranagar, Bengaluru",
      phone: "+91 98765 43210",
      email: "hub.indiranagar@apollopharmacy.in",
      distance: "0.8 km",
      rating: "4.9 ★",
      coldChainReady: true,
      stockMatched: 100,
      etaMinutes: 18
    },
    {
      id: "p2",
      ownerName: "Pharm. Suresh Kumar",
      shopName: "MedPlus Superstore (Indiranagar 100ft Rd)",
      licenseNo: "KA-BLR-2019-04120",
      category: "Retail Pharmacy Hub",
      address: "100ft Road, Indiranagar, Bengaluru",
      phone: "+91 98765 12345",
      email: "indiranagar@medplus.in",
      distance: "1.2 km",
      rating: "4.7 ★",
      coldChainReady: true,
      stockMatched: 100,
      etaMinutes: 22
    },
    {
      id: "p3",
      ownerName: "Pharm. Ramesh Patel",
      shopName: "Shree Ganesh Medicals",
      licenseNo: "KA-BLR-20B-1142",
      category: "Verified Local Chemist",
      address: "12th Main Rd, Indiranagar, Bengaluru",
      phone: "+91 98765 11223",
      email: "partner@arogyaswift.in",
      distance: "0.4 km",
      rating: "4.8 ★",
      coldChainReady: true,
      stockMatched: 100,
      etaMinutes: 15
    }
  ]);

  // Restore session from localStorage on startup
  useEffect(() => {
    setIsGoogleReady(isGoogleAuthConfigured());

    try {
      const storedGoogle = localStorage.getItem(GOOGLE_SESSION_KEY);
      const savedUser = localStorage.getItem(USER_SESSION_KEY);
      const savedRole = (localStorage.getItem(ROLE_STORAGE_KEY) as UserRole) || "patient";

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as UserSession;
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else if (storedGoogle) {
        const parsed = JSON.parse(storedGoogle) as GoogleUserProfile;
        setGoogleUser(parsed);
        const resolvedUser: UserSession = {
          id: parsed.uid,
          name: parsed.displayName,
          role: savedRole,
          email: parsed.email,
          badge: `Google Verified • ${savedRole.toUpperCase()}`,
          avatar: parsed.photoURL || (savedRole === "pharmacy" ? "🏥" : savedRole === "rider" ? "🏍️" : savedRole === "admin" ? "🛡️" : "👤"),
          location: "Indiranagar, Bengaluru",
          isGoogleUser: true
        };
        setUser(resolvedUser);
        setIsAuthenticated(true);
      } else if (localStorage.getItem("arogya_demo_session") && savedRole) {
        setUser(PRESET_USERS[savedRole] || PRESET_USERS.patient);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.warn("Could not restore session:", e);
    }
  }, []);

  const saveActiveSession = (session: UserSession) => {
    setUser(session);
    setIsAuthenticated(true);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(ROLE_STORAGE_KEY, session.role);
    closeRoleAuth();
    setIsAuthModalOpen(false);
  };

  const openRoleAuth = (role: "patient" | "pharmacy" | "delivery" | "rider" | "admin" | "customer", mode: AuthModalMode = "login") => {
    setRoleModalMode(mode);
    if (role === "patient" || role === "customer") {
      setActiveRoleModal("patient");
    } else if (role === "pharmacy") {
      setActiveRoleModal("pharmacy");
    } else if (role === "delivery" || role === "rider") {
      setActiveRoleModal("delivery");
    } else if (role === "admin") {
      setActiveRoleModal("admin");
    }
  };

  const closeRoleAuth = () => {
    setActiveRoleModal(null);
  };

  /**
   * 1. PATIENT AUTH METHODS
   */
  const loginPatient = (name: string, phone: string, address?: string, area?: string) => {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const newSession: UserSession = {
      id: `u-patient-${cleanPhone || Date.now()}`,
      name: name || "Asha Rao",
      role: "patient",
      email: `${cleanPhone}@patient.arogyaswift.in`,
      phone: cleanPhone,
      badge: `Verified Patient #${cleanPhone.slice(-4) || "8821"}`,
      avatar: "👩‍💼",
      location: address ? `${address}${area ? `, ${area}` : ""}` : "Defence Colony, Indiranagar, Bengaluru"
    };
    saveActiveSession(newSession);
  };

  const registerPatient = (data: { name: string; phone: string; address: string; area: string; email?: string }) => {
    const cleanPhone = data.phone.replace(/\D/g, "").slice(-10);
    const newSession: UserSession = {
      id: `u-patient-${cleanPhone || Date.now()}`,
      name: data.name,
      role: "patient",
      email: data.email || `${cleanPhone}@patient.arogyaswift.in`,
      phone: cleanPhone,
      badge: `Patient Member #${cleanPhone.slice(-4)}`,
      avatar: "👩‍💼",
      location: `${data.address}, ${data.area}`
    };
    saveActiveSession(newSession);
  };

  /**
   * 2. PHARMACY AUTH METHODS
   */
  const loginPharmacyUser = (shopName: string, licenseNo: string, email?: string) => {
    const newSession: UserSession = {
      id: `u-pharmacy-${Date.now()}`,
      name: shopName,
      role: "pharmacy",
      email: email || "chemist@arogyaswift.in",
      phone: "9876511223",
      badge: `Verified Pharmacy #${licenseNo || "KA-BLR-20B-1142"}`,
      avatar: "🏥",
      shopName: shopName,
      licenseNo: licenseNo,
      location: "Indiranagar, Bengaluru"
    };
    saveActiveSession(newSession);
  };

  const registerPharmacyUser = (data: {
    ownerName: string;
    shopName: string;
    licenseNo: string;
    category: string;
    address: string;
    phone: string;
    email: string;
    coldChainReady: boolean;
    area?: string;
  }) => {
    const newStore: PharmacyStoreData = {
      id: `p-${Date.now()}`,
      ownerName: data.ownerName,
      shopName: data.shopName,
      licenseNo: data.licenseNo,
      category: data.category,
      address: data.address,
      phone: data.phone,
      email: data.email,
      distance: "0.5 km",
      rating: "5.0 ★",
      coldChainReady: data.coldChainReady,
      stockMatched: 100,
      etaMinutes: 15
    };

    setRegisteredPharmacies((prev) => [newStore, ...prev]);

    const newSession: UserSession = {
      id: newStore.id,
      name: data.shopName,
      role: "pharmacy",
      email: data.email,
      phone: data.phone,
      badge: `CDSCO Verified #${data.licenseNo}`,
      avatar: "🏥",
      shopName: data.shopName,
      licenseNo: data.licenseNo,
      location: data.address
    };
    saveActiveSession(newSession);
  };

  /**
   * 3. DELIVERY RIDER AUTH METHODS
   */
  const loginRiderUser = (name: string, phone: string, vehicleType?: string) => {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const newSession: UserSession = {
      id: `u-rider-${cleanPhone || Date.now()}`,
      name: name || "Ravi Kumar",
      role: "rider",
      email: `${cleanPhone}@rider.arogyaswift.in`,
      phone: cleanPhone,
      badge: `Active Fleet Partner #AS-R${cleanPhone.slice(-4) || "4402"}`,
      avatar: "🏍️",
      location: "Indiranagar Zone, Bengaluru",
      vehicleType: vehicleType || "Electric Scooter (Cold-Chain Ready)"
    };
    saveActiveSession(newSession);
  };

  const registerRiderUser = (data: {
    name: string;
    phone: string;
    vehicleType: string;
    vehicleNo: string;
    drivingLicense?: string;
    zone: string;
  }) => {
    const cleanPhone = data.phone.replace(/\D/g, "").slice(-10);
    const newSession: UserSession = {
      id: `u-rider-${Date.now()}`,
      name: data.name,
      role: "rider",
      phone: cleanPhone,
      email: `${cleanPhone}@rider.arogyaswift.in`,
      badge: `Registered Rider #${cleanPhone.slice(-4)}`,
      avatar: "🏍️",
      vehicleType: data.vehicleType,
      vehicleNo: data.vehicleNo,
      location: `${data.zone}, Bengaluru`
    };
    saveActiveSession(newSession);
  };

  /**
   * 4. ADMIN AUTH METHODS
   */
  const loginAdminUser = (name: string, email: string, pin: string, roleTitle?: string) => {
    const newSession: UserSession = {
      id: `u-admin-${Date.now()}`,
      name: name || "Control Center Admin",
      role: "admin",
      email: email || "admin@arogyaswift.in",
      phone: "9811122334",
      badge: roleTitle ? `${roleTitle} #AS-HQ` : "Platform SuperAdmin #AS-HQ",
      avatar: "🛡️",
      location: "ArogyaSwift HQ - Operations Center",
      department: roleTitle || "Platform Operations"
    };
    saveActiveSession(newSession);
  };

  const registerAdminStaff = (data: { name: string; email: string; department: string; pin: string }) => {
    const newSession: UserSession = {
      id: `u-admin-${Date.now()}`,
      name: data.name,
      role: "admin",
      email: data.email,
      phone: "9811122334",
      badge: `${data.department} Officer #AS-HQ`,
      avatar: "🛡️",
      location: "ArogyaSwift HQ - Operations Center",
      department: data.department
    };
    saveActiveSession(newSession);
  };

  /**
   * Google Authentication
   */
  const loginWithGoogle = async (role: UserRole = "patient"): Promise<GoogleUserProfile> => {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    localStorage.removeItem("arogya_demo_session");

    const profile = await signInWithGoogleAccount(role);
    setGoogleUser(profile);
    localStorage.setItem(GOOGLE_SESSION_KEY, JSON.stringify(profile));

    const roleName = role === "pharmacy" ? "Pharmacy Partner" : role === "rider" ? "Delivery Partner" : role === "admin" ? "Admin" : "Patient";

    const session: UserSession = {
      id: profile.uid,
      name: profile.displayName || `${roleName} (Google)`,
      role,
      email: profile.email,
      badge: `Google Verified • ${role.toUpperCase()}`,
      avatar: profile.photoURL || (role === "pharmacy" ? "🏥" : role === "rider" ? "🏍️" : role === "admin" ? "🛡️" : "👤"),
      location: "Indiranagar, Bengaluru",
      isGoogleUser: true
    };

    saveActiveSession(session);
    return profile;
  };

  const applyGoogleProfile = (profile: GoogleUserProfile, role: UserRole = "patient") => {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    localStorage.removeItem("arogya_demo_session");
    setGoogleUser(profile);
    localStorage.setItem(GOOGLE_SESSION_KEY, JSON.stringify(profile));

    const roleName = role === "pharmacy" ? "Pharmacy Partner" : role === "rider" ? "Delivery Partner" : role === "admin" ? "Admin" : "Patient";

    const session: UserSession = {
      id: profile.uid,
      name: profile.displayName || `${roleName} (Google)`,
      role,
      email: profile.email,
      badge: `Google Verified • ${role.toUpperCase()}`,
      avatar: profile.photoURL || (role === "pharmacy" ? "🏥" : role === "rider" ? "🏍️" : role === "admin" ? "🛡️" : "👤"),
      location: "Indiranagar, Bengaluru",
      isGoogleUser: true
    };

    saveActiveSession(session);
  };

  const registerWithGoogle = async (role: UserRole = "patient"): Promise<GoogleUserProfile> => {
    return loginWithGoogle(role);
  };

  const loginAsRole = (role: UserRole) => {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    localStorage.setItem("arogya_demo_session", "true");
    localStorage.removeItem(GOOGLE_SESSION_KEY);
    setGoogleUser(null);
    saveActiveSession(PRESET_USERS[role]);
  };

  const loginWithCustom = (name: string, role: UserRole, email: string) => {
    const session: UserSession = {
      id: `u-${Date.now()}`,
      name,
      role,
      email,
      badge: `${role.toUpperCase()} #${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: (role === "customer" || role === "patient") ? "👤" : role === "pharmacy" ? "🏥" : role === "rider" ? "🏍️" : "🛡️"
    };
    saveActiveSession(session);
  };

  const registerPharmacyStore = (storeInput: Omit<PharmacyStoreData, "id" | "distance" | "rating" | "stockMatched" | "etaMinutes">) => {
    registerPharmacyUser({
      ...storeInput,
      coldChainReady: storeInput.coldChainReady
    });
    setIsPharmacyRegisterModalOpen(false);
  };

  const registerUserWithPhone = (data: { name: string; phone: string; role: "patient" | "rider"; email?: string; vehicleType?: string; location?: string }) => {
    if (data.role === "patient") {
      registerPatient({
        name: data.name,
        phone: data.phone,
        address: data.location || "Indiranagar, Bengaluru",
        area: "Indiranagar",
        email: data.email
      });
    } else {
      registerRiderUser({
        name: data.name,
        phone: data.phone,
        vehicleType: data.vehicleType || "Electric Scooter",
        vehicleNo: "KA-03-HA-8821",
        zone: data.location || "Indiranagar"
      });
    }
    setIsPhoneSignupModalOpen(false);
  };

  const logout = async () => {
    localStorage.removeItem("arogya_demo_session");
    localStorage.removeItem(GOOGLE_SESSION_KEY);
    localStorage.removeItem(USER_SESSION_KEY);
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
        setPhoneSignupRole,

        // Dedicated Role Auth Modals
        activeRoleModal,
        setActiveRoleModal,
        roleModalMode,
        setRoleModalMode,
        openRoleAuth,
        closeRoleAuth,

        // Handlers
        loginPatient,
        registerPatient,
        loginPharmacyUser,
        registerPharmacyUser,
        loginRiderUser,
        registerRiderUser,
        loginAdminUser,
        registerAdminStaff
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
