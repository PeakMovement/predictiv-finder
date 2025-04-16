import { useState } from "react";
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
import { PRACTITIONERS } from "@/data/mockData";
import { generateCustomAIPlans, findAlternativeCategories } from "@/utils/aiPlanGenerator";
import { useToast } from "@/hooks/use-toast";
import PlanDetailsView from "@/components/PlanDetailsView";

type AppStage = 
  | 'home'
  | 'category-selector' 
  | 'category-questionnaire' 
  | 'practitioner-list'
  | 'ai-input'
  | 'ai-plans'
  | 'plan-details';

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
  const { toast } = useToast();

  const getMatchingPractitioners = (criteria: DetailedUserCriteria): Practitioner[] => {
    return PRACTITIONERS.filter(p => {
      if (criteria.categories && !criteria.categories.includes(p.serviceType)) {
        return false;
      }
      if (criteria.budget && criteria.budget.monthly && p.pricePerSession > criteria.budget.monthly) {
        return false;
      }
      if (criteria.location && !p.location.toLowerCase().includes(criteria.location.toLowerCase())) {
        return false;
      }
      if (criteria.mode?.includes('online') && !p.isOnline) {
        return false;
      }
      if (criteria.mode?.includes('in-person') && p.isOnline) {
        return false;
      }
      return true;
    });
  };

  const generateAIPlans = async (query: string) => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
    
    const customPlans = generateCustomAIPlans(query);
    setAiPlans(customPlans);
    
    setIsGenerating(false);
  };

  const handleCategoryToggle = (category: ServiceCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCategorySubmit = (categories: ServiceCategory[]) => {
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
  };

  const handleQuestionnaireSubmit = (criteria: DetailedUserCriteria) => {
    setUserCriteria(criteria);
    setStage('practitioner-list');
  };

  const handleAIInputSubmit = (input: string) => {
    setUserQuery(input);
    generateAIPlans(input);
    setStage('ai-plans');
  };

  const handleSelectPractitioner = (practitioner: Practitioner) => {
    console.log('Selected practitioner:', practitioner);
    alert(`You've selected ${practitioner.name}. In a complete app, this would take you to a booking page.`);
  };

  const handleSelectPlan = (plan: AIHealthPlan) => {
    console.log('Selected plan:', plan);
    setSelectedPlan(plan);
    setStage('plan-details');
  };

  const resetToHome = () => {
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
  };

  return (
    <div className="min-h-screen bg-health-blue-light dark:bg-gray-900">
      <Header />
      
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {stage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Your Path to Wellness,&nbsp;
                <span className="bg-gradient-to-r from-health-teal to-health-purple bg-clip-text text-transparent">
                  Personalized
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Let's build your complete health, fitness, and wellness journey — tailored to your goals and budget.
              </motion.p>
              
              <motion.div 
                className="flex flex-col md:flex-row gap-4 justify-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  onClick={() => setStage('category-selector')}
                  className="text-lg py-6 px-8 bg-health-teal hover:bg-health-teal-dark flex items-center"
                  size="lg"
                >
                  <span className="emoji-icon">🔍</span>
                  I Know What I Need
                </Button>
                <Button 
                  onClick={() => setStage('ai-input')}
                  className="text-lg py-6 px-8 bg-health-purple hover:bg-health-purple-dark flex items-center"
                  size="lg"
                >
                  <span className="emoji-icon">🧠</span>
                  Explain My Goal
                </Button>
              </motion.div>
              
              <motion.div 
                className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                  <div className="w-16 h-16 mx-auto bg-health-teal/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Expert Matching</h3>
                  <p className="text-gray-600 dark:text-gray-300">Connect with qualified professionals that match your exact needs.</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                  <div className="w-16 h-16 mx-auto bg-health-purple/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Budget Friendly</h3>
                  <p className="text-gray-600 dark:text-gray-300">Find services that fit your financial plan without compromising quality.</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                  <div className="w-16 h-16 mx-auto bg-health-orange/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI Planning</h3>
                  <p className="text-gray-600 dark:text-gray-300">Get personalized health plans based on your unique situation.</p>
                </div>
              </motion.div>
            </motion.div>
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
      
      <div className="fixed bottom-4 right-4 flex gap-2">
        <Button 
          variant="outline"
          onClick={resetToHome}
          className="bg-white/90 dark:bg-gray-800/90"
        >
          Start Over
        </Button>
        {stage !== 'home' && (
          <Button 
            variant="outline"
            onClick={() => {
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
            }}
            className="bg-white/90 dark:bg-gray-800/90"
          >
            Go Back
          </Button>
        )}
      </div>
    </div>
  );
};

export default Index;
