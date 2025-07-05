
import React from 'react';
import { generateAIHealthPlans } from '@/utils/planGenerator/aiPlanGenerator';
import { HealthPlansService } from '@/services/health-plans-service';
import { AIHealthPlan, UserCriteria } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useEnhancedAIPlansService = () => {
  const { toast } = useToast();

  const generateAndSavePlans = async (userInput: string): Promise<AIHealthPlan[]> => {
    try {
      // Generate plans using the AI plan generator with user input string
      const generatedPlans = await generateAIHealthPlans(userInput);
      
      // Save each plan to the database
      const savedPlans = await Promise.all(
        generatedPlans.map(async (plan) => {
          try {
            const savedPlan = await HealthPlansService.saveHealthPlan(plan);
            return {
              ...plan,
              id: savedPlan.id
            };
          } catch (error) {
            console.error('Failed to save plan:', error);
            return plan; // Return original plan if save fails
          }
        })
      );

      toast({
        title: "Plans generated and saved",
        description: `${savedPlans.length} health plans have been created and saved to your account.`,
      });

      return savedPlans;
    } catch (error: any) {
      toast({
        title: "Plan generation failed",
        description: error.message || "Failed to generate health plans",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getUserPlans = async (): Promise<AIHealthPlan[]> => {
    try {
      const plans = await HealthPlansService.getUserHealthPlans();
      
      // Convert database plans back to AIHealthPlan format
      return plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        planType: plan.plan_type as 'best-fit' | 'high-impact' | 'progressive',
        totalCost: Number(plan.total_cost) || 0,
        timeFrame: plan.time_frame || '',
        services: plan.services as any || [],
      }));
    } catch (error: any) {
      toast({
        title: "Failed to load plans",
        description: error.message || "Could not retrieve your health plans",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    generateAndSavePlans,
    getUserPlans
  };
};
