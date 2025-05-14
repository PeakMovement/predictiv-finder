
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import EnhancedCategorySelection from "@/components/EnhancedCategorySelection";
import CategoryQuestionnaire from "@/components/CategoryQuestionnaire";
import PractitionerList from "@/components/PractitionerList";
import HomeHero from "@/components/homepage/HomeHero";
import NavigationControls from "@/components/homepage/NavigationControls";
import { AppStage } from "@/types/app";
import { AIHealthPlan } from "@/types";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { usePractitionerService } from "@/services/practitioner-service";
import { useAIPlansService } from "@/services/ai-plans-service";
import PlanComparisonView from "@/components/plan-comparison/PlanComparisonView";
import PlanCustomizer from "@/components/plan-customizer/PlanCustomizer";
import ProgressTrackingView from "@/components/progress-tracking/ProgressTrackingView";

// Import our new component stages
import AIInputStage from "./app-stages/AIInputStage";
import AIPlanStage from "./app-stages/AIPlanStage";
import PlanDetailsStage from "./app-stages/PlanDetailsStage";

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
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border-l-4 border-red-400 p-4 mb-6"
          >
            <div className="flex">
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
        
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
          <motion.div
            key="questionnaire"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <CategoryQuestionnaire 
              categories={selectedCategories}
              onSubmit={handleQuestionnaireSubmit}
              onBack={() => setStage('category-selector')}
            />
          </motion.div>
        )}
        
        {stage === 'practitioner-list' && (
          <motion.div
            key="practitioner-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <PractitionerList 
              practitioners={getMatchingPractitioners(userCriteria)}
              criteria={userCriteria}
              onSelectPractitioner={handleSelectPractitioner}
              onBack={() => setStage('category-questionnaire')}
              onAIAssistant={() => setStage('ai-input')}
            />
          </motion.div>
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
          <motion.div
            key="plan-comparison"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <PlanComparisonView 
              plans={aiPlans}
              onSelectPlan={handleSelectPlan}
              onBack={() => setShowComparison(false)}
            />
          </motion.div>
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
          <motion.div
            key="plan-customizer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <PlanCustomizer 
              plan={selectedPlan}
              onUpdatePlan={(plan) => {}}
              onSave={handleSaveCustomizedPlan}
              onCancel={() => setShowCustomizer(false)}
            />
          </motion.div>
        )}
        
        {stage === 'plan-details' && selectedPlan && showProgress && (
          <motion.div
            key="progress-tracking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <ProgressTrackingView 
              plan={selectedPlan}
              onBack={() => setShowProgress(false)}
            />
          </motion.div>
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
