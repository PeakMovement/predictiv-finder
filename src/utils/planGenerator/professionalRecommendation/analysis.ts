import { AnalysisResult } from "./types";
import { extractGoals } from "./goalExtractor";
import { ServiceCategory } from "../types";

/**
 * Analyzes user health input to extract relevant information
 * In a production system, this would use more advanced NLP or a language model
 */
export function analyzeUserHealth(userInput: string): AnalysisResult {
  const lowerInput = userInput.toLowerCase();
  
  // Extract symptoms using simple keyword matching
  const symptoms: string[] = extractSymptoms(lowerInput);
  
  // Extract goals using our dedicated goal extractor
  const goals: string[] = extractGoals(userInput);
  
  // Calculate severity scores for symptoms
  const severityScores: Record<string, number> = {};
  symptoms.forEach(symptom => {
    // Check for severity indicators
    if (lowerInput.includes(`severe ${symptom}`) || lowerInput.includes(`bad ${symptom}`)) {
      severityScores[symptom] = 0.8;
    } else if (lowerInput.includes(`mild ${symptom}`) || lowerInput.includes(`slight ${symptom}`)) {
      severityScores[symptom] = 0.3;
    } else {
      severityScores[symptom] = 0.5; // Default moderate severity
    }
  });
  
  // Detect contraindications
  const contraindications: ServiceCategory[] = detectContraindications(lowerInput);
  
  // Extract location information
  const locationInfo = extractLocationInfo(lowerInput);
  
  // Extract budget information
  const { hasBudgetConstraint, budget } = extractBudgetInfo(lowerInput);
  
  return {
    symptoms,
    goals,
    severityScores,
    contraindications,
    locationInfo,
    hasBudgetConstraint,
    budget
  };
}

/**
 * Extract symptoms from user input text
 */
function extractSymptoms(inputText: string): string[] {
  const symptoms: Set<string> = new Set();
  
  // Common physical symptoms
  const physicalSymptoms = [
    'back pain', 'knee pain', 'shoulder pain', 'neck pain', 
    'joint pain', 'headache', 'migraine', 'fatigue', 'tiredness',
    'weakness', 'stiffness', 'swelling', 'inflammation',
    'nausea', 'dizziness', 'balance issues', 'coordination problems',
    'muscle pain', 'cramps', 'spasms', 'numbness', 'tingling'
  ];
  
  // Mental/emotional symptoms
  const mentalSymptoms = [
    'anxiety', 'stress', 'depression', 'insomnia', 'sleep issues',
    'trouble sleeping', 'mood swings', 'irritability', 'lack of focus',
    'concentration problems', 'memory issues', 'mental fog'
  ];
  
  // Digestive symptoms  
  const digestiveSymptoms = [
    'bloating', 'constipation', 'diarrhea', 'indigestion',
    'stomach pain', 'acid reflux', 'heartburn', 'ibs', 
    'gas', 'digestive issues'
  ];
  
  // Check for each symptom in the input text
  [...physicalSymptoms, ...mentalSymptoms, ...digestiveSymptoms].forEach(symptom => {
    if (inputText.includes(symptom)) {
      symptoms.add(symptom);
    }
  });
  
  // Look for phrases like "I have X" or "suffering from X"
  const symptomPhrases = inputText.match(/(?:i have|suffering from|experiencing|dealing with|struggle with|problem with|issues with|trouble with)\s+([a-z\s]+)(?:,|\.|$)/gi);
  if (symptomPhrases) {
    symptomPhrases.forEach(phrase => {
      const cleanedPhrase = phrase.replace(/i have|suffering from|experiencing|dealing with|struggle with|problem with|issues with|trouble with/gi, '').trim();
      if (cleanedPhrase && cleanedPhrase.length > 3) { // Avoid very short matches
        symptoms.add(cleanedPhrase);
      }
    });
  }
  
  return Array.from(symptoms);
}

/**
 * Detect contraindications - services that should be avoided
 */
function detectContraindications(inputText: string): ServiceCategory[] {
  const contraindications: ServiceCategory[] = [];
  
  // Check for direct contraindications
  if (inputText.includes('no surgery') || inputText.includes('avoid surgery') || 
      inputText.includes('don\'t want surgery') || inputText.includes('against surgery')) {
    contraindications.push('orthopedic-surgeon');
    contraindications.push('neurosurgery');
    contraindications.push('plastic-surgery');
  }
  
  if (inputText.includes('no medication') || inputText.includes('avoid medication') ||
      inputText.includes('don\'t want medication') || inputText.includes('against medication')) {
    contraindications.push('psychiatry');
    // Others that primarily prescribe medication could be added here
  }
  
  return contraindications;
}

/**
 * Extract location information
 */
function extractLocationInfo(inputText: string): { location?: string; isRemote: boolean } {
  // Check for location phrases like "in Cape Town" or "located in Johannesburg"
  const locationMatches = inputText.match(/(?:in|at|near|located in)\s+([a-z\s]+?)(?:,|\.|$)/i);
  
  // Check for remote preference
  const isRemote = inputText.includes('remote') || 
                 inputText.includes('online') || 
                 inputText.includes('virtual') ||
                 inputText.includes('telehealth') ||
                 inputText.includes('from home');
                 
  return {
    location: locationMatches ? locationMatches[1].trim() : undefined,
    isRemote
  };
}

/**
 * Extract budget information
 */
function extractBudgetInfo(inputText: string): { hasBudgetConstraint: boolean; budget?: number } {
  // Look for budget information with various patterns
  const budgetMatches = inputText.match(/budget.*?(\d+)/i) || 
                      inputText.match(/afford.*?(\d+)/i) ||
                      inputText.match(/spend.*?(\d+)/i) ||
                      inputText.match(/limit.*?(\d+)/i) ||
                      inputText.match(/maximum.*?(\d+)/i) ||
                      inputText.match(/up to (\d+)/i) ||
                      inputText.match(/(\d+) rands?/i) ||
                      inputText.match(/r\s*(\d+)/i); // R1000 pattern
  
  if (budgetMatches && budgetMatches[1]) {
    const budget = parseInt(budgetMatches[1]);
    return {
      hasBudgetConstraint: true,
      budget: budget > 0 ? budget : undefined
    };
  }
  
  // Check for budget constraint mentions without specific amounts
  const hasBudgetConstraint = inputText.includes('budget') || 
                            inputText.includes('afford') ||
                            inputText.includes('expensive') ||
                            inputText.includes('cost') ||
                            inputText.includes('cheap') ||
                            inputText.includes('money');
  
  return {
    hasBudgetConstraint,
    budget: undefined
  };
}
