
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
    <Card className="h-full flex flex-col transition-all hover:predictiv-card-shadow">
      <CardContent className="p-6 flex-grow">
        <h3 className="text-xl font-bold mb-2 text-foreground">{plan.name}</h3>
        
        {plan.planType && (
          <div className="mb-4 flex gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {plan.planType}
            </Badge>
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Description:</p>
            <p className="line-clamp-2 text-foreground">{plan.description}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Timeline:</p>
            <p className="font-medium text-foreground">{plan.timeFrame}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Estimated Cost:</p>
            <p className="font-medium text-foreground">R{plan.totalCost}/month</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-border pt-4 pb-5 px-6">
        <Button 
          onClick={onSelect} 
          className="w-full"
        >
          View Plan Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HealthPlanCard;
