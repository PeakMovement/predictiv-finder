
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

// Import existing stage components
import { HomeHero } from "@/components/homepage/HomeHero";
import { EnhancedCategorySelection } from "@/components/EnhancedCategorySelection";
import { CategoryQuestionnaire } from "@/components/CategoryQuestionnaire";
import { PractitionerList } from "@/components/PractitionerList";
import { AIInputStage } from "@/components/app-stages/AIInputStage";
import { AIPlanStage } from "@/components/app-stages/AIPlanStage";
import { PlanDetailsStage } from "@/components/app-stages/PlanDetailsStage";

const AppContent: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const { isAuthenticated } = useAuth();
  
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
  } = useAppNavigation();

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  const handleStageNavigation = (newStage: any) => {
    clearError();
    navigateToStage(newStage);
  };

  const handleGoHome = () => {
    clearError();
    resetToHome();
    setShowDashboard(false);
  };

  const renderStageContent = () => {
    if (showDashboard) {
      return <EnhancedUserDashboard />;
    }

    switch (stage) {
      case 'home':
        return (
          <HomeHero 
            onNavigateToCategories={() => handleStageNavigation('category-selector')}
            onNavigateToAI={() => handleStageNavigation('ai-input')}
            onShowDashboard={() => setShowDashboard(true)}
          />
        );
      case 'category-selector':
        return (
          <EnhancedCategorySelection
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            onSubmit={handleCategorySubmit}
            onError={handleError}
          />
        );
      case 'category-questionnaire':
        return (
          <CategoryQuestionnaire
            selectedCategories={selectedCategories}
            onSubmit={handleQuestionnaireSubmit}
            onError={handleError}
          />
        );
      case 'practitioner-list':
        return (
          <PractitionerList
            userCriteria={userCriteria}
            onError={handleError}
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
            onNavigateToCategories={() => handleStageNavigation('category-selector')}
            onNavigateToAI={() => handleStageNavigation('ai-input')}
            onShowDashboard={() => setShowDashboard(true)}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-health-blue-light via-health-teal-light to-health-purple-light">
      {/* PWA and Offline Status */}
      <PWAInstallPrompt />
      <OfflineIndicator />
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleGoHome}
                className="text-2xl font-bold text-health-purple hover:text-health-purple-dark transition-colors"
              >
                Predictiv Health
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => setShowDashboard(!showDashboard)}
                  className="text-sm text-health-purple hover:text-health-purple-dark transition-colors"
                >
                  {showDashboard ? 'Back to App' : 'Dashboard'}
                </button>
              )}
            </div>
            <UserProfileMenu openLoginModal={() => setIsLoginModalOpen(true)} />
          </div>
        </div>
      </header>

      {/* State Restoration Banner */}
      {showRestorationBanner && (
        <StateRestorationBanner
          onRestore={restorePersistedState}
          onDismiss={dismissRestorationBanner}
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
      <main className="container mx-auto px-4 py-8 pb-24">
        {renderStageContent()}
      </main>

      {/* Mobile Navigation */}
      {!showDashboard && (
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
  );
};

export default AppContent;
