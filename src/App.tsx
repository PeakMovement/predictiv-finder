import { useState, useEffect } from "react";
import "./App.css";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import AIHealthAssistant from "./pages/AIHealthAssistant";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Services from "./pages/Services";
import Professionals from "./pages/Professionals";
import SuccessStories from "./pages/SuccessStories";
import NotFound from "./pages/NotFound";
import ProfessionalLogin from "./pages/ProfessionalLogin";
import PractitionerPortal from "./pages/PractitionerPortal";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import TestSymptomIntake from "./pages/TestSymptomIntake";
import Privacy from "./pages/Privacy";
import { EnhancedErrorBoundary } from "./components/enhanced-error-handling";
import { PlanGenerationErrorFallbackAdapter } from "./components/enhanced-error-handling";
import { ToastProvider } from "./components/ui/toast-provider";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import { PUBLIC_LAUNCH_MODE } from "./config/launchMode";

function App() {
  const [errorKey, setErrorKey] = useState("initial");
  const navigate = useNavigate();

  // 🎯 Handle incoming messages from Predictiv
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("predictivfinalux.lovable.app") && !event.origin.includes("localhost")) return;
      if (event.data?.action === "goToAIHealthAssistant") {
        navigate("/", { replace: true });
        setTimeout(() => window.scrollTo(0, 0), 200);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  const resetKeys = () => setErrorKey(`reset-${Date.now()}`);

  // In public launch mode, hidden routes redirect to the assistant.
  const Hidden = () => <Navigate to="/" replace />;
  const gate = (el: JSX.Element) => (PUBLIC_LAUNCH_MODE ? <Hidden /> : el);

  return (
    <ThemeProvider defaultTheme="dark">
      <ToastProvider>
        <div className="app fixed inset-0 z-0 flex flex-col overflow-y-auto bg-background text-foreground transition-colors duration-300">
          <ThemeToggle />
          <EnhancedErrorBoundary key={errorKey} resetKeys={[resetKeys]} fallback={PlanGenerationErrorFallbackAdapter}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/assistant" element={<AIHealthAssistant />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/explore" element={<Navigate to="/" replace />} />
              <Route path="/how-it-works" element={gate(<HowItWorks />)} />
              <Route path="/services" element={gate(<Services />)} />
              <Route path="/professionals" element={gate(<Professionals />)} />
              <Route path="/success-stories" element={gate(<SuccessStories />)} />
              <Route path="/join/predictiv-practitioners" element={gate(<PractitionerPortal />)} />
              <Route path="/professional-signup" element={<NotFound />} />
              <Route path="/pro-login" element={gate(<ProfessionalLogin />)} />
              <Route path="/professional-dashboard" element={gate(<ProfessionalDashboard />)} />
              <Route path="/test/symptom-intake" element={<TestSymptomIntake />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </EnhancedErrorBoundary>
          <Toaster />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
