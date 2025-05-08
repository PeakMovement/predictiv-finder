
import React from "react";
import Header from "@/components/Header";
import AppContent from "@/components/AppContent";
import ErrorBoundary from "@/components/ErrorBoundary";

/**
 * Main page component for the application
 * Provides the layout structure and error boundary protection
 */
const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-health-blue-light dark:bg-gray-900">
      <Header />
      
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </div>
  );
};

export default Index;
