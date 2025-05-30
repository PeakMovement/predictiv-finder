import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import HomeHero from "@/components/homepage/HomeHero";
import NavigationControls from "@/components/homepage/NavigationControls";
import EnhancedCategorySelection from "@/components/EnhancedCategorySelection";
import { AppStage } from "@/types/app";
import { AIHealthPlan } from "@/types";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { usePractitionerService } from "@/services/practitioner-service";
import { useAIPlansService } from "@/services/ai-plans-service";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { EnhancedLoadingIndicator } from "@/components/ui/enhanced-loading-indicator";
import StateRestorationBanner from "@/components/offline/StateRestorationBanner";

// Import our component stages
import AIInputStage from "./app-stages/AIInputStage";
import AIPlanStage from "./app-stages/AIPlanStage";
import PlanDetailsStage from "./app-stages/PlanDetailsStage";

// Import new refactored components
import {
  ErrorDisplay,
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
    handleCategoryToggle,
    handleCategorySubmit,
    handleQuestionnaireSubmit,
    handleAIInputSubmit,
    handleSelectPlan,
    setUserQuery,
    restorePersistedState,
    dismissRestorationBanner
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
    if (error) return "error";
    if (isGenerating) return "loading";
    return "success";
  };

  // Render the main content based on current stage
  const renderMainContent = () => {
    if (stage === 'home') {
      return (
        <HomeHero 
          key="home"
          onSelectCategoryFlow={() => setStage('category-selector')} 
          onSelectAIFlow={() => setStage('ai-input')} 
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
          onBack={() => setStage('category-selector')}
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
          onBack={() => setStage('category-questionnaire')}
          onAIAssistant={() => setStage('ai-input')}
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
          onRetry={() => generateAIPlans(userQuery)}
          showSkeleton={true}
          skeletonLines={3}
        >
          <AIPlanStage
            plans={aiPlans}
            userInput={userQuery}
            isLoading={isGenerating}
            onSelectPlan={handleSelectPlan}
            onBack={() => setStage('ai-input')}
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
          onBack={() => setStage('ai-plans')}
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
      
      {showRestorationBanner && (
        <StateRestorationBanner
          onRestore={restorePersistedState}
          onDismiss={dismissRestorationBanner}
          timestamp={Date.now() - 1000} // This will be updated with actual timestamp from persisted state
        />
      )}
      
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <ErrorDisplay error={error} />
        
        <AnimatePresence mode="wait">
          {renderMainContent()}
        </AnimatePresence>
        
        <NavigationControls 
          stage={stage}
          onBack={handleBack}
          onStartOver={resetToHome}
        />
      </main>
    </>
  );
};

export default AppContent;
