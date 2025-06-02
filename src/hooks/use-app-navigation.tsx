import { useState, useCallback, useEffect } from "react";
import { AppStage } from "@/types/app";
import { ServiceCategory, DetailedUserCriteria, AIHealthPlan } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { findAlternativeCategories } from "@/utils/aiPlanGenerator";
import { validateArrayInput } from "@/utils/inputValidation";
import { useOfflinePersistence } from "./use-offline-persistence";

/**
 * Custom hook for managing application navigation and state transitions
 * Now includes offline persistence capabilities and improved navigation flow
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
  const [navigationHistory, setNavigationHistory] = useState<AppStage[]>(['home']);
  
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
      selectedPlan,
      timestamp: Date.now()
    });
  }, [isHydrated, stage, selectedCategories, userCriteria, userQuery, selectedPlan, saveState]);

  // Update navigation history when stage changes
  useEffect(() => {
    setNavigationHistory(prev => {
      const newHistory = [...prev];
      if (newHistory[newHistory.length - 1] !== stage) {
        newHistory.push(stage);
      }
      // Keep history manageable
      return newHistory.slice(-5);
    });
  }, [stage]);

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
    setNavigationHistory(['home']);
    clearPersistedState();
  }, [clearPersistedState]);

  /**
   * Enhanced navigation with validation to prevent stuck states
   */
  const navigateToStage = useCallback((newStage: AppStage) => {
    // Validate navigation is allowed
    const canNavigate = validateStageTransition(stage, newStage, {
      hasCategories: selectedCategories.length > 0,
      hasCriteria: userCriteria.categories.length > 0,
      hasQuery: userQuery.trim().length > 0,
      hasPlan: selectedPlan !== null
    });

    if (!canNavigate.allowed) {
      toast({
        title: "Cannot navigate",
        description: canNavigate.reason,
        variant: "destructive",
      });
      return false;
    }

    setStage(newStage);
    return true;
  }, [stage, selectedCategories, userCriteria, userQuery, selectedPlan, toast]);
  
  /**
   * Improved back navigation with history
   */
  const handleBack = useCallback(() => {
    // Use navigation history if available
    if (navigationHistory.length > 1) {
      const previousStage = navigationHistory[navigationHistory.length - 2];
      setNavigationHistory(prev => prev.slice(0, -1));
      setStage(previousStage);
      return;
    }

    // Fallback to default back behavior
    switch(stage) {
      case 'category-questionnaire':
        if (selectedCategories.length > 0) {
          setStage('category-selector');
        } else {
          resetToHome();
        }
        break;
      case 'practitioner-list':
        if (userCriteria.categories.length > 0) {
          setStage('category-questionnaire');
        } else {
          setStage('category-selector');
        }
        break;
      case 'ai-plans':
        if (userQuery.trim()) {
          setStage('ai-input');
        } else {
          resetToHome();
        }
        break;
      case 'plan-details':
        setStage('ai-plans');
        break;
      case 'ai-input':
        resetToHome();
        break;
      default:
        resetToHome();
    }
  }, [stage, navigationHistory, selectedCategories, userCriteria, userQuery, resetToHome]);

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
    navigationHistory,
    
    // Action handlers
    handleBack,
    resetToHome,
    navigateToStage,
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

// Helper function to validate stage transitions
function validateStageTransition(
  currentStage: AppStage, 
  targetStage: AppStage, 
  context: {
    hasCategories: boolean;
    hasCriteria: boolean;
    hasQuery: boolean;
    hasPlan: boolean;
  }
): { allowed: boolean; reason?: string } {
  
  // Allow navigation to home from anywhere
  if (targetStage === 'home') {
    return { allowed: true };
  }

  // Allow backward navigation generally
  const stageOrder: AppStage[] = [
    'home', 'category-selector', 'category-questionnaire', 
    'practitioner-list', 'ai-input', 'ai-plans', 'plan-details'
  ];
  
  const currentIndex = stageOrder.indexOf(currentStage);
  const targetIndex = stageOrder.indexOf(targetStage);
  
  if (targetIndex < currentIndex) {
    return { allowed: true }; // Backward navigation
  }

  // Forward navigation validation
  switch (targetStage) {
    case 'category-questionnaire':
      if (!context.hasCategories) {
        return { allowed: false, reason: "Please select categories first" };
      }
      break;
    case 'practitioner-list':
      if (!context.hasCriteria) {
        return { allowed: false, reason: "Please complete the questionnaire first" };
      }
      break;
    case 'ai-plans':
      if (!context.hasQuery) {
        return { allowed: false, reason: "Please enter your health query first" };
      }
      break;
    case 'plan-details':
      if (!context.hasPlan) {
        return { allowed: false, reason: "Please select a plan first" };
      }
      break;
  }

  return { allowed: true };
}
