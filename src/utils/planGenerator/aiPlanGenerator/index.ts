
import { AIHealthPlan } from '@/types';
import { generateCSVBasedAIHealthPlans } from './csvPlanGenerator';

/**
 * Generate AI health plans using only CSV-based optimization
 */
export async function generateAIHealthPlans(userInput: string): Promise<AIHealthPlan[]> {
    console.log("Generating AI health plans with CSV-based optimization:", userInput);
    
    try {
        return await generateCSVBasedAIHealthPlans(userInput);
    } catch (error) {
        console.error("Error in CSV-based AI plan generation:", error);
        throw error;
    }
}

/**
 * Generate a single AI plan (backward compatibility)
 */
export async function generateAIPlan(userInput: string): Promise<AIHealthPlan> {
    const plans = await generateAIHealthPlans(userInput);
    return plans[0];
}

// Re-export analysis functions for backward compatibility
export { analyzeUserQuery, estimateComplexityLevel } from './userAnalysis';
