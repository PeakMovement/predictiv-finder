
/**
 * LEGACY — not mounted on any public route.
 * Full health-plan / CSV-physician wizard. See src/legacy/README.md.
 * Do not add this component back to App.tsx.
 */
import React from "react";
import AppContent from "@/components/AppContent";
import ErrorBoundary from "@/components/ErrorBoundary";

/**
 * Main page component for the application
 * Provides the layout structure and error boundary protection
 */
const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-health-blue-light dark:bg-gray-900">
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </div>
  );
};

export default Index;
