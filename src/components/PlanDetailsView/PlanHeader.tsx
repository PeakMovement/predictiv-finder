
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AIHealthPlan } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface PlanHeaderProps {
  plan: AIHealthPlan;
  userQuery: string;
}

export const PlanHeader: React.FC<PlanHeaderProps> = ({ plan, userQuery }) => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
      <div className="flex justify-between items-start flex-wrap">
        <div>
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{plan.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {plan.services.map((service, idx) => (
              <Badge key={idx} variant="outline" className="capitalize">
                {service.type.replace('-', ' ')}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="bg-health-teal/10 p-4 rounded-lg">
          <p className="text-sm font-medium">Total Investment</p>
          <p className="text-2xl font-bold text-health-teal">R{plan.totalCost}</p>
          <p className="text-xs text-gray-500">Over {plan.timeFrame}</p>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium mb-2">Expected Outcomes</h4>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          Based on your goals: "{userQuery}"
        </p>
        
        {plan.expectedOutcomes ? (
          <div className="space-y-3">
            {plan.expectedOutcomes.slice(0, 3).map((outcome, idx) => (
              <div key={idx} className="flex items-start">
                <div className="w-4 h-4 rounded-full bg-health-teal mr-2 mt-1"></div>
                <div>
                  <p className="font-medium">{outcome.milestone} ({outcome.timeframe})</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{outcome.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 rounded-full bg-health-purple mr-2"></div>
              <p>Your wellness journey starts today</p>
            </div>
            
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-health-teal mr-2"></div>
              <p>
                {plan.planType === 'high-impact' 
                  ? 'Accelerated results expected by ' 
                  : plan.planType === 'progressive' 
                    ? 'Sustainable progress building toward ' 
                    : 'Projected outcomes by '}
                <span className="font-bold">2 months from now</span>
              </p>
            </div>
          </>
        )}
        
        {plan.rationales && plan.rationales.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="rationales">
                <AccordionTrigger className="text-sm font-medium">
                  Why We Recommend This Plan
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {plan.rationales.map((rationale, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          rationale.evidenceLevel === 'high' ? 'bg-green-500' :
                          rationale.evidenceLevel === 'medium' ? 'bg-amber-500' :
                          'bg-gray-400'
                        }`} />
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {rationale.service.replace('-', ' ')}
                            <span className="text-xs font-normal ml-2 text-gray-500">
                              ({rationale.evidenceLevel} evidence)
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{rationale.rationale}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
};
