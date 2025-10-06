import { useState, useEffect } from "react";
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Services from "./pages/Services";
import Professionals from "./pages/Professionals";
import SuccessStories from "./pages/SuccessStories";
import NotFound from "./pages/NotFound";
import { EnhancedErrorBoundary } from "./components/enhanced-error-handling";
import { PlanGenerationErrorFallbackAdapter } from "./components/enhanced-error-handling";
import { ToastProvider } from "./components/ui/toast-provider";
import { Toaster } from "./components/ui/toaster";

function App() {
  const [errorKey, setErrorKey] = useState("initial");
  const navigate = useNavigate();

  // 🎯 Handle incoming messages from Predictiv
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // ✅ Only accept messages from the main Predictiv app
      if (!event.origin.includes("predictivfinalux.lovable.app")) return;

      // ✅ Navigate directly to the AI Health Assistant (Services) page
      if (event.data?.action === "goToAIHealthAssistant") {
        navigate("/services"); // You can change this path if needed
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  const resetKeys = () => setErrorKey(`reset-${Date.now()}`);

  return (
    <ToastProvider>
      <div className="app min-h-screen bg-gray-50 dark:bg-gray-900">
        <EnhancedErrorBoundary key={errorKey} resetKeys={[resetKeys]} fallback={PlanGenerationErrorFallbackAdapter}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/services" element={<Services />} /> {/* 👈 AI Health Assistant Page */}
            <Route path="/professionals" element={<Professionals />} />
            <Route path="/success-stories" element={<SuccessStories />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </EnhancedErrorBoundary>
        <Toaster />
      </div>
    </ToastProvider>
  );
}

export default App;
