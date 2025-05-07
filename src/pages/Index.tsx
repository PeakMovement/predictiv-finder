
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
    <div className="min-h-screen bg-gradient-to-b from-health-blue-light to-white dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </div>
  );
};

export default Index;
