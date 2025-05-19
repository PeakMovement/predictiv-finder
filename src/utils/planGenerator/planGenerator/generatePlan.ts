
import { PlanContext, ServiceAllocation, ServiceAllocationItem, ServiceCategory } from "../types";
import { AIHealthPlan } from "@/types";
import { determineRequiredServices } from './serviceAllocation';
import { allocateServices } from './serviceAllocation';
import { calculateTotalCost } from './costCalculation';
import { generatePlanName } from './planNaming';
import { generatePlanDescription } from './planNaming';
import { determinePlanType } from './planTypeDetection';
import { determineTimeFrame } from './timeFrameDetection';

// Import BASELINE_COSTS from types.ts to use in service price calculation
import { BASELINE_COSTS } from "../types";

// Extend ServiceAllocation interface for the generatePlan function
interface EnhancedServiceAllocation extends ServiceAllocation {
  percentage?: number;
  description?: string;
  frequency?: string;
}

// Export the generatePlan function
export const generatePlan = (context: PlanContext): AIHealthPlan => {
  try {
    const config = context.budgetTier ? 
      { allocations: [] as ServiceAllocationItem[], requiresDoctor: false, preferHighEnd: false } : 
      { allocations: [] as ServiceAllocationItem[], requiresDoctor: false, preferHighEnd: false };
    
    const services = determineRequiredServices(context, config.allocations);
    const allocatedServices = allocateServices(services, context) as EnhancedServiceAllocation[];
    
    // Convert ServiceAllocation[] to the format expected by AIHealthPlan
    const formattedServices = allocatedServices.map(service => ({
      type: service.type,
      price: BASELINE_COSTS[service.type] || 500,
      sessions: service.sessions || 1,
      description: service.description || `${service.sessions || 1} sessions with ${service.type.replace(/-/g, ' ')}`,
      frequency: service.frequency
    }));
    
    // Check if plan exceeds budget and add a note if so
    const totalCost = calculateTotalCost(allocatedServices as any);
    let planDescription = generatePlanDescription(context);
    
    if (context.budget && totalCost > context.budget) {
      planDescription += " Note: This plan has been optimized to provide the most value within your budget constraints.";
    }
    
    return {
      id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: generatePlanName(context),
      description: planDescription,
      services: formattedServices,
      totalCost: totalCost,
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
