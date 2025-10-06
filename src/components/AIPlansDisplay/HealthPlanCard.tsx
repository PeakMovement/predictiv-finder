
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AIHealthPlan } from '@/types';

export interface HealthPlanCardProps {
  plan: AIHealthPlan;
  userQuery: string;
  onSelect: () => void;
}

const HealthPlanCard: React.FC<HealthPlanCardProps> = ({ 
  plan,
  userQuery,
  onSelect
}) => {
  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-lg">
      <CardContent className="p-5 flex-grow">
        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
        
        {plan.planType && (
          <div className="mb-4 flex gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-health-blue-light text-health-blue">
              {plan.planType}
            </Badge>
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Description:</p>
            <p className="line-clamp-2">{plan.description}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Timeline:</p>
            <p className="font-medium">{plan.timeFrame}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Cost:</p>
            <p className="font-medium">R{plan.totalCost}/month</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 pb-5 px-5">
        <Button 
          onClick={onSelect} 
          className="w-full bg-health-purple hover:bg-health-purple-dark"
        >
          View Plan Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HealthPlanCard;
