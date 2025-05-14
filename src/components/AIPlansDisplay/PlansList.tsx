
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AIHealthPlan } from '@/types';
import HealthPlanCard from '@/components/HealthPlanCard';

interface PlansListProps {
  plans: AIHealthPlan[];
  userInput: string;
  onSelectPlan: (plan: AIHealthPlan) => void;
  onBack: () => void;
}

const PlansList: React.FC<PlansListProps> = ({
  plans,
  userInput,
  onSelectPlan,
  onBack
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="flex items-center gap-2 mb-4"
      >
        <ArrowLeft size={16} />
        Back
      </Button>
      
      <h1 className="text-2xl font-bold mb-6">Your Personalized Health Plans</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {plans.map((plan, index) => (
          <HealthPlanCard 
            key={plan.id || index}
            plan={plan}
            userQuery={userInput}
            onSelect={() => onSelectPlan(plan)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlansList;
