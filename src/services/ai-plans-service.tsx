
import { generateCustomAIPlans } from '@/utils/aiPlanGenerator';
import { ServiceCategory } from '@/utils/planGenerator/types';

// Replace Next.js specific code with browser-compatible equivalents
export async function generatePlan(userInput: string) {
  try {
    // Log the incoming user query for debugging
    console.log("Processing user query:", userInput);

    // Call the AI plan generator with the user input
    const result = await generateCustomAIPlans(userInput);

    // Log the generated plans for debugging
    console.log("Generated AI plans:", result);

    // Return the generated plan
    return result;
  } catch (error: any) {
    // Log the error for debugging
    console.error("Error generating AI plans:", error);

    // Construct an error message based on the error type
    let errorMessage = 'Failed to generate AI health plans. Please try again.';

    // Return an error
    throw new Error(errorMessage);
  }
}
