
import { PlanContext, ServiceAllocationItem, ServiceAllocation, ServiceCategory } from "@/utils/planGenerator/types";
import { AIHealthPlan } from "@/types";
import { determineRequiredServices } from './serviceAllocation';
import { allocateServices } from './serviceAllocation';
import { calculateTotalCost } from './costCalculation';
import { generatePlanName } from './planNaming';
import { generatePlanDescription } from './planNaming';
import { determinePlanType } from './planTypeDetection';
import { determineTimeFrame } from './timeFrameDetection';

// Export the generatePlan function
export const generatePlan = (context: PlanContext): AIHealthPlan => {
  try {
    const config = context.budgetTier ? 
      { allocations: [], requiresDoctor: false, preferHighEnd: false } : 
      { allocations: [], requiresDoctor: false, preferHighEnd: false };
    
    const services = determineRequiredServices(context, config.allocations);
    
    return {
      id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: generatePlanName(context),
      description: generatePlanDescription(context),
      services: allocateServices(services, context),
      totalCost: calculateTotalCost(allocateServices(services, context)),
      planType: determinePlanType(context),
      timeFrame: determineTimeFrame(context)
    };
  } catch (error) {
    console.error("Error generating plan:", error);
    // Return a minimal fallback plan
    return {
      id: `fallback-${Date.now()}`,
      name: "Basic Health Plan",
      description: "A simple health plan covering essential services.",
      services: [{
        type: 'general-practitioner',
        price: 400,
        sessions: 2,
        description: "Standard medical consultations"
      }],
      totalCost: 800,
      planType: 'best-fit',
      timeFrame: '4 weeks'
    };
  }
};
