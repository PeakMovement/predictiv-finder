import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AIHealthPlan, ServiceCategory } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Minus, Plus, HelpCircle } from 'lucide-react';

interface PlanCustomizerProps {
  plan: AIHealthPlan;
  onUpdatePlan: (updatedPlan: AIHealthPlan) => void;
  onSave: (customizedPlan: AIHealthPlan) => void;
  onCancel: () => void;
}

const PlanCustomizer: React.FC<PlanCustomizerProps> = ({
  plan,
  onUpdatePlan,
  onSave,
  onCancel
}) => {
  const [customizedPlan, setCustomizedPlan] = useState<AIHealthPlan>({
    ...plan,
    id: `${plan.id}-customized`,
    name: `${plan.name} (Customized)`
  });
  const { toast } = useToast();
  const [validationMessages, setValidationMessages] = useState<{[key: string]: string}>({});

  // Calculate budget limits
  const maxBudget = Math.round(plan.totalCost * 1.5);
  const minBudget = Math.round(plan.totalCost * 0.6);
  
  // Handle session count changes
  const handleSessionChange = (serviceType: string, change: number) => {
    const updatedServices = customizedPlan.services.map(service => {
      if (service.type === serviceType) {
        const newCount = Math.max(1, service.sessions + change);
        return {
          ...service,
          sessions: newCount
        };
      }
      return service;
    });
    
    const newTotalCost = updatedServices.reduce(
      (sum, s) => sum + (s.price * s.sessions), 0
    );
    
    // Validate the new configuration
    const validationResult = validatePlanChanges(updatedServices, newTotalCost);
    setValidationMessages(validationResult.messages);
    
    // Update the plan
    setCustomizedPlan({
      ...customizedPlan,
      services: updatedServices,
      totalCost: newTotalCost
    });
  };

  // Validate plan changes
  const validatePlanChanges = (
    services: AIHealthPlan['services'],
    totalCost: number
  ) => {
    const messages: {[key: string]: string} = {};
    let isValid = true;
    
    // Check if budget exceeds maximum
    if (totalCost > maxBudget) {
      messages.budget = `Total cost exceeds recommended maximum of R${maxBudget}`;
      isValid = false;
    }
    
    // Check minimum requirements for each service type
    const physiotherapistServices = services.filter(s => s.type === 'physiotherapist');
    if (physiotherapistServices.length > 0 && physiotherapistServices[0].sessions < 2) {
      messages.physiotherapist = 'Minimum 2 sessions recommended for effective treatment';
    }
    
    return { isValid, messages };
  };

  // Handle saving the customized plan
  const handleSavePlan = () => {
    const validationResult = validatePlanChanges(
      customizedPlan.services,
      customizedPlan.totalCost
    );
    
    if (Object.keys(validationResult.messages).length > 0) {
      // Show warning but allow save
      toast({
        title: "Plan saved with recommendations",
        description: "Your plan has been saved, but contains some non-optimal configurations.",
        variant: "default",
      });
    } else {
      toast({
        title: "Plan successfully customized",
        description: "Your personalized plan has been saved.",
        variant: "default",
      });
    }
    
    onSave(customizedPlan);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel} 
            className="mr-2"
          >
            ←
          </Button>
          <h2 className="text-2xl font-semibold">Customize Your Plan</h2>
        </div>
        
        <div className="text-xl font-bold text-health-purple">
          R{customizedPlan.totalCost}
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{customizedPlan.name}</CardTitle>
          <CardDescription>{customizedPlan.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Budget Range</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm">R{minBudget}</span>
                <Slider 
                  defaultValue={[customizedPlan.totalCost]} 
                  min={minBudget} 
                  max={maxBudget}
                  step={100}
                  disabled
                  className="flex-1"
                />
                <span className="text-sm">R{maxBudget}</span>
              </div>
              {validationMessages.budget && (
                <p className="text-red-500 text-xs mt-1">{validationMessages.budget}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <h3 className="text-lg font-medium mb-4">Adjust Services</h3>
      
      <div className="space-y-4 mb-8">
        {customizedPlan.services.map((service) => (
          <Card key={service.type} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base capitalize">
                  {service.type.replace('-', ' ')}
                </CardTitle>
                <Badge variant="outline">
                  R{service.price} per session
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {service.description}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleSessionChange(service.type, -1)}
                    disabled={service.sessions <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 font-medium">{service.sessions} sessions</span>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleSessionChange(service.type, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="font-medium">
                  R{service.price * service.sessions}
                </span>
              </div>
              
              {validationMessages[service.type] && (
                <div className="flex items-center mt-2 text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <p className="text-xs">{validationMessages[service.type]}</p>
                </div>
              )}
              
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <Switch id={`online-${service.type}`} />
                  <Label htmlFor={`online-${service.type}`}>Online sessions available</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex items-center justify-center space-x-2 mb-6">
        <HelpCircle className="h-4 w-4 text-gray-400" />
        <p className="text-sm text-gray-500">
          Adjust the number of sessions for each service to customize your plan
        </p>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSavePlan}
          className="bg-health-purple hover:bg-health-purple-dark"
        >
          Save Customized Plan
        </Button>
      </div>
    </motion.div>
  );
};

export default PlanCustomizer;
