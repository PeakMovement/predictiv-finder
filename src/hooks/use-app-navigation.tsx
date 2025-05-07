
import { useState, useCallback } from "react";
import { AppStage } from "@/types/app";
import { ServiceCategory, DetailedUserCriteria, AIHealthPlan } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { findAlternativeCategories } from "@/utils/aiPlanGenerator";
import { validateArrayInput } from "@/utils/inputValidation";

/**
 * Custom hook for managing application navigation and state transitions
 * Encapsulates navigation logic and state management for the main application flow
 * 
 * @returns An object containing navigation state and handler functions
 */
export function useAppNavigation() {
  const [stage, setStage] = useState<AppStage>('home');
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>([]);
  const [userCriteria, setUserCriteria] = useState<DetailedUserCriteria>({
    categories: [],
    budget: {
      monthly: 2000,
      preferredSetup: 'not-sure',
      flexibleBudget: false
    }
  });
  const [userQuery, setUserQuery] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<AIHealthPlan | null>(null);
  const { toast } = useToast();

  /**
   * Resets the application state to initial values
   */
  const resetToHome = useCallback(() => {
    setStage('home');
    setSelectedCategories([]);
    setUserCriteria({
      categories: [],
      budget: {
        monthly: 2000,
        preferredSetup: 'not-sure',
        flexibleBudget: false
      }
    });
    setUserQuery('');
  }, []);
  
  /**
   * Handles navigation to previous stage based on current stage
   */
  const handleBack = useCallback(() => {
    switch(stage) {
      case 'category-questionnaire':
        setStage('category-selector');
        break;
      case 'practitioner-list':
        setStage('category-questionnaire');
        break;
      case 'ai-plans':
        setStage('ai-input');
        break;
      case 'ai-input':
        resetToHome();
        break;
      case 'plan-details':
        setStage('ai-plans');
        break;
      default:
        resetToHome();
    }
  }, [stage, resetToHome]);

  /**
   * Handles selection and validation of categories
   */
  const handleCategoryToggle = useCallback((category: ServiceCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  /**
   * Validates and processes category submission with intelligent recommendations
   */
  const handleCategorySubmit = useCallback((categories: ServiceCategory[]) => {
    // Validate category selection
    const validation = validateArrayInput(categories, 0);
    
    if (categories.length === 0) {
      const alternatives = findAlternativeCategories([]);
      toast({
        title: "Consider these options",
        description: `We recommend exploring ${alternatives.map(c => c.replace('-', ' ')).join(' or ')} to start your wellness journey.`,
        variant: "default",
      });
      return;
    }

    if (categories.length < 2) {
      const alternatives = findAlternativeCategories(categories);
      toast({
        title: "Additional recommendations",
        description: `Consider adding ${alternatives.map(c => c.replace('-', ' ')).join(' or ')} to optimize your wellness plan.`,
        variant: "default",
      });
    }

    setSelectedCategories(categories);
    setStage('category-questionnaire');
  }, [toast]);

  /**
   * Validates and processes questionnaire submission
   */
  const handleQuestionnaireSubmit = useCallback((criteria: DetailedUserCriteria) => {
    // Validate criteria
    if (!criteria.categories || criteria.categories.length === 0) {
      toast({
        title: "Missing categories",
        description: "Please select at least one category.",
        variant: "destructive",
      });
      return;
    }
    
    setUserCriteria(criteria);
    setStage('practitioner-list');
  }, [toast]);

  /**
   * Processes AI input submission
   */
  const handleAIInputSubmit = useCallback((input: string) => {
    setUserQuery(input);
    setStage('ai-plans');
  }, []);

  /**
   * Handles selection of an AI-generated health plan
   */
  const handleSelectPlan = useCallback((plan: AIHealthPlan) => {
    setSelectedPlan(plan);
    setStage('plan-details');
  }, []);

  return {
    // State
    stage,
    setStage,
    selectedCategories,
    userCriteria,
    userQuery,
    selectedPlan,
    
    // Action handlers
    handleBack,
    resetToHome,
    handleCategoryToggle,
    handleCategorySubmit,
    handleQuestionnaireSubmit,
    handleAIInputSubmit,
    handleSelectPlan,
    setUserQuery,
  };
}
