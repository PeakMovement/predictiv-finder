
import { ServiceCategory } from "./types";

/**
 * Type definition for keyword mapping entry
 */
export interface ProfessionalKeywordMapping {
  service: ServiceCategory;
  keywords: string[];
  strongIndicators: string[];  // Words that strongly indicate this professional is needed
  synonyms: string[];          // Alternative terms for the profession itself
  conditions: string[];        // Health conditions this professional typically addresses
  treatments: string[];        // Treatments or services offered by this professional
  priorities: {               // How to prioritize this professional for different scenarios
    primary: string[];        // When this professional should be primary
    secondary: string[];      // When this professional works well as secondary
    complementary: string[];  // When this professional works well as a complement
  }
}

/**
 * Comprehensive keyword mappings for professional service categories
 * Based on professional data and common terminology
 */
export const PROFESSIONAL_KEYWORDS: ProfessionalKeywordMapping[] = [
  {
    service: "physiotherapist",
    synonyms: ["physio", "physiotherapist", "physiotherapy", "physical therapist", "PT"],
    keywords: ["rehab", "rehabilitation", "injury", "back pain", "joint pain", "sports injury", "recovery", 
               "mobility", "stiffness", "treatment", "pain relief", "muscle strain", "torn ligament", 
               "ankle sprain", "neck pain", "shoulder pain"],
    strongIndicators: ["back pain", "joint pain", "sports injury", "muscle strain", "torn ligament", 
                       "ACL rehab", "ankle sprain", "neck pain", "shoulder pain"],
    conditions: ["back pain", "neck pain", "shoulder pain", "sports injury", "joint pain", "muscle strain", 
                "torn ligament", "ACL injury", "ankle sprain", "post-surgery recovery"],
    treatments: ["dry needling", "spinal adjustment", "manual therapy", "exercise therapy", "taping", 
                "sports massage", "trigger point", "movement correction", "clinical pilates", 
                "therapeutic exercise"],
    priorities: {
      primary: ["back pain", "neck pain", "shoulder injury", "sports injury", "joint pain", "post-op recovery"],
      secondary: ["chronic pain", "posture issues", "general fitness", "sport performance"],
      complementary: ["weight loss", "running training", "general health"]
    }
  },
  {
    service: "biokineticist",
    synonyms: ["biokinetics", "biokineticist", "bio", "biokinetic practitioner"],
    keywords: ["movement", "rehab", "recovery", "exercise therapy", "clinical exercise", "injury", "strength", 
               "mobility", "conditioning", "rehabilitation", "corrective exercise", "muscle imbalance", 
               "chronic pain", "post-surgery", "exercise program"],
    strongIndicators: ["muscle imbalance", "corrective exercise", "biomechanics", "movement analysis", 
                       "return to sport", "exercise prescription", "orthopaedic rehab"],
    conditions: ["chronic pain", "post-surgery recovery", "sports injury", "muscle imbalance", 
                "joint mobility issues", "knee injury", "ankle rehab", "hip mobility", "spinal rehab"],
    treatments: ["corrective exercise", "movement analysis", "functional training", "exercise program", 
                "postural correction", "biomechanics assessment", "sports recovery", "balance training"],
    priorities: {
      primary: ["chronic injury", "post-rehabilitation", "movement correction", "advanced rehab"],
      secondary: ["sports injury", "chronic pain", "muscle imbalance"],
      complementary: ["physiotherapy follow-up", "strength training", "sports performance"]
    }
  },
  {
    service: "coaching",
    synonyms: ["run strength coach", "running coach", "run coach", "fitness coach", "performance coach"],
    keywords: ["run strength", "running coach", "run training", "strength coach", "mobility", "performance", 
               "injury prevention", "speed training", "running plan", "conditioning", "explosive power"],
    strongIndicators: ["marathon", "running plan", "run training", "sprint training", "cadence", 
                      "run drills", "hill sprints", "tempo runs", "gait analysis"],
    conditions: ["running injury", "training plateaus", "race preparation", "running performance", 
                "speed development", "endurance issues", "technique flaws"],
    treatments: ["run drills", "resistance training", "hill sprints", "intervals", "core training", 
                "stability work", "stride analysis", "cadence correction", "form correction"],
    priorities: {
      primary: ["marathon training", "race preparation", "running technique", "sprint development"],
      secondary: ["general fitness", "injury prevention", "cardio improvement"],
      complementary: ["weight loss", "strength development", "rehabilitation"]
    }
  },
  {
    service: "dietician",
    synonyms: ["dietician", "registered dietician", "dietitian", "nutrition expert", "clinical nutritionist"],
    keywords: ["meal planning", "nutritional assessment", "healthy diet", "evidence-based nutrition", 
               "clinical nutrition", "eating disorders", "diabetes nutrition", "heart health", 
               "cholesterol control", "weight management", "sports dietetics"],
    strongIndicators: ["diabetes nutrition", "eating disorders", "clinical nutrition", "medical nutrition", 
                      "food allergy", "IBS diet", "chronic disease nutrition"],
    conditions: ["diabetes", "heart disease", "high cholesterol", "IBS", "food allergies", "eating disorders", 
                "obesity", "malnutrition", "digestive disorders", "metabolic disorders"],
    treatments: ["meal planning", "nutritional assessment", "macro tracking", "micronutrient advice", 
                "medical nutrition therapy", "food allergy management", "anti-inflammatory diet"],
    priorities: {
      primary: ["diabetes", "eating disorders", "clinical nutrition needs", "digestive disorders", "food allergies"],
      secondary: ["weight management", "heart health", "sports performance"],
      complementary: ["fitness programs", "medical treatment", "rehabilitation"]
    }
  },
  {
    service: "personal-trainer",
    synonyms: ["trainer", "PT", "fitness trainer", "exercise specialist", "gym instructor"],
    keywords: ["strength training", "fitness", "workout", "exercise program", "weight loss", "muscle gain", 
               "body composition", "toning", "conditioning", "weight training", "resistance training"],
    strongIndicators: ["workout plan", "strength training", "muscle building", "gym program", 
                      "weight training", "fitness goals", "body transformation"],
    conditions: ["lack of fitness", "weight management", "muscle weakness", "poor conditioning", 
                "low strength", "poor mobility", "body composition issues"],
    treatments: ["strength training", "weight training", "HIIT workouts", "circuit training", 
                "resistance training", "bodyweight exercises", "flexibility work", "cardio training"],
    priorities: {
      primary: ["general fitness", "strength development", "muscle building", "weight loss support"],
      secondary: ["rehabilitation follow-up", "sports performance", "functional fitness"],
      complementary: ["nutrition plans", "rehabilitation", "sports coaching"]
    }
  },
  {
    service: "family-medicine",
    synonyms: ["doctor", "GP", "general practitioner", "physician", "medical doctor"],
    keywords: ["medical checkup", "health exam", "medical visit", "consultation", "illness", "flu", "cold", 
               "infection", "diagnosis", "prescription", "healthcare", "treatment plan", "clinical visit"],
    strongIndicators: ["diagnosis", "prescription", "chronic disease", "hypertension", "diabetes", 
                      "blood test", "medical history", "symptoms", "lab results"],
    conditions: ["chronic disease", "hypertension", "diabetes", "mental health", "infections", "cold", 
                "flu", "fever", "fatigue", "pain", "general symptoms"],
    treatments: ["diagnosis", "prescription", "medical treatment", "health screening", "vaccination", 
                "blood tests", "referrals", "medical advice", "disease management"],
    priorities: {
      primary: ["illness", "infection", "chronic disease management", "general health concerns"],
      secondary: ["preventive care", "health monitoring", "minor injuries"],
      complementary: ["nutrition", "fitness", "mental health", "rehabilitation"]
    }
  },
  {
    service: "psychiatry",
    synonyms: ["psychiatrist", "mental health doctor", "psychological medicine", "mental health specialist"],
    keywords: ["mental health", "anxiety", "depression", "stress", "mood disorders", "psychiatric assessment", 
               "medication management", "psychological treatment", "therapy", "mental illness"],
    strongIndicators: ["severe anxiety", "clinical depression", "bipolar disorder", "psychiatric medication", 
                      "mental illness", "panic attacks", "psychiatric diagnosis"],
    conditions: ["clinical depression", "anxiety disorders", "bipolar disorder", "schizophrenia", 
                "PTSD", "OCD", "eating disorders", "attention disorders", "mood disorders"],
    treatments: ["psychiatric assessment", "medication management", "psychiatric therapy", 
                "mental health treatment", "psychological intervention", "brain stimulation therapies"],
    priorities: {
      primary: ["severe mental health conditions", "medication needs", "psychiatric disorders"],
      secondary: ["mild to moderate mental health issues", "chronic stress"],
      complementary: ["therapy", "coaching", "lifestyle interventions"]
    }
  }
];

