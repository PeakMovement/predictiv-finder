
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
    handleBack,
    resetToHome,
    handleCategoryToggle,
    handleCategorySubmit,
    handleQuestionnaireSubmit,
    handleAIInputSubmit,
    handleSelectPlan,
    setUserQuery
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

  return (
    <main className="container max-w-6xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        <ErrorDisplay error={error} />
        
        {stage === 'home' && (
          <HomeHero 
            onSelectCategoryFlow={() => setStage('category-selector')} 
            onSelectAIFlow={() => setStage('ai-input')} 
          />
        )}
        
        {stage === 'category-selector' && (
          <EnhancedCategorySelection
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            onContinue={() => handleCategorySubmit(selectedCategories)}
          />
        )}
        
        {stage === 'category-questionnaire' && selectedCategories.length > 0 && (
          <QuestionnaireView
            categories={selectedCategories}
            onSubmit={handleQuestionnaireSubmit}
            onBack={() => setStage('category-selector')}
          />
        )}
        
        {stage === 'practitioner-list' && (
          <PractitionerView
            practitioners={getMatchingPractitioners(userCriteria)}
            criteria={userCriteria}
            onSelectPractitioner={handleSelectPractitioner}
            onBack={() => setStage('category-questionnaire')}
            onAIAssistant={() => setStage('ai-input')}
          />
        )}
        
        {stage === 'ai-input' && (
          <AIInputStage
            onSubmit={handleAIInputSubmitWithGeneration}
            isLoading={isGenerating}
            onBack={resetToHome}
          />
        )}
        
        {stage === 'ai-plans' && !showComparison && (
          <AIPlanStage
            plans={aiPlans}
            userInput={userQuery}
            isLoading={isGenerating}
            onSelectPlan={handleSelectPlan}
            onBack={() => setStage('ai-input')}
            onCompare={() => setShowComparison(true)}
          />
        )}
        
        {stage === 'ai-plans' && showComparison && (
          <ComparisonView
            plans={aiPlans}
            onSelectPlan={handleSelectPlan}
            onBack={() => setShowComparison(false)}
          />
        )}

        {stage === 'plan-details' && selectedPlan && !showCustomizer && !showProgress && (
          <PlanDetailsStage
            plan={selectedPlan}
            userQuery={userQuery}
            onBack={() => setStage('ai-plans')}
            onCustomize={handleCustomizePlan}
            onTrackProgress={() => setShowProgress(true)}
          />
        )}
        
        {stage === 'plan-details' && selectedPlan && showCustomizer && (
          <CustomizerView
            plan={selectedPlan}
            onSave={handleSaveCustomizedPlan}
            onCancel={() => setShowCustomizer(false)}
          />
        )}
        
        {stage === 'plan-details' && selectedPlan && showProgress && (
          <ProgressView
            plan={selectedPlan}
            onBack={() => setShowProgress(false)}
          />
        )}
      </AnimatePresence>
      
      <NavigationControls 
        stage={stage}
        onBack={handleBack}
        onStartOver={resetToHome}
      />
    </main>
  );
};

export default AppContent;
