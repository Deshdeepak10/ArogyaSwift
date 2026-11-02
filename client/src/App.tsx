import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthModal } from "./components/AuthModal";
import { PharmacyRegisterModal } from "./components/PharmacyRegisterModal";
import { PhoneSignupModal } from "./components/PhoneSignupModal";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import CustomerPortal from "./pages/CustomerPortal";
import PharmacyPortal from "./pages/PharmacyPortal";
import DeliveryPortal from "./pages/DeliveryPortal";
import AdminPortal from "./pages/AdminPortal";
import MedicineMVP from "./pages/MedicineMVP";
import LoginHome from "./pages/LoginHome";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import { OrderProvider } from "./contexts/OrderContext";

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
          <OrderProvider>
            <TooltipProvider>
              <Toaster />
              <AuthModal />
              <PharmacyRegisterModal />
              <PhoneSignupModal />
              <CookieConsentBanner />
              <Router />
            </TooltipProvider>
          </OrderProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
