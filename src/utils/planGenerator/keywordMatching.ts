import { ServiceCategory } from "./types";
import { findServiceByKeyword, findAllServicesByKeyword, PROFESSIONAL_KEYWORDS } from "./professionalKeywords";
import { detectProfessionalMentions } from "./inputAnalyzer/professionalMentions";

/**
 * Process user input to find matching services and health needs
 * @param userInput Text from the user describing their health needs
 * @returns Analysis of health services and detected needs
 */
export function processKeywordMatching(userInput: string) {
  const inputLower = userInput.toLowerCase();
  
  // 1. Detect professional mentions
  const professionalMentions = detectProfessionalMentions(inputLower);
  
  // 2. Extract phrases for more granular analysis
  const phrases = extractPhrases(inputLower);
  
  // 3. Analyze each phrase for keyword matches
  const phraseMatches = phrases.map(phrase => ({
    phrase,
    matches: findAllServicesByKeyword(phrase)
  }));
  
  // 4. Compile results
  const recommendedCategories = new Set<ServiceCategory>();
  const categoryConfidence: Record<ServiceCategory, number> = {};
  
  // Add categories from professional mentions
  professionalMentions.forEach(mention => {
    recommendedCategories.add(mention.serviceCategory);
    categoryConfidence[mention.serviceCategory] = mention.confidence;
  });
  
  // Add categories from phrase analysis
  phraseMatches.forEach(({ phrase, matches }) => {
    matches.forEach(match => {
      recommendedCategories.add(match.service);
      
      // Keep highest confidence score
      if (!categoryConfidence[match.service] || 
          categoryConfidence[match.service] < match.confidence) {
        categoryConfidence[match.service] = match.confidence;
      }
    });
  });
  
  // Sort categories by confidence
  const rankedCategories = Array.from(recommendedCategories)
    .map(category => ({
      category,
      confidence: categoryConfidence[category] || 0.5,
      reason: generateReasoningForCategory(category, userInput)
    }))
    .sort((a, b) => b.confidence - a.confidence);
  
  return {
    rankedCategories,
    phraseAnalysis: phraseMatches,
    categoryConfidence,
    detectedKeywords: extractKeywordsFromInput(inputLower)
  };
}

/**
 * Extract meaningful phrases from user input for more precise analysis
 */
function extractPhrases(text: string): string[] {
  // Split by common delimiters
  return text
    .split(/[,.;!?]|\band\b|\bor\b|\bbut\b|\bthen\b/)
    .map(phrase => phrase.trim())
    .filter(phrase => phrase.length > 3);
}

/**
 * Extract the specific keywords detected in the user's input
 */
function extractKeywordsFromInput(inputLower: string): Record<string, string[]> {
  const results: Record<string, string[]> = {};
  
  PROFESSIONAL_KEYWORDS.forEach(profMapping => {
    const detectedKeywords: string[] = [];
    
    // Check synonyms
    profMapping.synonyms.forEach(synonym => {
      if (inputLower.includes(synonym.toLowerCase())) {
        detectedKeywords.push(synonym);
      }
    });
    
    // Check strong indicators
    profMapping.strongIndicators.forEach(indicator => {
      if (inputLower.includes(indicator.toLowerCase())) {
        detectedKeywords.push(indicator);
      }
    });
    
    // Check general keywords
    profMapping.keywords.forEach(keyword => {
      if (inputLower.includes(keyword.toLowerCase())) {
        detectedKeywords.push(keyword);
      }
    });
    
    if (detectedKeywords.length > 0) {
      results[profMapping.service] = detectedKeywords;
    }
  });
  
  return results;
}

/**
 * Generate human-readable reasoning for why a category was recommended
 */
function generateReasoningForCategory(category: ServiceCategory, userInput: string): string {
  const inputLower = userInput.toLowerCase();
  
  // Find the professional mapping for this category
  const profMapping = PROFESSIONAL_KEYWORDS.find(mapping => mapping.service === category);
  if (!profMapping) return "Matched based on your health needs";
  
  // Check for direct professional mentions
  for (const synonym of profMapping.synonyms) {
    if (inputLower.includes(synonym.toLowerCase())) {
      return `You mentioned needing a ${synonym}`;
    }
  }
  
  // Check for condition matches
  for (const condition of profMapping.conditions) {
    if (inputLower.includes(condition.toLowerCase())) {
      return `Recommended for ${condition}`;
    }
  }
  
  // Check for treatment matches
  for (const treatment of profMapping.treatments) {
    if (inputLower.includes(treatment.toLowerCase())) {
      return `Can provide ${treatment} that may help your condition`;
    }
  }
  
  // Check for keyword matches
  for (const keyword of profMapping.keywords) {
    if (inputLower.includes(keyword.toLowerCase())) {
      return `Matched based on your mention of ${keyword}`;
    }
  }
  
  return "Recommended based on your health needs";
}

/**
 * Generate a summary of keyword analysis for display purposes
 */
export function generateKeywordMatchingSummary(userInput: string): {
  matchedProfessionals: string[];
  keywordMatches: Record<string, string[]>;
  recommendationReasons: Record<string, string>;
} {
  const analysis = processKeywordMatching(userInput);
  
  return {
    matchedProfessionals: analysis.rankedCategories.map(rc => rc.category),
    keywordMatches: analysis.detectedKeywords,
    recommendationReasons: analysis.rankedCategories.reduce((acc, rc) => {
      acc[rc.category] = rc.reason;
      return acc;
    }, {} as Record<string, string>)
  };
}
