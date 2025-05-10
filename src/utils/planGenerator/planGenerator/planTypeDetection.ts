
import { PlanContext } from "@/utils/planGenerator/types";
import { ServiceCategory } from "@/utils/planGenerator/types";

/**
 * Determines the type of plan based on user context and needs
 */
export const determinePlanType = (context: PlanContext): 'best-fit' | 'high-impact' | 'progressive' => {
  const hasRacePrep = context.goal?.toLowerCase().includes('race') || 
                      context.goal?.toLowerCase().includes('run') ||
                      context.medicalConditions?.some(c => c.toLowerCase().includes('race preparation'));
                      
  if (hasRacePrep) {
    return 'progressive';
  }
  
  const hasRehabNeeds = context.medicalConditions?.some(c => 
    c.toLowerCase().includes('pain') || c.toLowerCase().includes('injury')
  );
  
  if (hasRehabNeeds) {
    return 'high-impact';
  }
  
  return 'best-fit';
};
