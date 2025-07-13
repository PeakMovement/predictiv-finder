
import React, { useState } from "react";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { LoginModal } from "@/components/auth/LoginModal";
import { UserProfileMenu } from "@/components/auth/UserProfileMenu";
import { EnhancedUserDashboard } from "@/components/dashboard/EnhancedUserDashboard";
import { PWAInstallPrompt } from "@/components/mobile/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";
import { StateRestorationBanner } from "@/components/offline/StateRestorationBanner";
import { BreadcrumbNavigation } from "@/components/ui/breadcrumb-navigation";
import { MobileNavigationControls } from "@/components/homepage/MobileNavigationControls";
import { ContextualErrorDisplay } from "@/components/ui/contextual-error-display";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

// Import existing stage components with default imports
import { HomeHero } from "@/components/homepage/HomeHero";
import { EnhancedCategorySelection } from "@/components/EnhancedCategorySelection";
import { CategoryQuestionnaire } from "@/components/CategoryQuestionnaire";
import { PractitionerList } from "@/components/PractitionerList";
import AIInputStage from "@/components/app-stages/AIInputStage";
import AIPlanStage from "@/components/app-stages/AIPlanStage";
import PlanDetailsStage from "@/components/app-stages/PlanDetailsStage";

const AppContent: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  
  const {
    stage,
    selectedCategories,
    userCriteria,
    userQuery,
    selectedPlan,
    showRestorationBanner,
    handleBack,
    resetToHome,
    navigateToStage,
    handleCategoryToggle,
    handleCategorySubmit,
    handleQuestionnaireSubmit,
    handleAIInputSubmit,
    handleSelectPlan,
    restorePersistedState,
    dismissRestorationBanner,
    getPersistedState,
  } = useAppNavigation();

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  const handleStageNavigation = (newStage: any) => {
    clearError();
    console.log('Navigating to stage:', newStage); // Debug log
    navigateToStage(newStage);
  };

  const handleGoHome = () => {
    clearError();
    resetToHome();
    setShowDashboard(false);
  };

  const handleCategorySelection = () => {
    console.log('Browse categories clicked'); // Debug log
    handleStageNavigation('category-selector');
  };

  const renderStageContent = () => {
    console.log('Current stage:', stage); // Debug log
    
    if (showDashboard) {
      return <EnhancedUserDashboard />;
    }

    switch (stage) {
      case 'home':
        return (
          <HomeHero 
            onNavigateToCategories={handleCategorySelection}
            onNavigateToAI={() => handleStageNavigation('ai-input')}
            onShowDashboard={() => setShowDashboard(true)}
          />
        );
      case 'category-selector':
        return (
          <EnhancedCategorySelection
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            onContinue={() => handleCategorySubmit(selectedCategories)}
          />
        );
      case 'category-questionnaire':
        return (
          <CategoryQuestionnaire
            categories={selectedCategories}
            onSubmit={handleQuestionnaireSubmit}
            onBack={handleBack}
          />
        );
      case 'practitioner-list':
        return (
          <PractitionerList
            practitioners={[]}
            criteria={userCriteria}
            onSelectPractitioner={(practitioner) => {
              console.log('Selected practitioner:', practitioner);
            }}
            onBack={handleBack}
            onAIAssistant={() => handleStageNavigation('ai-input')}
          />
        );
      case 'ai-input':
        return (
          <AIInputStage
            onSubmit={handleAIInputSubmit}
            onError={handleError}
          />
        );
      case 'ai-plans':
        return (
          <AIPlanStage
            userQuery={userQuery}
            onSelectPlan={handleSelectPlan}
            onError={handleError}
          />
        );
      case 'plan-details':
        return (
          <PlanDetailsStage
            plan={selectedPlan}
            userQuery={userQuery}
            onError={handleError}
          />
        );
      default:
        return (
          <HomeHero 
            onNavigateToCategories={handleCategorySelection}
            onNavigateToAI={() => handleStageNavigation('ai-input')}
            onShowDashboard={() => setShowDashboard(true)}
          />
        );
    }
  };

  // Get persisted state for the restoration banner
  const persistedState = getPersistedState();

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Full-screen gradient background - optimized for all screens including Mac */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-health-blue-light via-health-teal-light to-health-purple-light" />
      
      {/* Scrollable content area */}
      <div className="relative w-full h-full overflow-y-auto">
        {/* PWA and Offline Status */}
        <PWAInstallPrompt />
        <OfflineIndicator />

        {/* State Restoration Banner */}
        {showRestorationBanner && persistedState && (
          <StateRestorationBanner
            onRestore={restorePersistedState}
            onDismiss={dismissRestorationBanner}
            persistedState={persistedState}
          />
        )}

        {/* Breadcrumb Navigation */}
        {!showDashboard && (
          <BreadcrumbNavigation
            currentStage={stage}
            onNavigate={handleStageNavigation}
            className="container mx-auto px-4 pt-4"
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="container mx-auto px-4 pt-4">
            <ContextualErrorDisplay
              error={error}
              currentStage={stage}
              onRetry={clearError}
              onBack={handleBack}
              onHome={handleGoHome}
              onDismiss={clearError}
            />
          </div>
        )}

        {/* Main Content */}
        <main className={`container mx-auto px-4 py-8 ${isMobile ? 'pb-24' : 'pb-8'} min-h-screen`}>
          {renderStageContent()}
        </main>

        {/* Mobile Navigation */}
        {!showDashboard && isMobile && (
          <MobileNavigationControls
            stage={stage}
            onBack={handleBack}
            onStartOver={handleGoHome}
          />
        )}

        {/* Login Modal */}
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
      </div>
    </div>
  );
};

export default AppContent;
