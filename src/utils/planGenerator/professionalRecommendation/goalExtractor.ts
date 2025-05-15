
import { PROFESSIONAL_KEYWORDS } from "../professionalKeywords";

/**
 * Extract health-related goals from user input
 * @param userInput User's description of their health needs and goals
 * @returns Array of detected goals
 */
export function extractGoals(userInput: string): string[] {
  const inputLower = userInput.toLowerCase();
  const goals: Set<string> = new Set();
  
  // Common goal phrases and their goal category
  const goalPhrases: Record<string, string[]> = {
    'weight': ['lose weight', 'weight loss', 'shed kilos', 'drop pounds', 'slimming'],
    'fitness': ['get fit', 'improve fitness', 'better shape', 'tone up', 'build muscle'],
    'pain': ['reduce pain', 'pain relief', 'pain management', 'less pain', 'stop hurting'],
    'mobility': ['move better', 'improve mobility', 'better range', 'flexibility', 'motion'],
    'recovery': ['recover from', 'heal', 'recuperate', 'get better', 'rehabilitation'],
    'performance': ['run faster', 'improve performance', 'better results', 'personal best'],
    'health': ['healthier', 'better health', 'general health', 'wellness', 'wellbeing']
  };
  
  // Check for each goal phrase
  Object.entries(goalPhrases).forEach(([goalType, phrases]) => {
    if (phrases.some(phrase => inputLower.includes(phrase))) {
      goals.add(goalType);
    }
  });
  
  // Check for specific treatments that indicate goals
  PROFESSIONAL_KEYWORDS.forEach(profMapping => {
    profMapping.treatments.forEach(treatment => {
      if (inputLower.includes(treatment.toLowerCase())) {
        // Map treatments to generic goals
        if (treatment.includes('strength') || treatment.includes('training')) {
          goals.add('strength');
        } else if (treatment.includes('mobility') || treatment.includes('flexibility')) {
          goals.add('mobility');
        } else if (treatment.includes('pain') || treatment.includes('relief')) {
          goals.add('pain relief');
        }
      }
    });
  });
  
  // Check for specific condition mentions
  const allConditions: string[] = [];
  PROFESSIONAL_KEYWORDS.forEach(prof => {
    allConditions.push(...prof.conditions);
  });
  
  // Find unique conditions mentioned
  const mentionedConditions = allConditions.filter(condition => 
    inputLower.includes(condition.toLowerCase())
  );
  
  // Add condition-based goals
  mentionedConditions.forEach(condition => {
    if (condition.includes('pain')) {
      goals.add('pain relief');
    } else if (condition.includes('injury')) {
      goals.add('recovery');
    } else if (condition.includes('mobility') || condition.includes('joint')) {
      goals.add('mobility');
    } else if (condition.includes('strength') || condition.includes('weakness')) {
      goals.add('strength');
    }
  });
  
  // Special case: Check for athletic goals
  const sportTerms = ['marathon', 'running', 'race', 'competition', 'tournament', 'game', 'match', 'sport'];
  if (sportTerms.some(term => inputLower.includes(term))) {
    goals.add('performance');
    
    // Further specify if it's running related
    if (inputLower.includes('marathon') || inputLower.includes('running') || 
        inputLower.includes('race') || inputLower.includes('5k') || 
        inputLower.includes('10k') || inputLower.includes('jog')) {
      goals.add('running');
    }
  }
  
  // Special case: Check for wedding or event preparation
  if (inputLower.includes('wedding') || inputLower.includes('event') || 
      inputLower.includes('special occasion') || inputLower.includes('ceremony')) {
    goals.add('appearance');
    // Often wedding prep involves weight/fitness goals
    if (!goals.has('weight') && !goals.has('fitness')) {
      goals.add('fitness');
    }
  }
  
  return Array.from(goals);
}
