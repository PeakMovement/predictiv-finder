
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AIHealthPlan } from '@/types';

export interface HealthPlanCardProps {
  plan: AIHealthPlan;
  userQuery: string;
  onSelectPlan: () => void;
}

const HealthPlanCard: React.FC<HealthPlanCardProps> = ({ 
  plan,
  userQuery,
  onSelectPlan
}) => {
  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-lg">
      <CardContent className="p-5 flex-grow">
        <h3 className="text-xl font-bold mb-2">{plan.title}</h3>
        
        <div className="mb-4 flex gap-2 flex-wrap">
          {plan.tags && plan.tags.slice(0, 3).map((tag, i) => (
            <Badge key={i} variant="secondary" className="bg-health-blue-light text-health-blue">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Description:</p>
            <p className="line-clamp-2">{plan.description}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Timeline:</p>
            <p className="font-medium">{plan.timeframe}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Cost:</p>
            <p className="font-medium">${plan.totalCost}/month</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 pb-5 px-5">
        <Button 
          onClick={onSelectPlan} 
          className="w-full bg-health-purple hover:bg-health-purple-dark"
        >
          View Plan Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HealthPlanCard;
