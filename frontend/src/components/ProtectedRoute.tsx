import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProtectedRouteProps {
  component: React.ComponentType;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ component: Component, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Allow guest access if role allows patient/customer
  const isPatientPortal = allowedRoles?.includes("patient") || allowedRoles?.includes("customer");
  const isAuthorized =
    (isPatientPortal && !user) ||
    (isPatientPortal && (user?.role === "patient" || user?.role === "customer" || user?.id === "guest")) ||
    (isAuthenticated && user && (user.role === "admin" || (allowedRoles && allowedRoles.includes(user.role))));

  useEffect(() => {
    if (!isAuthorized) {
      if (!isAuthenticated) {
        toast.error("🔒 Restricted Access: Please sign in or select your role to proceed.");
        setLocation("/login");
      } else {
        toast.error(`🔒 Access Denied: Your role (${user?.role}) does not have permission for this portal.`);
        if (user?.role === "pharmacy") setLocation("/pharmacy");
        else if (user?.role === "rider") setLocation("/delivery");
        else if (user?.role === "admin") setLocation("/admin");
        else setLocation("/patient");
      }
    }
  }, [isAuthenticated, isAuthorized, user?.role, setLocation]);

  if (!isAuthorized) {
    return null;
  }

  return <Component />;
}
