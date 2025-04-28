
import { ServiceCategory } from "./types";

// Interface for professional phrase mapping
export interface ProfessionalPhraseMapping {
  professional: ServiceCategory;
  phrases: string[];
}

// Mapping between phrases and professional categories
export const PROFESSIONAL_PHRASES: ProfessionalPhraseMapping[] = [
  {
    professional: "family-medicine",
    phrases: [
      "doctor",
      "general practitioner",
      "medical doctor",
      "physician",
      "GP",
      "health specialist",
      "diagnostic expert",
      "back pain doctor",
      "knee specialist",
      "shoulder doctor",
      "fatigue specialist", 
      "medical professional",
      "pain doctor",
      "injury specialist",
      "healthcare provider",
      "clinical expert",
      "doctor for pain",
      "medical consultant",
      "primary care doctor",
      "specialist physician",
      "health evaluator",
      "stomach doctor",
      "digestive doctor",
      "abdominal doctor",
      "gastro doctor"
    ]
  },
  {
    professional: "dietician",
    phrases: [
      "dietician",
      "clinical dietician",
      "nutrition expert",
      "diet specialist", 
      "registered dietician",
      "food advisor",
      "nutrition planner",
      "diet consultant",
      "healthy eating expert",
      "clinical nutritionist",
      "dietary specialist",
      "nutrition therapist",
      "food health expert",
      "diet plan creator",
      "medical dietician",
      "nutrition counselor",
      "dietary advisor",
      "health diet expert",
      "nutrition professional",
      "food intake specialist",
      "clinical diet planner",
      "gut health dietician",
      "digestive nutrition expert",
      "stomach dietician"
    ]
  },
  {
    professional: "physiotherapist",
    phrases: [
      "physiotherapist",
      "physical therapist",
      "physio",
      "rehab specialist",
      "physiotherapy expert",
      "movement therapist",
      "pain therapist",
      "back pain specialist",
      "knee rehab expert",
      "shoulder therapist",
      "injury rehab specialist",
      "mobility expert",
      "physical rehab therapist",
      "physio for pain",
      "rehabilitation therapist",
      "muscle therapist",
      "joint specialist",
      "physiotherapy consultant",
      "pain relief therapist",
      "movement rehab expert",
      "physical therapy specialist"
    ]
  },
  {
    professional: "gastroenterology",
    phrases: [
      "gastroenterologist",
      "GI doctor",
      "gastro specialist",
      "digestive specialist",
      "gut specialist",
      "stomach specialist",
      "gastro doctor",
      "digestive system doctor",
      "intestinal specialist",
      "bowel specialist",
      "abdomen doctor",
      "gastrointestinal expert",
      "GI specialist",
      "gut doctor",
      "digestive health expert",
      "stomach doctor",
      "GI consultant",
      "abdominal specialist",
      "digestive health doctor",
      "intestinal health expert"
    ]
  },
  {
    professional: "coaching",
    phrases: [
      "run coach",
      "running coach",
      "track coach",
      "running trainer",
      "sprint coach",
      "endurance coach",
      "running form expert",
      "marathon trainer",
      "run specialist",
      "jogging coach",
      "running fitness expert",
      "track running coach",
      "distance running trainer",
      "running performance coach",
      "run training expert",
      "athletics coach",
      "running technique coach",
      "endurance running expert",
      "run prep coach",
      "running skills trainer",
      "track fitness coach",
      "coach",
      "nutrition coach",
      "diet coach",
      "healthy eating coach",
      "nutrition advisor",
      "food coach",
      "dietary coach",
      "nutrition guide",
      "eating plan coach",
      "health food coach",
      "nutrition support coach"
    ]
  },
  {
    professional: "personal-trainer",
    phrases: [
      "strength coach",
      "strength trainer",
      "personal trainer",
      "weight coach",
      "strength and conditioning coach",
      "powerlifting coach",
      "muscle building expert",
      "strength training specialist",
      "weightlifting trainer",
      "core strength coach",
      "fitness trainer",
      "strength workout expert",
      "resistance training coach",
      "muscle strength trainer",
      "gym coach",
      "strength fitness expert",
      "weight training specialist",
      "power trainer",
      "strength program coach",
      "muscle fitness coach",
      "lifting coach",
      "strength exercise expert"
    ]
  }
];

// Helper function to find a professional category based on a phrase
export const findProfessionalByPhrase = (
  phrase: string
): ServiceCategory | null => {
  const lowerPhrase = phrase.toLowerCase();
  
  // Direct match first
  for (const mapping of PROFESSIONAL_PHRASES) {
    if (mapping.phrases.some(p => p.toLowerCase() === lowerPhrase)) {
      return mapping.professional;
    }
  }
  
  // Then check for partial matches
  for (const mapping of PROFESSIONAL_PHRASES) {
    if (mapping.phrases.some(p => lowerPhrase.includes(p.toLowerCase()))) {
      return mapping.professional;
    }
  }
  
  return null;
};

// Helper function to detect professional mentions in a string
export const detectProfessionalMentions = (
  text: string
): { category: ServiceCategory; count: number }[] => {
  const lowerText = text.toLowerCase();
  const detectedProfessionals: Map<ServiceCategory, number> = new Map();
  
  // Special case: explicitly check for stomach/digestive issues
  if (lowerText.includes('stomach') || 
      lowerText.includes('digestive') || 
      lowerText.includes('abdomen') ||
      lowerText.includes('gut')) {
    
    // Ensure gastroenterology is detected strongly
    detectedProfessionals.set('gastroenterology', 2);
    console.log("Added gastroenterology based on stomach/digestive reference");
    
    // Add family-medicine as a backup for digestive issues
    detectedProfessionals.set('family-medicine', 1);
  }
  
  // Budget-sensitive detection
  const budgetMatch = lowerText.match(/r\s*(\d{1,4})/i);
  if (budgetMatch) {
    const budget = parseInt(budgetMatch[1], 10);
    if (budget < 1000) {
      // For low budgets, ensure family medicine is detected
      const currentCount = detectedProfessionals.get('family-medicine') || 0;
      detectedProfessionals.set('family-medicine', currentCount + 1);
      console.log("Added family-medicine based on tight budget consideration");
    }
  }
  
  // Search for each phrase in the text
  PROFESSIONAL_PHRASES.forEach(mapping => {
    mapping.phrases.forEach(phrase => {
      // Check for whole word matches with word boundaries
      const regex = new RegExp(`\\b${phrase.toLowerCase()}\\b`, 'g');
      const matches = lowerText.match(regex);
      
      if (matches) {
        const currentCount = detectedProfessionals.get(mapping.professional) || 0;
        detectedProfessionals.set(mapping.professional, currentCount + matches.length);
      }
    });
  });
  
  // Convert map to array and sort by frequency
  return Array.from(detectedProfessionals.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};
