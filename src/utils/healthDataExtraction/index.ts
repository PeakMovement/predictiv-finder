
import { extractHealthDataWithOpenAI } from './openAIExtractor';
import { extractHealthDataWithLocalModel, LocalHealthExtractionResult } from './localModelExtractor';

export interface HealthDataExtractionOptions {
  useOpenAI?: boolean;
  apiKey?: string;
  fallbackToLocal?: boolean;
}

export interface HealthDataExtractionResult {
  symptoms: string[];
  severity: string | null;
  goals: string[];
  suggestedCategories: string[];
  budget?: number;
  timeframe?: string;
  location?: string;
  source: 'openai' | 'local-model' | 'hybrid';
}

/**
 * Unified health data extraction function that can use either OpenAI or a local model
 * @param userInput - The user's description of their health concerns
 * @param options - Configuration options
 * @returns The extracted health data with source information
 */
export async function extractHealthData(
  userInput: string,
  options: HealthDataExtractionOptions = {}
): Promise<HealthDataExtractionResult> {
  const {
    useOpenAI = true,
    apiKey,
    fallbackToLocal = true
  } = options;
  
  let result: HealthDataExtractionResult | null = null;
  let source: 'openai' | 'local-model' | 'hybrid' = 'local-model';
  
  // Try OpenAI first if enabled and API key is available
  if (useOpenAI && apiKey) {
    try {
      const openAIResult = await extractHealthDataWithOpenAI(userInput, apiKey);
      
      if (openAIResult) {
        result = {
          ...openAIResult,
          suggestedCategories: openAIResult.suggestedCategories || [],
          source: 'openai'
        };
        source = 'openai';
        console.log("Successfully extracted health data using OpenAI");
      }
    } catch (error) {
      console.error("Error extracting data with OpenAI:", error);
    }
  }
  
  // Use local model if OpenAI failed or wasn't used
  if (!result && (fallbackToLocal || !useOpenAI)) {
    try {
      const localResult = extractHealthDataWithLocalModel(userInput);
      
      if (result) {
        // Merge OpenAI result with local model for better coverage
        result = {
          symptoms: [...new Set([...result.symptoms, ...localResult.symptoms])],
          severity: result.severity || localResult.severity,
          goals: [...new Set([...result.goals, ...localResult.goals])],
          suggestedCategories: [...new Set([...result.suggestedCategories, ...localResult.suggestedCategories])],
          budget: result.budget || localResult.budget,
          timeframe: result.timeframe || localResult.timeframe,
          location: result.location || localResult.location,
          source: 'hybrid'
        };
        source = 'hybrid';
      } else {
        // Use local result only
        result = {
          ...localResult,
          source: 'local-model'
        };
        source = 'local-model';
      }
      console.log("Used local model for health data extraction");
    } catch (error) {
      console.error("Error extracting data with local model:", error);
    }
  }
  
  // Handle case where both approaches failed
  if (!result) {
    console.error("All extraction methods failed, returning empty result");
    return {
      symptoms: [],
      severity: null,
      goals: [],
      suggestedCategories: [],
      source
    };
  }
  
  return result;
}

// Re-export types and individual extractors for direct usage if needed
export type { LocalHealthExtractionResult };
export { extractHealthDataWithOpenAI, extractHealthDataWithLocalModel };
