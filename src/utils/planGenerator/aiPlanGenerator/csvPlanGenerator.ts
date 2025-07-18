
import { AIHealthPlan } from '@/types';
import { generateOptimizedTreatmentPlan, getAvailablePainCategories } from '../optimizers/csvBasedOptimizer';
import { analyzeUserQuery } from './userAnalysis';

/**
 * Generate AI health plans using CSV-based linear programming optimization
 */
export async function generateCSVBasedAIHealthPlans(userInput: string): Promise<AIHealthPlan[]> {
    console.log("Generating CSV-based AI health plans:", userInput);
    
    try {
        // Analyze user input to extract information
        const analysis = analyzeUserQuery(userInput);
        console.log("User analysis:", analysis);
        
        // Get available pain categories from CSV data
        const availablePainCategories = await getAvailablePainCategories();
        console.log("Available pain categories:", availablePainCategories);
        
        // Determine pain category from user input
        let painCategory = 'Back pain'; // Default
        const inputLower = userInput.toLowerCase();
        
        for (const category of availablePainCategories) {
            const categoryLower = category.toLowerCase();
            if (inputLower.includes(categoryLower) || 
                inputLower.includes(categoryLower.split(' ')[0])) {
                painCategory = category;
                break;
            }
        }
        
        // Use detected budget or default
        const budget = analysis.budget?.monthly || 1200;
        
        console.log(`Using pain category: ${painCategory}, budget: R${budget}`);
        
        // Generate optimized plan
        const optimizedPlan = await generateOptimizedTreatmentPlan(budget, painCategory, userInput);
        console.log("Generated optimized plan:", optimizedPlan);
        
        return [optimizedPlan];
        
    } catch (error) {
        console.error("Error in CSV-based AI plan generation:", error);
        throw error;
    }
}
