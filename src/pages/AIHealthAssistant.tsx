import React from "react";
import HealthAssistantFlow from "@/components/health-assistant/HealthAssistantFlow";
import { PWAInstallPrompt } from "@/components/mobile/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";

/**
 * AI Health Assistant Page
 * Default landing page where users can input their health concerns
 */
const AIHealthAssistant: React.FC = () => {
  return (
    <div className="min-h-screen bg-health-gradient">
      <PWAInstallPrompt />
      <OfflineIndicator />
      
      <main className="container mx-auto px-4 py-8 min-h-screen">
        <HealthAssistantFlow />
      </main>
    </div>
  );
};

export default AIHealthAssistant;
