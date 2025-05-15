
import { ServiceCategory } from "./types";

/**
 * Interface for professional phrase data
 */
export interface ProfessionalPhrases {
  professional: ServiceCategory;
  phrases: string[];
}

/**
 * Comprehensive professional phrase data
 * These are common phrases users might use when looking for each professional category
 */
export const PROFESSIONAL_PHRASES_DATA: ProfessionalPhrases[] = [
  {
    professional: "physiotherapist",
    phrases: [
      "I need a physio",
      "rehabilitation for injury",
      "recover from surgery",
      "back pain specialist",
      "sports injury rehab",
      "muscle strain recovery",
      "help with shoulder pain",
      "neck pain relief",
      "rehab exercises",
      "manual therapy session",
      "dry needling required",
      "spinal adjustment help",
      "physiotherapy appointment",
      "rehab after surgery",
      "joint pain treatment",
      "post-op recovery support",
      "injury rehab plan",
      "pain in lower back",
      "treatment for knee injury",
      "help with movement issues",
      "sports recovery program",
      "rehab for torn ligament",
      "muscle recovery expert",
      "looking for a physio",
      "functional movement therapy",
      "need injury rehab",
      "therapy for sprained ankle",
      "improve mobility",
      "injury prevention physio",
      "soft tissue treatment",
      "sports massage therapy",
      "alignment correction",
      "clinical pilates session",
      "tight muscles therapy",
      "core strength program",
      "musculoskeletal therapy",
      "treatment for chronic pain",
      "posture correction help",
      "therapy for joint stiffness",
      "pelvic rehab session",
      "numbness and tingling help",
      "pain management physiotherapy",
      "range of motion recovery",
      "nerve pain treatment",
      "custom rehab plan",
      "one-on-one physio",
      "therapy after sports injury",
      "get rid of back pain",
      "return to sport physio",
      "muscle imbalances correction"
    ]
  },
  {
    professional: "biokineticist",
    phrases: [
      "book a biokineticist",
      "rehab through movement",
      "corrective exercise support",
      "post-injury rehab program",
      "help with chronic pain",
      "improve muscle function",
      "recovery from joint injury",
      "guided movement rehab",
      "strengthen weak muscles",
      "injury recovery exercises",
      "custom exercise rehab",
      "core stability training",
      "help with back injury",
      "range of motion program",
      "movement re-education",
      "mobility and strength support",
      "rehabilitative exercise help",
      "recover from muscle tear",
      "performance and rehab plan",
      "balance and posture correction",
      "need bio session",
      "functional strength plan",
      "injury prevention training",
      "program for muscle recovery",
      "knee rehab exercises",
      "hip mobility work",
      "return to sport guidance",
      "ankle rehab support",
      "bio rehab session",
      "movement therapy expert",
      "clinical exercise planning",
      "low-impact rehab plan",
      "training after injury",
      "bio for sports recovery",
      "biokinetics help",
      "improve joint mobility",
      "movement dysfunction fix",
      "bio strength program",
      "back to sport plan",
      "hip alignment correction",
      "exercise prescription help",
      "long-term recovery program",
      "muscle engagement work",
      "joint stability program",
      "bio session for mobility",
      "personalised bio plan",
      "support for injury rehab",
      "postural correction exercises",
      "recovery strength training",
      "rehab training session"
    ]
  },
  {
    professional: "coaching",
    phrases: [
      "strengthen my running",
      "run strength training",
      "running technique help",
      "coach for runners",
      "improve my running form",
      "injury prevention for runners",
      "get faster at running",
      "run-specific strength exercises",
      "help with running drills",
      "program for running strength",
      "mobility for runners",
      "core for runners",
      "personalised run plan",
      "endurance strength program",
      "hill training support",
      "running power improvement",
      "interval training coach",
      "stability training for runners",
      "fix running posture",
      "glute activation for runners",
      "hamstring strength help",
      "balance work for runners",
      "performance running coach",
      "run mobility session",
      "cadence and stride support",
      "coach for distance runners",
      "trail running strength",
      "speed and agility training",
      "recovery for runners",
      "strength to avoid injury",
      "plyometric for running",
      "functional training for runners",
      "running improvement plan",
      "sprint strength plan",
      "muscle activation for running",
      "core strength for runners",
      "coach for marathon prep",
      "form correction for running",
      "strength endurance session",
      "explosive running drills",
      "ankle stability training",
      "knee control training",
      "breathing techniques for runners",
      "technique work for runners",
      "high performance running",
      "coaching for 5k",
      "race pace strength",
      "aerobic base plan",
      "long-distance training coach",
      "coach for running performance"
    ]
  },
  {
    professional: "nutrition-coach",
    phrases: [
      "need nutrition guidance",
      "help with healthy eating",
      "meal plan support",
      "personalised nutrition plan",
      "lose weight with food",
      "gain muscle through diet",
      "clean eating advice",
      "nutrition for performance",
      "energy boost from food",
      "help with portion control",
      "macro coaching session",
      "food tracking support",
      "balanced eating program",
      "nutrition to support training",
      "diet accountability help",
      "meal prep ideas",
      "coach for weight loss",
      "better food choices",
      "cutting phase guidance",
      "bulking with clean diet",
      "nutrition habits change",
      "improve relationship with food",
      "healthy snacks support",
      "macro and micro tracking",
      "help with sugar cravings",
      "gut health nutrition",
      "sports nutrition plan",
      "fueling for workouts",
      "hydration and performance",
      "plant-based meal plan",
      "low-carb guidance",
      "vegan nutrition advice",
      "keto coaching session",
      "custom food plan",
      "coaching for mindful eating",
      "fat loss diet coach",
      "build lean mass plan",
      "nutrition challenge support",
      "structured eating habits",
      "protein planning advice",
      "eating around workouts",
      "meal schedule coaching",
      "nutrition improvement coach",
      "body transformation nutrition",
      "long-term eating plan",
      "support with cravings",
      "food planning help",
      "daily food tracker support",
      "nutrition performance boost",
      "habits-based eating plan"
    ]
  },
  {
    professional: "dietician",
    phrases: [
      "need a dietician",
      "book a dietician",
      "dietician for weight loss",
      "custom meal planning",
      "clinical nutrition help",
      "evidence-based eating advice",
      "help with cholesterol",
      "blood sugar diet",
      "meal plan for diabetes",
      "digestive health diet",
      "low FODMAP advice",
      "anti-inflammatory food plan",
      "nutrition for medical condition",
      "IBS dietary support",
      "gluten-free dietician",
      "professional diet guidance",
      "child nutrition support",
      "meal support for PCOS",
      "nutrition for pregnancy",
      "lactose intolerance meal plan",
      "gut-friendly food support",
      "registered dietician support",
      "healthy heart meal plan",
      "sports performance nutrition",
      "weight gain diet help",
      "balanced diet structure",
      "portion guidance",
      "help with binge eating",
      "calorie control plan",
      "low-sodium diet support",
      "plan for high blood pressure",
      "post-surgery diet help",
      "meal prep with dietician",
      "eating disorder support",
      "customised eating plan",
      "meal audit session",
      "eating better with guidance",
      "dietician for high performance",
      "personalised diet support",
      "micronutrient focus meal plan",
      "blood work diet adjustment",
      "metabolic health eating",
      "cholesterol lowering plan",
      "long-term health eating plan",
      "heart-healthy food plan",
      "habit-based meal coaching",
      "plant-based nutrition advice",
      "eating habits education",
      "clinical dietary intervention",
      "dietician appointment booking"
    ]
  },
  {
    professional: "family-medicine",
    phrases: [
      "see a doctor",
      "book a doctor",
      "get a check-up",
      "feeling unwell",
      "I need a medical exam",
      "consult a GP",
      "general health check",
      "routine blood test",
      "talk to a doctor",
      "medical diagnosis required",
      "I feel sick",
      "persistent cough help",
      "medical symptoms evaluation",
      "family doctor visit",
      "need prescription refill",
      "health screening appointment",
      "ongoing fatigue treatment",
      "shortness of breath consult",
      "allergy symptoms",
      "get my blood pressure checked",
      "check for diabetes",
      "help with high cholesterol",
      "chronic condition support",
      "see a GP today",
      "medical review appointment",
      "book wellness exam",
      "urgent care needed",
      "medical referral needed",
      "get vaccinated",
      "preventative health consult",
      "general practitioner session",
      "doctor for stomach pain",
      "follow-up appointment needed",
      "review test results",
      "consult for chest pain",
      "health concerns consultation",
      "help with headaches",
      "doctor for mental health",
      "get a flu shot",
      "help with infection",
      "check unusual symptoms",
      "doctor for annual check",
      "book physical exam",
      "get tested for illness",
      "medical clearance for training",
      "routine medical check",
      "doctor for muscle pain",
      "pain management consult",
      "GP for general concerns",
      "find a local doctor"
    ]
  }
];

