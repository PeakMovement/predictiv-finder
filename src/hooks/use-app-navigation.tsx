
import { useState, useCallback, useEffect } from "react";
import { AppStage } from "@/types/app";
import { ServiceCategory, DetailedUserCriteria, AIHealthPlan } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { findAlternativeCategories } from "@/utils/aiPlanGenerator";
import { validateArrayInput } from "@/utils/inputValidation";
import { useOfflinePersistence } from "./use-offline-persistence";

/**
 * Custom hook for managing application navigation and state transitions
 * Now includes offline persistence capabilities
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
  const [showRestorationBanner, setShowRestorationBanner] = useState(false);
  
  const { toast } = useToast();
  const { 
    saveState, 
    getPersistedState, 
    clearPersistedState, 
    hasPersistedState,
    isHydrated 
  } = useOfflinePersistence();

  // Check for persisted state on hydration
  useEffect(() => {
    if (!isHydrated) return;

    if (hasPersistedState()) {
      const persistedState = getPersistedState();
      if (persistedState && persistedState.stage !== 'home') {
        setShowRestorationBanner(true);
      }
    }
  }, [isHydrated, hasPersistedState, getPersistedState]);

  // Persist state whenever it changes (but only after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    saveState({
      stage,
      selectedCategories,
      userCriteria,
      userQuery,
      selectedPlan
    });
  }, [isHydrated, stage, selectedCategories, userCriteria, userQuery, selectedPlan, saveState]);

  // Restore state from persistence
  const restorePersistedState = useCallback(() => {
    const persistedState = getPersistedState();
    if (persistedState) {
      if (persistedState.stage) setStage(persistedState.stage);
      if (persistedState.selectedCategories) setSelectedCategories(persistedState.selectedCategories);
      if (persistedState.userCriteria) setUserCriteria(persistedState.userCriteria);
      if (persistedState.userQuery) setUserQuery(persistedState.userQuery);
      if (persistedState.selectedPlan) setSelectedPlan(persistedState.selectedPlan);
      
      toast({
        title: "Progress restored",
        description: "Your previous session has been restored.",
      });
    }
    setShowRestorationBanner(false);
  }, [getPersistedState, toast]);

  // Dismiss restoration banner
  const dismissRestorationBanner = useCallback(() => {
    setShowRestorationBanner(false);
    clearPersistedState();
  }, [clearPersistedState]);

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
    setSelectedPlan(null);
    clearPersistedState();
  }, [clearPersistedState]);
  
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
    showRestorationBanner,
    
    // Action handlers
    handleBack,
    resetToHome,
    handleCategoryToggle,
    handleCategorySubmit,
    handleQuestionnaireSubmit,
    handleAIInputSubmit,
    handleSelectPlan,
    setUserQuery,
    
    // Offline persistence
    restorePersistedState,
    dismissRestorationBanner,
    getPersistedState,
  };
}
