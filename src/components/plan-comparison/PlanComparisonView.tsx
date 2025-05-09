
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIHealthPlan } from '@/types';
import HealthPlanCard from '@/components/HealthPlanCard';
import PlanTimelineView from './PlanTimelineView';
import ServiceComparisonChart from './ServiceComparisonChart';
import { Progress } from '@/components/ui/progress';
import { 
  HelpCircle, 
  Info, 
  Check, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface PlanComparisonViewProps {
  plans: AIHealthPlan[];
  onSelectPlan: (plan: AIHealthPlan) => void;
  onBack: () => void;
}

const PlanComparisonView: React.FC<PlanComparisonViewProps> = ({
  plans,
  onSelectPlan,
  onBack
}) => {
  const [selectedView, setSelectedView] = useState<'cards' | 'comparison' | 'timeline'>('cards');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [compareCategories, setCompareCategories] = useState<string[]>([]);

  // Get all unique service categories across all plans
  const allCategories = Array.from(new Set(
    plans.flatMap(plan => plan.services.map(s => s.type))
  ));

  const toggleCategory = (category: string) => {
    setCompareCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Determine if a plan is the best value (lowest cost per service)
  const getBestValuePlan = () => {
    if (plans.length <= 1) return plans[0]?.id;
    
    return plans.reduce((best, current) => {
      const bestCostPerService = plans.find(p => p.id === best)!.totalCost / 
                               plans.find(p => p.id === best)!.services.length;
      const currentCostPerService = current.totalCost / current.services.length;
      
      return currentCostPerService < bestCostPerService ? current.id : best;
    }, plans[0].id);
  };

  // Determine if a plan is the most comprehensive (most services)
  const getMostComprehensivePlan = () => {
    if (plans.length <= 1) return plans[0]?.id;
    
    return plans.reduce((most, current) => {
      const mostServices = plans.find(p => p.id === most)!.services.length;
      const currentServices = current.services.length;
      
      return currentServices > mostServices ? current.id : most;
    }, plans[0].id);
  };

  const bestValuePlanId = getBestValuePlan();
  const mostComprehensivePlanId = getMostComprehensivePlan();

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
          aria-label="Go back"
        >
          ←
        </Button>
        <h2 className="text-2xl font-semibold">Compare Health Plans</h2>
      </div>

      <Tabs defaultValue="cards" className="mb-8" onValueChange={(value) => setSelectedView(value as any)}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="cards">Plan Cards</TabsTrigger>
          <TabsTrigger value="comparison">Compare Features</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        {/* Plan Cards View */}
        <TabsContent value="cards" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="relative">
                {plan.id === bestValuePlanId && (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                    Best Value
                  </div>
                )}
                {plan.id === mostComprehensivePlanId && (
                  <div className="absolute -top-3 -left-3 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                    Most Complete
                  </div>
                )}
                <HealthPlanCard 
                  plan={plan} 
                  onSelect={onSelectPlan}
                  featured={plan.id === bestValuePlanId} 
                />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Comparison View */}
        <TabsContent value="comparison" className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-medium mb-3">Select services to compare across plans:</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {allCategories.map((category) => (
                <Button
                  key={category}
                  variant={compareCategories.includes(category) ? "default" : "outline"}
                  onClick={() => toggleCategory(category)}
                  size="sm"
                  className="capitalize"
                >
                  {category.replace('-', ' ')}
                </Button>
              ))}
            </div>

            {/* Service Comparison Chart */}
            <ServiceComparisonChart 
              plans={plans} 
              categories={compareCategories.length > 0 ? compareCategories : allCategories}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-4">Detailed Plan Comparison</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Feature</th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Total Cost</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm">
                        R{plan.totalCost}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Timeframe</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm">
                        {plan.timeFrame}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Total Sessions</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm">
                        {plan.services.reduce((sum, s) => sum + s.sessions, 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Services Included</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {plan.services.map((s) => (
                            <Badge key={s.type} variant="outline" className="capitalize">
                              {s.type.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Cost per Session</td>
                    {plans.map((plan) => {
                      const avgCost = plan.totalCost / plan.services.reduce((sum, s) => sum + s.sessions, 0);
                      return (
                        <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm">
                          R{Math.round(avgCost)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Plan Type</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                        {plan.planType.replace('-', ' ')}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden">
                <CardHeader className={`
                  ${plan.planType === 'best-fit' ? 'bg-health-teal' : 
                    plan.planType === 'high-impact' ? 'bg-health-purple' : 'bg-health-orange'} 
                  text-white
                `}>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="text-white/80">
                    {plan.timeFrame} • R{plan.totalCost}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-3">Expected Outcomes Timeline</h4>
                  {plan.progressTimeline ? (
                    <PlanTimelineView timeline={plan.progressTimeline} totalWeeks={parseInt(plan.timeFrame)} />
                  ) : (
                    <p className="text-sm text-gray-500">No detailed timeline available for this plan.</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={() => onSelectPlan(plan)} className="w-full">
                    Select This Plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
        <h3 className="text-xl font-semibold mb-4">Why These Recommendations?</h3>
        
        <Accordion type="single" collapsible className="w-full">
          {plans.map((plan) => (
            <AccordionItem key={plan.id} value={plan.id}>
              <AccordionTrigger className="hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg">
                <span className="font-medium">{plan.name}</span>
              </AccordionTrigger>
              <AccordionContent className="p-4">
                {plan.rationales ? (
                  <div className="space-y-4">
                    {plan.rationales.map((rationale, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            rationale.evidenceLevel === 'high' ? 'bg-green-500' :
                            rationale.evidenceLevel === 'medium' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`}></div>
                          <h4 className="font-medium capitalize">{rationale.service.replace('-', ' ')}</h4>
                          <Badge variant="outline" className="ml-2">
                            {rationale.evidenceLevel === 'high' ? 'Strong Evidence' :
                             rationale.evidenceLevel === 'medium' ? 'Moderate Evidence' :
                             'Limited Evidence'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{rationale.rationale}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Info className="h-5 w-5 mr-2" />
                    <p>No detailed rationales available for this plan.</p>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium mb-3">Expected Outcomes</h5>
                  {plan.expectedOutcomes ? (
                    <div className="space-y-3">
                      {plan.expectedOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-start">
                          <div className="mt-0.5">
                            <Check className="h-4 w-4 text-health-teal mr-2" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{outcome.milestone} ({outcome.timeframe})</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{outcome.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No detailed outcomes available for this plan.</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="flex justify-center mt-8">
        <Button variant="outline" onClick={onBack} className="mr-4">
          Back to Input
        </Button>
      </div>
    </motion.div>
  );
};

export default PlanComparisonView;
