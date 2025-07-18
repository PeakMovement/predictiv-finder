
import { AIHealthPlan } from '@/types';
import { generateOptimizedTreatmentPlan, getAvailablePainCategories } from '../optimizers/csvBasedOptimizer';

/**
 * Generate AI health plans using your CSV-based linear programming optimization
 */
export async function generateCSVBasedAIHealthPlans(userInput: string): Promise<AIHealthPlan[]> {
    console.log("Generating CSV-based AI health plans:", userInput);
    
    try {
        // Get available pain categories from CSV data
        const availablePainCategories = await getAvailablePainCategories();
        console.log("Available pain categories:", availablePainCategories);
        
        // Determine pain category from user input
        let painCategory = 'Back pain'; // Default
        const inputLower = userInput.toLowerCase();
        
        // Check for specific pain categories in user input
        for (const category of availablePainCategories) {
            const categoryWords = category.toLowerCase().split(' ');
            if (categoryWords.some(word => inputLower.includes(word))) {
                painCategory = category;
                break;
            }
        }
        
        // If no specific pain category found, try to map general health concerns
        if (painCategory === 'Back pain') {
            if (inputLower.includes('joint') || inputLower.includes('knee') || inputLower.includes('shoulder')) {
                painCategory = 'Joint injuries';
            } else if (inputLower.includes('neck')) {
                painCategory = 'Neck pain';
            } else if (inputLower.includes('sport') || inputLower.includes('exercise')) {
                painCategory = 'Sports rehab';
            } else if (inputLower.includes('work') || inputLower.includes('office')) {
                painCategory = 'Workplace-related injuries';
            } else if (inputLower.includes('chronic') || inputLower.includes('long-term')) {
                painCategory = 'Chronic pain';
            } else if (inputLower.includes('surgery') || inputLower.includes('operation')) {
                painCategory = 'Post-surgical recovery';
            }
        }
        
        // Extract budget from user input or use default
        let budget = 1200; // Default budget
        const budgetMatch = userInput.match(/\b(\d+)\b/);
        if (budgetMatch) {
            budget = parseInt(budgetMatch[1]);
        }
        
        console.log(`Using pain category: ${painCategory}, budget: R${budget}`);
        
        // Generate optimized plan using your CSV-based algorithm
        const optimizedPlan = await generateOptimizedTreatmentPlan(budget, painCategory, userInput);
        console.log("Generated optimized plan:", optimizedPlan);
        
        return [optimizedPlan];
        
    } catch (error) {
        console.error("Error in CSV-based AI plan generation:", error);
        throw error;
    }
}
