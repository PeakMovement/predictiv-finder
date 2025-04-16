
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AIHealthPlan } from '@/types';
import HealthPlanCard from './HealthPlanCard';

interface AIPlansDisplayProps {
  plans: AIHealthPlan[];
  userQuery: string;
  onSelectPlan: (plan: AIHealthPlan) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const AIPlansDisplay = ({
  plans,
  userQuery,
  onSelectPlan,
  onBack,
  isLoading = false
}: AIPlansDisplayProps) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            className="mr-2"
          >
            ←
          </Button>
          <h2 className="text-2xl font-semibold">Analyzing Your Health Needs</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="inline-block animate-pulse-soft mb-6">
            <span className="text-5xl">🧠</span>
          </div>
          <h3 className="text-xl font-medium mb-2">Our AI is creating your custom health plans</h3>
          <p className="text-gray-600 dark:text-gray-300">This might take a few moments...</p>
          
          <div className="mt-8 flex justify-center">
            <div className="bg-gray-200 dark:bg-gray-700 w-64 h-2 rounded-full overflow-hidden">
              <div className="bg-health-purple h-full w-2/3 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract key focus areas from the plans for display
  const focusAreas = Array.from(new Set(
    plans.flatMap(plan => plan.services.map(service => 
      service.type.replace('-', ' ')
    ))
  ));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          className="mr-2"
        >
          ←
        </Button>
        <h2 className="text-2xl font-semibold">Your Custom AI Health Plans</h2>
      </div>
      
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6">
        <h3 className="font-medium mb-2">Based on your request:</h3>
        <p className="text-gray-700 dark:text-gray-300 italic">"{userQuery}"</p>
        
        {focusAreas.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-health-purple font-medium">Primary focus areas: {focusAreas.join(', ')}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <HealthPlanCard 
            key={plan.id} 
            plan={plan} 
            onSelect={onSelectPlan}
            featured={plan.planType === 'best-fit'}
          />
        ))}
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Each plan is customized to your specific needs and budget constraints.</p>
        <p>Select a plan to view details and book with professionals.</p>
      </div>
    </motion.div>
  );
};

export default AIPlansDisplay;