/**
 * Find a service category based on a keyword
 * @param keyword Search term to match against professional keywords
 * @returns Matching service category or undefined if no match
 */
export function findServiceByKeyword(keyword: string): ServiceCategory | undefined {
  keyword = keyword.toLowerCase();
  
  // First check for direct professional name matches (highest priority)
  const professionalMatch = PROFESSIONAL_KEYWORDS.find(mapping => 
    mapping.synonyms.some(synonym => keyword.includes(synonym.toLowerCase()))
  );
  
  if (professionalMatch) {
    return professionalMatch.service;
  }
  
  // Next check for strong indicators (second highest priority)
  const strongIndicatorMatch = PROFESSIONAL_KEYWORDS.find(mapping => 
    mapping.strongIndicators.some(indicator => 
      keyword.includes(indicator.toLowerCase())
    )
  );
  
  if (strongIndicatorMatch) {
    return strongIndicatorMatch.service;
  }
  
  // Then check general keywords
  const keywordMatch = PROFESSIONAL_KEYWORDS.find(mapping => 
    mapping.keywords.some(kw => keyword.includes(kw.toLowerCase()))
  );
  
  if (keywordMatch) {
    return keywordMatch.service;
  }
  
  // Finally check conditions and treatments
  const conditionTreatmentMatch = PROFESSIONAL_KEYWORDS.find(mapping => 
    mapping.conditions.some(condition => keyword.includes(condition.toLowerCase())) ||
    mapping.treatments.some(treatment => keyword.includes(treatment.toLowerCase()))
  );
  
  return conditionTreatmentMatch?.service;
}

