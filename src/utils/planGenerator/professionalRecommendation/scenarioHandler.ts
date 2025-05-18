
import { ScenarioResult } from "./types";
import { ServiceCategory } from "../types";

/**
 * Process a user health scenario to determine appropriate professionals
 * This is a pattern-matching approach that identifies common health scenarios
 * and maps them to appropriate professional recommendations
 * 
 * @param userInput The user's description of their health needs
 * @returns A scenario result if a known pattern is matched, or null if no match
 */
export function processHealthScenario(userInput: string): ScenarioResult | null {
  const input = userInput.toLowerCase();
  
  // Running injury scenario
  if (matchesScenario(input, ['running', 'injury']) ||
      matchesScenario(input, ['runner', 'pain']) ||
      matchesScenario(input, ['marathon', 'injury']) ||
      matchesScenario(input, ['jogging', 'pain'])) {
    
    return {
      scenarioName: "Running Injury",
      confidence: 0.85,
      mainIssue: "Running-related injury",
      recommendations: {
        primaryProfessional: 'physiotherapist',
        secondaryProfessional: 'biokineticist',
        supportingProfessionals: ['coaching', 'sports-medicine'],
        rationale: "Running injuries often require physiotherapy for acute management, followed by biokineticist support for rehab and coaching for technique correction to prevent recurrence."
      }
    };
  }
  
  // Lower back pain scenario
  if (matchesScenario(input, ['back pain', 'chronic']) ||
      matchesScenario(input, ['lower back', 'pain']) ||
      matchesScenario(input, ['back ache', 'persistent'])) {
    
    return {
      scenarioName: "Chronic Lower Back Pain",
      confidence: 0.8,
      mainIssue: "Chronic lower back pain",
      recommendations: {
        primaryProfessional: 'physiotherapist',
        secondaryProfessional: 'biokineticist',
        supportingProfessionals: ['pain-management'],
        rationale: "Chronic lower back pain typically responds well to physiotherapy for pain relief and mobility, with biokineticist support for strength development and long-term management."
      }
    };
  }
  
  // Weight loss scenario
  if (matchesScenario(input, ['lose weight', 'diet']) ||
      matchesScenario(input, ['weight loss', 'exercise']) ||
      matchesScenario(input, ['overweight', 'help'])) {
    
    return {
      scenarioName: "Weight Management",
      confidence: 0.85,
      mainIssue: "Weight loss/management",
      recommendations: {
        primaryProfessional: 'dietician',
        secondaryProfessional: 'personal-trainer',
        supportingProfessionals: ['coaching'],
        rationale: "Effective weight management typically requires dietary guidance from a dietician, structured exercise from a personal trainer, and potentially coaching for behavioral support."
      }
    };
  }
  
  // Sports performance scenario
  if (matchesScenario(input, ['improve performance', 'athlete']) ||
      matchesScenario(input, ['athletic performance', 'better']) ||
      matchesScenario(input, ['compete', 'training'])) {
    
    return {
      scenarioName: "Athletic Performance Optimization",
      confidence: 0.8,
      mainIssue: "Sports performance enhancement",
      recommendations: {
        primaryProfessional: 'personal-trainer',
        secondaryProfessional: 'coaching',
        supportingProfessionals: ['dietician', 'sports-medicine'],
        rationale: "Athletic performance improvement typically requires structured training from a personal trainer or specialized coach, with nutritional support from a dietician."
      }
    };
  }
  
  // Mental health scenario
  if (matchesScenario(input, ['anxiety', 'stress']) ||
      matchesScenario(input, ['depression', 'therapy']) ||
      matchesScenario(input, ['mental health', 'help'])) {
    
    return {
      scenarioName: "Mental Health Support",
      confidence: 0.85,
      mainIssue: "Mental health concerns",
      recommendations: {
        primaryProfessional: 'psychology',
        secondaryProfessional: 'psychiatry',
        supportingProfessionals: ['coaching'],
        rationale: "Mental health concerns like anxiety and depression often benefit from psychological therapy, potentially supported by psychiatric medication if needed, and coaching for ongoing support."
      }
    };
  }
  
  // Post-injury rehabilitation scenario
  if (matchesScenario(input, ['after surgery', 'recovery']) ||
      matchesScenario(input, ['rehabilitation', 'injury']) ||
      matchesScenario(input, ['recovering from', 'operation'])) {
    
    return {
      scenarioName: "Post-Surgery Rehabilitation",
      confidence: 0.9,
      mainIssue: "Recovery after surgery or injury",
      recommendations: {
        primaryProfessional: 'physiotherapist',
        secondaryProfessional: 'biokineticist',
        supportingProfessionals: ['dietician'],
        rationale: "Post-surgical recovery typically requires physiotherapy for initial rehabilitation, followed by biokineticist support for strength and function restoration."
      }
    };
  }
  
  // No matching scenario found
  return null;
}

/**
 * Helper function to check if the input matches all keywords in a scenario
 */
function matchesScenario(input: string, keywords: string[]): boolean {
  return keywords.every(keyword => input.includes(keyword.toLowerCase()));
}
