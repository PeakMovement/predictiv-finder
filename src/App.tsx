import { useState, useEffect } from "react";
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import AIHealthAssistant from "./pages/AIHealthAssistant";
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
      // ✅ Verify origin (Predictiv main app)
      if (!event.origin.includes("predictivfinalux.lovable.app") && !event.origin.includes("localhost")) return;

      // ✅ Directly navigate to AI Health Assistant page
      if (event.data?.action === "goToAIHealthAssistant") {
        // Jump straight to the assistant page (now at root)
        navigate("/", { replace: true });

        // Optional: scroll to top for cleaner view
        setTimeout(() => window.scrollTo(0, 0), 200);
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
            <Route path="/" element={<AIHealthAssistant />} /> {/* 👈 AI Health Assistant - Default Landing Page */}
            <Route path="/explore" element={<Index />} /> {/* Old homepage moved here */}
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/services" element={<Services />} />
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