/**
 * Find all service categories that match a keyword with confidence scores
 * @param keyword Search term to match against professional keywords
 * @returns Array of matching service categories with confidence scores
 */
export function findAllServicesByKeyword(keyword: string): Array<{service: ServiceCategory, confidence: number}> {
  keyword = keyword.toLowerCase();
  const matches: Array<{service: ServiceCategory, confidence: number}> = [];
  
  PROFESSIONAL_KEYWORDS.forEach(mapping => {
    let confidence = 0;
    
    // Check synonyms (direct professional mentions)
    if (mapping.synonyms.some(synonym => keyword.includes(synonym.toLowerCase()))) {
      confidence = 0.9; // Very high confidence for direct mentions
    }
    // Check strong indicators
    else if (mapping.strongIndicators.some(indicator => keyword.includes(indicator.toLowerCase()))) {
      confidence = 0.8; // High confidence
    }
    // Check general keywords
    else if (mapping.keywords.some(kw => keyword.includes(kw.toLowerCase()))) {
      confidence = 0.6; // Medium confidence
    }
    // Check conditions
    else if (mapping.conditions.some(condition => keyword.includes(condition.toLowerCase()))) {
      confidence = 0.7; // Medium-high confidence
    }
    // Check treatments
    else if (mapping.treatments.some(treatment => keyword.includes(treatment.toLowerCase()))) {
      confidence = 0.65; // Medium confidence
    }
    
    if (confidence > 0) {
      matches.push({ service: mapping.service, confidence });
    }
  });
  
  // Sort by confidence descending
  return matches.sort((a, b) => b.confidence - a.confidence);
}
