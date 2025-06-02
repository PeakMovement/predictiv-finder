import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import HomeHero from "@/components/homepage/HomeHero";
import NavigationControls from "@/components/homepage/NavigationControls";
import MobileNavigationControls from "@/components/homepage/MobileNavigationControls";
import EnhancedCategorySelection from "@/components/EnhancedCategorySelection";
import { AppStage } from "@/types/app";
import { AIHealthPlan } from "@/types";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { usePractitionerService } from "@/services/practitioner-service";
import { useAIPlansService } from "@/services/ai-plans-service";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { EnhancedLoadingIndicator } from "@/components/ui/enhanced-loading-indicator";
import StateRestorationBanner from "@/components/offline/StateRestorationBanner";
import BreadcrumbNavigation from "@/components/ui/breadcrumb-navigation";
import { ContextualErrorDisplay } from "@/components/ui/contextual-error-display";
import { useIsMobile } from "@/hooks/use-mobile";

// Import our component stages
import AIInputStage from "./app-stages/AIInputStage";
import AIPlanStage from "./app-stages/AIPlanStage";
import PlanDetailsStage from "./app-stages/PlanDetailsStage";

// Import new refactored components
import {
  ComparisonView,
  CustomizerView,
  ProgressView,
  QuestionnaireView,
  PractitionerView
} from "./app-content";

/**
 * Main content component for the application
 * Handles rendering different views based on the current application stage
 */
