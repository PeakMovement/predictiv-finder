
import { AIHealthPlan } from '@/types';
import { toast } from '@/hooks/use-toast';

interface HealthExtractionResult {
  symptoms: string[];
  severity: string | null;
  goals: string[];
  suggestedCategories?: string[];
  budget?: number;
  timeframe?: string;
  location?: string;
}

export async function extractHealthDataWithOpenAI(
  userInput: string, 
  apiKey?: string
): Promise<HealthExtractionResult | null> {
  if (!apiKey) {
    console.warn("OpenAI API key is missing. Using fallback extraction method.");
    return null;
  }

  const prompt = `
You are a health assistant AI. Extract the following from the user's description:

1. Symptoms (list them)
2. Severity level (choose from mild, moderate, severe, unknown)
3. Health goals (list them)
4. Suggested healthcare categories (e.g., physiotherapist, biokineticist, dietician, etc.)
5. Budget information (if mentioned, extract the number)
6. Timeframe (if mentioned)
7. Location (if mentioned)

User input:
"""${userInput}"""

Provide the response as a JSON object with keys: symptoms, severity, goals, suggestedCategories, budget, timeframe, location.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        prompt,
        max_tokens: 500,
        temperature: 0,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      toast({
        title: "API Error",
        description: "Failed to extract health data. Using fallback method.",
        variant: "destructive",
      });
      return null;
    }

    const data = await response.json();
    const jsonText = data.choices[0].text?.trim();
    
    if (!jsonText) {
      throw new Error("No response text from OpenAI");
    }

    // Parse the JSON output from GPT
    const extractedData = JSON.parse(jsonText);
    
    return {
      symptoms: extractedData.symptoms || [],
      severity: extractedData.severity || null,
      goals: extractedData.goals || [],
      suggestedCategories: extractedData.suggestedCategories || [],
      budget: extractedData.budget || undefined,
      timeframe: extractedData.timeframe || undefined,
      location: extractedData.location || undefined
    };
  } catch (error) {
    console.error("Failed to extract health data with OpenAI:", error);
    toast({
      title: "Extraction Error",
      description: "Failed to parse health information. Using fallback method.",
      variant: "destructive",
    });
    return null;
  }
}
