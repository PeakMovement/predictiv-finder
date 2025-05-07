
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import EnhancedCategorySelection from "@/components/EnhancedCategorySelection";
import CategoryQuestionnaire from "@/components/CategoryQuestionnaire";
import PractitionerList from "@/components/PractitionerList";
import AIPlansDisplay from "@/components/AIPlansDisplay";
import HelpButton from "@/components/HelpButton";
import PlanDetailsView from "@/components/PlanDetailsView";
import HomeHero from "@/components/homepage/HomeHero";
import NavigationControls from "@/components/homepage/NavigationControls";
import { AppStage } from "@/types/app";
import { AIHealthPlan } from "@/types";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { usePractitionerService } from "@/services/practitioner-service";
import { useAIPlansService } from "@/services/ai-plans-service";
import SafeAIPlansDisplay from "@/components/AIPlansDisplay/SafeAIPlansDisplay";
import ConversationalAI from "@/components/ConversationalAI";

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

  // Combine AI input submit with plan generation
  const handleAIInputSubmitWithGeneration = (input: string) => {
    handleAIInputSubmit(input);
    generateAIPlans(input);
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
          <motion.div
            key="ai-input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <div className="flex items-center mb-8">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetToHome} 
                className="mr-2"
              >
                ←
              </Button>
              <h2 className="text-3xl font-bold">Create Your Custom Health Plan</h2>
            </div>
            <ConversationalAI 
              onSubmit={handleAIInputSubmitWithGeneration}
              isLoading={isGenerating}
            />
          </motion.div>
        )}
        
        {stage === 'ai-plans' && (
          <motion.div
            key="ai-plans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <SafeAIPlansDisplay 
              plans={aiPlans}
              userQuery={userQuery}
              onSelectPlan={handleSelectPlan}
              onBack={() => setStage('ai-input')}
              isLoading={isGenerating}
            />
          </motion.div>
        )}

        {stage === 'plan-details' && selectedPlan && (
          <motion.div
            key="plan-details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <PlanDetailsView 
              plan={selectedPlan}
              userQuery={userQuery}
              onBack={() => setStage('ai-plans')}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <HelpButton />
      
      <NavigationControls 
        stage={stage}
        onBack={handleBack}
        onStartOver={resetToHome}
      />
    </main>
  );
};

export default AppContent;