const AppContent: React.FC = () => {
  const isMobile = useIsMobile();
  
  // Custom hooks for navigation and services
  const {
    stage, 
    setStage, 
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
    setUserQuery,
    restorePersistedState,
    dismissRestorationBanner,
    getPersistedState
  } = useAppNavigation();
  
  const {
    getMatchingPractitioners,
    handleSelectPractitioner
  } = usePractitionerService();
  
  const {
    isGenerating,
    aiPlans,
    error,
    generateAIPlans
  } = useAIPlansService();

  // Additional state for enhanced UI features
  const [customizedPlan, setCustomizedPlan] = useState<AIHealthPlan | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  
  // Combine AI input submit with plan generation
  const handleAIInputSubmitWithGeneration = (input: string) => {
    handleAIInputSubmit(input);
    generateAIPlans(input);
  };

  // Handle plan customization
  const handleCustomizePlan = () => {
    if (!selectedPlan) return;
    setCustomizedPlan(selectedPlan);
    setShowCustomizer(true);
  };
  
  // Save customized plan
  const handleSaveCustomizedPlan = (plan: AIHealthPlan) => {
    setCustomizedPlan(null);
    handleSelectPlan(plan);
    setShowCustomizer(false);
  };

  // Determine loading state for the current stage
  const getLoadingState = () => {
    if (error && error !== dismissedError) return "error";
    if (isGenerating) return "loading";
    return "success";
  };

  // Get persisted state for restoration banner
  const persistedState = getPersistedState();

  // Handle error retry with context
  const handleErrorRetry = () => {
    setDismissedError(null);
    switch (stage) {
      case 'ai-plans':
        if (userQuery) generateAIPlans(userQuery);
        break;
      default:
        // Generic retry - could reload data or reset state
        window.location.reload();
    }
  };

  // Handle error dismissal
  const handleErrorDismiss = () => {
    setDismissedError(error);
  };

  // Render the main content based on current stage
  const renderMainContent = () => {
    if (stage === 'home') {
      return (
        <HomeHero 
          key="home"
          onSelectCategoryFlow={() => navigateToStage('category-selector')} 
          onSelectAIFlow={() => navigateToStage('ai-input')} 
        />
      );
    }
    
    if (stage === 'category-selector') {
      return (
        <EnhancedCategorySelection
          key="category-selector"
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          onContinue={() => handleCategorySubmit(selectedCategories)}
        />
      );
    }
    
    if (stage === 'category-questionnaire' && selectedCategories.length > 0) {
      return (
        <QuestionnaireView
          key="category-questionnaire"
          categories={selectedCategories}
          onSubmit={handleQuestionnaireSubmit}
          onBack={() => navigateToStage('category-selector')}
        />
      );
    }
    
    if (stage === 'practitioner-list') {
      return (
        <PractitionerView
          key="practitioner-list"
          practitioners={getMatchingPractitioners(userCriteria)}
          criteria={userCriteria}
          onSelectPractitioner={handleSelectPractitioner}
          onBack={() => navigateToStage('category-questionnaire')}
          onAIAssistant={() => navigateToStage('ai-input')}
        />
      );
    }
    
    if (stage === 'ai-input') {
      return (
        <AIInputStage
          key="ai-input"
          onSubmit={handleAIInputSubmitWithGeneration}
          isLoading={isGenerating}
          onBack={resetToHome}
        />
      );
    }
    
    if (stage === 'ai-plans' && !showComparison) {
      return (
        <EnhancedLoadingIndicator
          key="ai-plans-loading"
          state={getLoadingState()}
          loadingText="Creating your personalized health plans..."
          errorMessage={error || "Failed to generate plans"}
          onRetry={handleErrorRetry}
          showSkeleton={true}
          skeletonLines={3}
          minLoadingTime={100}
        >
          <AIPlanStage
            plans={aiPlans}
            userInput={userQuery}
            isLoading={isGenerating}
            onSelectPlan={handleSelectPlan}
            onBack={() => navigateToStage('ai-input')}
            onCompare={() => setShowComparison(true)}
          />
        </EnhancedLoadingIndicator>
      );
    }
    
    if (stage === 'ai-plans' && showComparison) {
      return (
        <ComparisonView
          key="ai-plans-comparison"
          plans={aiPlans}
          onSelectPlan={handleSelectPlan}
          onBack={() => setShowComparison(false)}
        />
      );
    }

    if (stage === 'plan-details' && selectedPlan && !showCustomizer && !showProgress) {
      return (
        <PlanDetailsStage
          key="plan-details"
          plan={selectedPlan}
          userQuery={userQuery}
          onBack={() => navigateToStage('ai-plans')}
          onCustomize={handleCustomizePlan}
          onTrackProgress={() => setShowProgress(true)}
        />
      );
    }
    
    if (stage === 'plan-details' && selectedPlan && showCustomizer) {
      return (
        <CustomizerView
          key="plan-customizer"
          plan={selectedPlan}
          onSave={handleSaveCustomizedPlan}
          onCancel={() => setShowCustomizer(false)}
        />
      );
    }
    
    if (stage === 'plan-details' && selectedPlan && showProgress) {
      return (
        <ProgressView
          key="plan-progress"
          plan={selectedPlan}
          onBack={() => setShowProgress(false)}
        />
      );
    }

    return null;
  };

  return (
    <>
      <OfflineBanner />
      
      {showRestorationBanner && persistedState && (
        <StateRestorationBanner
          onRestore={restorePersistedState}
          onDismiss={dismissRestorationBanner}
          persistedState={{
            stage: persistedState.stage || 'home',
            selectedCategories: persistedState.selectedCategories || [],
            userQuery: persistedState.userQuery || '',
            timestamp: persistedState.timestamp || Date.now()
          }}
        />
      )}
      
      <main className={`container max-w-6xl mx-auto px-4 py-8 ${isMobile ? 'pb-24' : ''}`}>
        <BreadcrumbNavigation 
          currentStage={stage}
          onNavigate={navigateToStage}
        />
        
        <ContextualErrorDisplay
          error={error && error !== dismissedError ? error : null}
          currentStage={stage}
          onRetry={handleErrorRetry}
          onBack={handleBack}
          onHome={resetToHome}
          onDismiss={handleErrorDismiss}
        />
        
        <AnimatePresence mode="wait">
          {renderMainContent()}
        </AnimatePresence>
        
        {/* Use mobile-responsive navigation */}
        {isMobile ? (
          <MobileNavigationControls 
            stage={stage}
            onBack={handleBack}
            onStartOver={resetToHome}
          />
        ) : (
          <NavigationControls 
            stage={stage}
            onBack={handleBack}
            onStartOver={resetToHome}
          />
        )}
      </main>
    </>
  );
};

export default AppContent;
