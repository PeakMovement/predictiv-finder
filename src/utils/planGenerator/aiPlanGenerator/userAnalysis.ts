
import { AnalyzedInput } from "../enhancedTypes";
import { ServiceCategory } from "../types";

/**
 * Analyzes user input to extract relevant information for plan generation
 * @param userInput The raw user input to analyze
 * @returns Structured analysis of the user input
 */
export function analyzeUserInput(userInput: string): AnalyzedInput {
  // This is a simplified version that creates a structure matching the AnalyzedInput type
  // In a real implementation, this would use NLP techniques to extract information
  
  // Create a default analyzed structure with required fields
  const analysis: AnalyzedInput = {
    medicalConditions: [],
    suggestedCategories: [],
    severity: {},
    preferences: {}, // Now properly defined in the type
    timeAvailability: 5, // Default hours per week
    servicePriorities: {},
    primaryIssue: "",
    hasEnoughInformation: true,
    locationInfo: {
      location: "",
      isRemote: false
    },
    specificGoals: []
  };
  
  // Basic detection of conditions from user input
  if (userInput.toLowerCase().includes("knee") || 
      userInput.toLowerCase().includes("joint")) {
    analysis.medicalConditions.push("knee pain");
    analysis.suggestedCategories.push("physiotherapist");
    analysis.severity["knee pain"] = 0.7;
  }
  
  if (userInput.toLowerCase().includes("diet") || 
      userInput.toLowerCase().includes("nutrition") || 
      userInput.toLowerCase().includes("weight")) {
    analysis.medicalConditions.push("dietary needs");
    analysis.suggestedCategories.push("dietician");
    analysis.severity["dietary needs"] = 0.6;
  }
  
  if (userInput.toLowerCase().includes("run") || 
      userInput.toLowerCase().includes("running")) {
    analysis.suggestedCategories.push("run-coaches");
  }

  if (userInput.toLowerCase().includes("strength") || 
      userInput.toLowerCase().includes("muscle")) {
    analysis.suggestedCategories.push("strength-coaches");
  }
  
  // Extract location if mentioned
  const locationRegex = /\b(?:in|at|near|from)\s+([A-Za-z\s]+(?:town|city|berg|burg|ville|ton))\b/i;
  const locationMatch = userInput.match(locationRegex);
  if (locationMatch && locationMatch[1]) {
    analysis.locationInfo.location = locationMatch[1].trim();
  }
  
  // Detect if user prefers online services
  analysis.preferOnline = userInput.toLowerCase().includes("online") || 
                          userInput.toLowerCase().includes("remote") || 
                          userInput.toLowerCase().includes("virtual");
  
  if (analysis.preferOnline) {
    analysis.locationInfo.isRemote = true;
  }
  
  // Extract budget information if mentioned
  const budgetRegex = /\b(?:budget|spend|cost|price)[^\d]*(\d+)/i;
  const budgetMatch = userInput.match(budgetRegex);
  if (budgetMatch && budgetMatch[1]) {
    analysis.budget = parseInt(budgetMatch[1]);
  }
  
  // Set primary issue based on the most severe condition
  let maxSeverity = 0;
  for (const condition in analysis.severity) {
    if (analysis.severity[condition] > maxSeverity) {
      maxSeverity = analysis.severity[condition];
      analysis.primaryIssue = condition;
    }
  }
  
  // Determine if we have enough information to make recommendations
  analysis.hasEnoughInformation = analysis.suggestedCategories.length > 0 || 
                                analysis.medicalConditions.length > 0;
  
  return analysis;
}

/**
 * Extracts user preferences from input
 * @param userInput The user's input text
 * @returns Object containing user preferences
 */
export function extractUserPreferences(userInput: string): Record<string, string> {
  const preferences: Record<string, string> = {};
  
  // Extract gender preference if mentioned
  if (userInput.toLowerCase().includes("female doctor") || 
      userInput.toLowerCase().includes("woman doctor")) {
    preferences["practitionerGender"] = "female";
  } else if (userInput.toLowerCase().includes("male doctor") || 
             userInput.toLowerCase().includes("man doctor")) {
    preferences["practitionerGender"] = "male";
  }
  
  // Extract language preference if mentioned
  const languagePatterns = [
    { regex: /\b(?:speak|speaking|talks?)\s+(\w+)\b/i, group: 1 },
    { regex: /\b(\w+)-speaking\b/i, group: 1 }
  ];
  
  for (const pattern of languagePatterns) {
    const match = userInput.match(pattern.regex);
    if (match && match[pattern.group]) {
      const language = match[pattern.group].toLowerCase();
      if (!["to", "with", "fluent", "and", "or", "who"].includes(language)) {
        preferences["language"] = language;
        break;
      }
    }
  }
  
  return preferences;
}
