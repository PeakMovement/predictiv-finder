
import React from "react";
import AppContent from "@/components/AppContent";
import ErrorBoundary from "@/components/ErrorBoundary";

/**
 * Main page component for the application
 * Provides the layout structure and error boundary protection
 */
const Index: React.FC = () => {
  return (
    <div className="min-h-screen">
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </div>
  );
};

export default Index;
