
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import EnhancedCategorySelection from "@/components/EnhancedCategorySelection";
import CategoryQuestionnaire from "@/components/CategoryQuestionnaire";
import AIAssistantInput from "@/components/AIAssistantInput";
import PractitionerList from "@/components/PractitionerList";
import AIPlansDisplay from "@/components/AIPlansDisplay";
import HelpButton from "@/components/HelpButton";
import { ServiceCategory, DetailedUserCriteria, Practitioner, AIHealthPlan } from "@/types";
import { AppStage } from "@/types/app";
import { PRACTITIONERS } from "@/data/mockData";
import { 
  generateCustomAIPlans, 
  findAlternativeCategories
} from "@/utils/aiPlanGenerator";
import { generateProfessionalRecommendations } from "@/utils/planGenerator/professionalRecommendation";
import { useToast } from "@/hooks/use-toast";
import PlanDetailsView from "@/components/PlanDetailsView";
import HomeHero from "@/components/homepage/HomeHero";
import NavigationControls from "@/components/homepage/NavigationControls";
import { validateArrayInput } from "@/utils/inputValidation";

const Index = () => {
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPlans, setAiPlans] = useState<AIHealthPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<AIHealthPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Memoized function to get matching practitioners for better performance
  const getMatchingPractitioners = useCallback((criteria: DetailedUserCriteria): Practitioner[] => {
    try {
      // Here you would implement actual filtering logic based on criteria
      return PRACTITIONERS;
    } catch (error) {
      console.error("Error getting matching practitioners:", error);
      toast({
        title: "Error finding matching practitioners",
        description: "There was a problem finding practitioners. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  // Enhanced AI plan generation with error handling
  const generateAIPlans = useCallback(async (query: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate professional recommendations using the new system
      const recommendations = generateProfessionalRecommendations(query);
      console.log("Professional recommendations:", recommendations);
      
      if (recommendations.length === 0) {
        throw new Error("Unable to generate professional recommendations based on your input");
      }
      
      // Generate the customized plans
      const customPlans = generateCustomAIPlans(query);
      
      if (customPlans.length === 0) {
        throw new Error("Unable to generate health plans based on your input");
      }
      
      setAiPlans(customPlans);
    } catch (error) {
      console.error("Error generating AI plans:", error);
      setError(error instanceof Error ? error.message : "Failed to generate health plans");
      
      toast({
        title: "Error generating health plans",
        description: error instanceof Error ? error.message : "Failed to generate health plans. Please try again with different wording.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const handleCategoryToggle = useCallback((category: ServiceCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

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

  const handleAIInputSubmit = useCallback((input: string) => {
    setUserQuery(input);
    generateAIPlans(input);
    setStage('ai-plans');
  }, [generateAIPlans]);

  const handleSelectPractitioner = useCallback((practitioner: Practitioner) => {
    console.log('Selected practitioner:', practitioner);
    toast({
      title: "Practitioner selected",
      description: `You've selected ${practitioner.name}. In a complete app, this would take you to a booking page.`,
    });
  }, [toast]);

  const handleSelectPlan = useCallback((plan: AIHealthPlan) => {
    console.log('Selected plan:', plan);
    setSelectedPlan(plan);
    setStage('plan-details');
  }, []);

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
    setError(null);
  }, []);
  
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

  return (
    <div className="min-h-screen bg-health-blue-light dark:bg-gray-900">
      <Header />
      
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
              <AIAssistantInput 
                onSubmit={handleAIInputSubmit}
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
              <AIPlansDisplay 
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
      </main>
      
      <HelpButton />
      
      <NavigationControls 
        stage={stage}
        onBack={handleBack}
        onStartOver={resetToHome}
      />
    </div>
  );
};

export default Index;