/**
 * Find a professional category based on a phrase
 * @param phrase The phrase to check
 * @returns The matching professional category or null if no match
 */
export function findProfessionalByPhrase(phrase: string): ServiceCategory | null {
  const lowerPhrase = phrase.toLowerCase().trim();
  
  // Check for exact matches first
  for (const profData of PROFESSIONAL_PHRASES_DATA) {
    if (profData.phrases.some(p => p.toLowerCase() === lowerPhrase)) {
      return profData.professional;
    }
  }
  
  // Check for partial matches (phrase contains any of the professional phrases)
  for (const profData of PROFESSIONAL_PHRASES_DATA) {
    if (profData.phrases.some(p => lowerPhrase.includes(p.toLowerCase()))) {
      return profData.professional;
    }
  }
  
  // Check if any professional phrases are contained within the input phrase
  for (const profData of PROFESSIONAL_PHRASES_DATA) {
    if (profData.phrases.some(p => p.toLowerCase().includes(lowerPhrase) && p.length > 5)) {
      return profData.professional;
    }
  }
  
  return null;
}

/**
 * Detect professional mentions in user input
 * @param userInput The user input text
 * @returns Array of detected professional categories with counts
 */
export function detectProfessionalPhrases(userInput: string): Array<{category: ServiceCategory, count: number, matchedPhrases: string[]}> {
  const inputLower = userInput.toLowerCase();
  const results = new Map<ServiceCategory, {count: number, matchedPhrases: string[]}>();
  
  // Check for matches with each professional's phrases
  PROFESSIONAL_PHRASES_DATA.forEach(profData => {
    const matchedPhrases: string[] = [];
    
    profData.phrases.forEach(phrase => {
      if (inputLower.includes(phrase.toLowerCase())) {
        matchedPhrases.push(phrase);
      }
    });
    
    if (matchedPhrases.length > 0) {
      results.set(profData.professional, {
        count: matchedPhrases.length,
        matchedPhrases
      });
    }
  });
  
  // Convert map to array and sort by count (highest first)
  return Array.from(results.entries())
    .map(([category, { count, matchedPhrases }]) => ({ category, count, matchedPhrases }))
    .sort((a, b) => b.count - a.count);
}
