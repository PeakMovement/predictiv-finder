import { generateCustomAIPlans, generatePlan } from '@/utils/aiPlanGenerator';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30; // This function can run for a maximum of 30 seconds
export const dynamic = 'force-dynamic'; // Ensure the function is always dynamically executed

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const userInput = requestBody.userQuery;

    if (!userInput) {
      return NextResponse.json({ error: 'User query is required' }, { status: 400 });
    }

    // Log the incoming user query for debugging
    console.log("Received user query:", userInput);

    // Call the AI plan generator with the user input
    const result = await generatePlan(userInput);

    // Log the generated plans for debugging
    console.log("Generated AI plans:", result);

    // Return the generated plans as a JSON response
    return NextResponse.json({ plans: [result] }, { status: 200 });

  } catch (error: any) {
    // Log the error for server-side debugging
    console.error("Error generating AI plans:", error);

    // Construct an error message based on the error type
    let errorMessage = 'Failed to generate AI health plans. Please try again.';

    // Return an error response
    return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
  }
}
