import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { OrderProvider } from "./contexts/OrderContext";

// Auth Modals
import { AuthModal } from "./components/AuthModal";
import { PharmacyRegisterModal } from "./components/PharmacyRegisterModal";
import { PhoneSignupModal } from "./components/PhoneSignupModal";
import { PatientAuthModal } from "./components/auth/PatientAuthModal";
import { PharmacyAuthModal } from "./components/auth/PharmacyAuthModal";
import { DeliveryAuthModal } from "./components/auth/DeliveryAuthModal";
import { AdminAuthModal } from "./components/auth/AdminAuthModal";

import { CookieConsentBanner } from "./components/CookieConsentBanner";
import CustomerPortal from "./pages/CustomerPortal";
import PharmacyPortal from "./pages/PharmacyPortal";
import DeliveryPortal from "./pages/DeliveryPortal";
import AdminPortal from "./pages/AdminPortal";
import MedicineMVP from "./pages/MedicineMVP";
import LoginHome from "./pages/LoginHome";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginHome} />
      <Route path="/login" component={LoginHome} />
      <Route path="/patient" component={CustomerPortal} />
      <Route path="/customer" component={CustomerPortal} />
      <Route path="/pharmacy" component={PharmacyPortal} />
      <Route path="/delivery" component={DeliveryPortal} />
      <Route path="/admin" component={AdminPortal} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsConditions} />
      <Route path="/app" component={MedicineMVP} />
      <Route path="/medicine-mvp" component={MedicineMVP} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route to custom 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <NotificationProvider>
            <OrderProvider>
              <TooltipProvider>
                <Toaster />
                {/* Legacy Modals */}
                <AuthModal />
                <PharmacyRegisterModal />
                <PhoneSignupModal />

                {/* Separate Role Registration & Login Modals */}
                <PatientAuthModal />
                <PharmacyAuthModal />
                <DeliveryAuthModal />
                <AdminAuthModal />

                <CookieConsentBanner />
                <Router />
              </TooltipProvider>
            </OrderProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
