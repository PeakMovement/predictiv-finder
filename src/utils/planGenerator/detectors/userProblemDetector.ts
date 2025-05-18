import { ServiceCategory } from "../types";
import { 
  MENTAL_HEALTH_SYNONYMS,
  FITNESS_SYNONYMS,
  DIGESTIVE_SYNONYMS,
  GOAL_SYNONYMS
} from "../symptomMappings/synonymGroups";

export interface DetectedUserProblem {
  problem: string;
  confidence: number;
  relatedCategories: ServiceCategory[];
  severity: 'mild' | 'moderate' | 'severe';
  acuity: 'chronic' | 'acute' | 'progressive';
  suggestedApproach: string;
}

/**
 * An enhanced detector that finds specific health problems from user descriptions
 * with improved accuracy and context awareness
 */
export function detectUserProblems(userInput: string): DetectedUserProblem[] {
  const inputLower = userInput.toLowerCase();
  const problems: DetectedUserProblem[] = [];
  
  // PAIN DETECTION - Comprehensive approach for detecting pain by location
  const painRegions = [
    { region: 'back', synonyms: ['back', 'spine', 'lumbar', 'spinal'] },
    { region: 'neck', synonyms: ['neck', 'cervical'] },
    { region: 'shoulder', synonyms: ['shoulder', 'rotator cuff', 'deltoid'] },
    { region: 'knee', synonyms: ['knee', 'patella', 'acl', 'mcl'] },
    { region: 'hip', synonyms: ['hip', 'pelvis', 'groin'] },
    { region: 'elbow', synonyms: ['elbow', 'tennis elbow', 'golfer\'s elbow'] },
    { region: 'wrist', synonyms: ['wrist', 'carpal tunnel'] },
    { region: 'ankle', synonyms: ['ankle', 'achilles', 'heel'] },
    { region: 'foot', synonyms: ['foot', 'plantar fasciitis', 'arch'] },
    { region: 'head', synonyms: ['headache', 'migraine', 'head pain'] },
    { region: 'joint', synonyms: ['joint', 'joints', 'arthritis'] },
    { region: 'muscle', synonyms: ['muscle', 'muscular', 'strain'] }
  ];
  
  painRegions.forEach(({ region, synonyms }) => {
    // Check for pain references near region terms
    const painWords = ['pain', 'ache', 'sore', 'hurt', 'discomfort'];
    
    // For each region synonym, check if it's near a pain word
    for (const synonym of synonyms) {
      if (!inputLower.includes(synonym)) continue;
      
      // Check for direct mentions like "back pain"
      const directMatch = painWords.some(pain => 
        inputLower.includes(`${synonym} ${pain}`) || 
        inputLower.includes(`${pain} in ${synonym}`) ||
        inputLower.includes(`${pain} my ${synonym}`)
      );
      
      if (directMatch || synonyms.some(s => s.includes('pain'))) {
        // Determine severity based on language
        let severity: 'mild' | 'moderate' | 'severe' = 'moderate';
        
        if (inputLower.includes('severe') || inputLower.includes('excruciating') || 
            inputLower.includes('unbearable') || inputLower.includes('extreme')) {
          severity = 'severe';
        } else if (inputLower.includes('mild') || inputLower.includes('slight') || 
                  inputLower.includes('minor')) {
          severity = 'mild';
        }
        
        // Determine acuity
        let acuity: 'chronic' | 'acute' | 'progressive' = 'acute';
        
        if (inputLower.includes('chronic') || inputLower.includes('years') || 
            inputLower.includes('long-term') || inputLower.includes('persistent')) {
          acuity = 'chronic';
        } else if (inputLower.includes('getting worse') || inputLower.includes('deteriorating') || 
                  inputLower.includes('progressive')) {
          acuity = 'progressive';
        }
        
        // Map relevant service categories
        const relatedCategories: ServiceCategory[] = ['physiotherapist', 'pain-management'];
        
        // Add specialized services based on region
        if (['back', 'spine', 'neck', 'shoulder', 'hip'].includes(region)) {
          relatedCategories.push('orthopedics');
        }
        
        if (['head', 'neck'].includes(region)) {
          relatedCategories.push('neurology');
        }
        
        if (region === 'joint' || inputLower.includes('arthritis')) {
          relatedCategories.push('rheumatology');
        }
        
        problems.push({
          problem: `${region} pain`,
          confidence: directMatch ? 0.9 : 0.7,
          relatedCategories,
          severity,
          acuity,
          suggestedApproach: getSuggestedApproachForPain(region, severity, acuity)
        });
        
        // Only add each region once
        break;
      }
    }
  });
  
  // MENTAL HEALTH DETECTION - Using synonym matching and refined context
  Object.entries(MENTAL_HEALTH_SYNONYMS).forEach(([condition, synonyms]) => {
    if (synonyms.some(syn => inputLower.includes(syn))) {
      let confidence = 0.7;
      let severity: 'mild' | 'moderate' | 'severe' = 'moderate';
      let acuity: 'chronic' | 'acute' | 'progressive' = 'chronic';
      
      // Check for severity indicators
      if (inputLower.includes('severe') || inputLower.includes('debilitating') || 
          inputLower.includes('can\'t function') || inputLower.includes('suicidal')) {
        severity = 'severe';
        confidence = 0.9;
      } else if (inputLower.includes('mild') || inputLower.includes('slight') || 
                inputLower.includes('sometimes')) {
        severity = 'mild';
        confidence = 0.8;
      }
      
      // Check for condition-specific language that increases confidence
      if (condition === 'anxiety' && 
          (inputLower.includes('panic attack') || 
           inputLower.includes('anxious all the time') ||
           inputLower.includes('overwhelming anxiety'))) {
        confidence = 0.95;
      }
      
      if (condition === 'depression' && 
          (inputLower.includes('lost interest') || 
           inputLower.includes('feeling hopeless') ||
           inputLower.includes('no motivation'))) {
        confidence = 0.95;
      }
      
      // Determine appropriate services based on severity
      const relatedCategories: ServiceCategory[] = [];
      
      if (severity === 'severe') {
        relatedCategories.push('psychiatry', 'psychology');
      } else if (severity === 'moderate') {
        relatedCategories.push('psychology', 'psychiatry');
      } else {
        relatedCategories.push('psychology', 'coaching');
      }
      
      problems.push({
        problem: `mental health: ${condition}`,
        confidence,
        relatedCategories,
        severity,
        acuity,
        suggestedApproach: getSuggestedApproachForMentalHealth(condition, severity)
      });
    }
  });
  
  // FITNESS GOALS - Using synonym matching with enhanced confidence scoring
  Object.entries(FITNESS_SYNONYMS).forEach(([fitnessType, synonyms]) => {
    if (synonyms.some(syn => inputLower.includes(syn))) {
      const relatedCategories: ServiceCategory[] = [];
      let confidence = 0.75;
      
      // Map fitness types to appropriate services
      switch (fitnessType) {
        case 'strength':
          relatedCategories.push('personal-trainer', 'strength-coaching');
          // Higher confidence for explicit mentions
          if (inputLower.includes('strength training') || 
              inputLower.includes('get stronger') ||
              inputLower.includes('build muscle')) {
            confidence = 0.9;
          }
          break;
        case 'cardio':
          relatedCategories.push('personal-trainer', 'run-coaching');
          if (inputLower.includes('improve endurance') ||
              inputLower.includes('run faster') ||
              inputLower.includes('cardio')) {
            confidence = 0.9;
          }
          break;
        case 'flexibility':
          relatedCategories.push('personal-trainer', 'physiotherapist');
          if (inputLower.includes('flexibility') ||
              inputLower.includes('more flexible') ||
              inputLower.includes('mobility')) {
            confidence = 0.9;
          }
          break;
        default:
          relatedCategories.push('personal-trainer');
          break;
      }
      
      // Add dietician for comprehensive approach
      relatedCategories.push('dietician');
      
      problems.push({
        problem: `fitness goal: ${fitnessType}`,
        confidence,
        relatedCategories,
        severity: 'mild', // Not applicable for goals, but required by interface
        acuity: 'progressive',
        suggestedApproach: getSuggestedApproachForFitness(fitnessType)
      });
    }
  });
  
  // DIGESTIVE ISSUES - More comprehensive detection
  Object.entries(DIGESTIVE_SYNONYMS).forEach(([issue, synonyms]) => {
    if (synonyms.some(syn => inputLower.includes(syn))) {
      const relatedCategories: ServiceCategory[] = ['gastroenterology', 'dietician'];
      let severity: 'mild' | 'moderate' | 'severe' = 'moderate';
      let confidence = 0.8;
      
      // Check for severity indicators 
      if (inputLower.includes('severe') || inputLower.includes('constant') || 
          inputLower.includes('debilitating') || inputLower.includes('extreme')) {
        severity = 'severe';
        confidence = 0.9;
        // Add family medicine for severe cases
        relatedCategories.unshift('family-medicine');
      } else if (inputLower.includes('mild') || inputLower.includes('occasional') || 
                inputLower.includes('sometimes')) {
        severity = 'mild';
        // Diet focus for mild cases
        if (!relatedCategories.includes('dietician')) {
          relatedCategories.unshift('dietician');
        }
      }
      
      problems.push({
        problem: `digestive issue: ${issue}`,
        confidence,
        relatedCategories,
        severity,
        acuity: inputLower.includes('chronic') ? 'chronic' : 'acute',
        suggestedApproach: getSuggestedApproachForDigestive(issue, severity)
      });
    }
  });
  
  // WEIGHT MANAGEMENT - Specific detection for weight-related goals
  if (inputLower.includes('weight')) {
    let weightGoal = 'weight management';
    let confidence = 0.7;
    const relatedCategories: ServiceCategory[] = ['dietician', 'personal-trainer'];
    
    // Differentiate between weight loss and weight gain
    if (inputLower.includes('lose weight') || inputLower.includes('weight loss')) {
      weightGoal = 'weight loss';
      confidence = 0.9;
    } else if (inputLower.includes('gain weight') || inputLower.includes('weight gain')) {
      weightGoal = 'weight gain';
      confidence = 0.9;
    }
    
    // Check for specific targets that increase confidence
    const weightNumberMatch = inputLower.match(/(\d+)\s*(kg|pounds|lbs)/);
    if (weightNumberMatch) {
      confidence = 0.95; // Very specific goal
    }
    
    // Add coaching for comprehensive approach
    relatedCategories.push('coaching');
    
    // Check for medical conditions that might affect weight
    if (inputLower.includes('thyroid') || inputLower.includes('diabetes') || 
        inputLower.includes('metabolic') || inputLower.includes('hormone')) {
      relatedCategories.push('endocrinology');
    }
    
    problems.push({
      problem: weightGoal,
      confidence,
      relatedCategories,
      severity: 'moderate', // Not really applicable for goals
      acuity: 'progressive',
      suggestedApproach: getSuggestedApproachForWeight(weightGoal)
    });
  }
  
  // SPECIFIC INJURY DETECTION - Look for injury-specific language
  const injuryTerms = [
    'injury', 'injured', 'sprain', 'strain', 'tear', 'torn', 'rupture',
    'broken', 'fracture', 'dislocation', 'pulled muscle'
  ];
  
  if (injuryTerms.some(term => inputLower.includes(term))) {
    let injuryType = 'injury';
    let confidence = 0.8;
    const relatedCategories: ServiceCategory[] = ['physiotherapist'];
    let severity: 'mild' | 'moderate' | 'severe' = 'moderate';
    
    // Try to identify specific injury types
    if (inputLower.includes('acl') || inputLower.includes('mcl') || 
        inputLower.includes('ligament')) {
      injuryType = 'ligament injury';
      relatedCategories.push('orthopedics');
      confidence = 0.9;
    } else if (inputLower.includes('tendon') || inputLower.includes('tendinitis') || 
              inputLower.includes('tendonitis')) {
      injuryType = 'tendon injury';
      confidence = 0.9;
    } else if (inputLower.includes('muscle') && 
              (inputLower.includes('tear') || inputLower.includes('strain'))) {
      injuryType = 'muscle injury';
      confidence = 0.9;
    } else if (inputLower.includes('fracture') || inputLower.includes('broken')) {
      injuryType = 'bone injury';
      relatedCategories.push('orthopedics');
      severity = 'severe';
      confidence = 0.95;
    }
    
    // Add sports medicine for athletic contexts
    if (inputLower.includes('sport') || inputLower.includes('athletic') || 
        inputLower.includes('running') || inputLower.includes('training')) {
      relatedCategories.push('sports-medicine');
    }
    
    // For severe injuries, add appropriate specialists
    if (severity === 'severe' || inputLower.includes('severe') || 
        inputLower.includes('surgery') || inputLower.includes('operation')) {
      severity = 'severe';
      if (!relatedCategories.includes('orthopedics')) {
        relatedCategories.push('orthopedics');
      }
    }
    
    problems.push({
      problem: injuryType,
      confidence,
      relatedCategories,
      severity,
      acuity: inputLower.includes('chronic') ? 'chronic' : 'acute',
      suggestedApproach: getSuggestedApproachForInjury(injuryType, severity)
    });
  }
  
  // Sort problems by confidence (highest first)
  return problems.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Helper function to generate appropriate treatment approaches for pain
 */
function getSuggestedApproachForPain(region: string, severity: string, acuity: string): string {
  if (severity === 'severe') {
    return `Initial medical assessment followed by targeted physiotherapy and pain management. May require imaging to assess structural issues.`;
  } else if (acuity === 'chronic') {
    return `Comprehensive pain management program combining manual therapy, exercise rehabilitation, and possibly cognitive approaches to pain.`;
  } else {
    return `Assessment and targeted physiotherapy focusing on symptom relief and restoration of normal function through manual therapy and exercise.`;
  }
}

/**
 * Helper function to generate appropriate treatment approaches for mental health
 */
function getSuggestedApproachForMentalHealth(condition: string, severity: string): string {
  if (severity === 'severe') {
    return `Combined approach with psychiatric assessment, possible medication management, and regular psychotherapy sessions.`;
  } else if (severity === 'moderate') {
    return `Regular psychotherapy sessions to develop coping strategies and address underlying issues, with optional psychiatric consultation.`;
  } else {
    return `Supportive counseling or coaching to develop self-management strategies and improve overall mental wellbeing.`;
  }
}

/**
 * Helper function to generate appropriate treatment approaches for fitness goals
 */
function getSuggestedApproachForFitness(fitnessType: string): string {
  switch (fitnessType) {
    case 'strength':
      return `Progressive resistance training program with focus on compound movements, proper technique, and appropriate nutrition to support muscle development.`;
    case 'cardio':
      return `Structured cardiorespiratory training program with periodized intensity, focusing on heart rate zones and progressive endurance building.`;
    case 'flexibility':
      return `Comprehensive mobility program combining dynamic and static stretching, myofascial release techniques, and targeted joint mobility work.`;
    default:
      return `Balanced fitness program targeting strength, cardiovascular health, flexibility, and functional movement patterns.`;
  }
}

/**
 * Helper function to generate appropriate treatment approaches for digestive issues
 */
function getSuggestedApproachForDigestive(issue: string, severity: string): string {
  if (severity === 'severe') {
    return `Medical assessment to rule out serious conditions, followed by dietary modifications and possible medical interventions based on diagnosis.`;
  } else {
    return `Dietary assessment and targeted nutrition plan to identify triggers and reduce symptoms, with focus on gut health and digestive comfort.`;
  }
}

/**
 * Helper function to generate appropriate treatment approaches for weight management
 */
function getSuggestedApproachForWeight(weightGoal: string): string {
  if (weightGoal === 'weight loss') {
    return `Comprehensive approach combining nutritional guidance, sustainable caloric deficit, and exercise program designed to preserve muscle mass while promoting fat loss.`;
  } else if (weightGoal === 'weight gain') {
    return `Structured nutrition plan to achieve caloric surplus, combined with progressive resistance training to promote lean muscle gain.`;
  } else {
    return `Balanced approach to maintain healthy weight through sustainable nutrition habits and regular physical activity.`;
  }
}

/**
 * Helper function to generate appropriate treatment approaches for injuries
 */
function getSuggestedApproachForInjury(injuryType: string, severity: string): string {
  if (severity === 'severe') {
    return `Medical assessment possibly including imaging, followed by appropriate medical interventions and rehabilitation protocol to restore function.`;
  } else {
    return `Comprehensive assessment followed by progressive rehabilitation program targeting tissue healing, restoration of movement, and return to normal function.`;
  }
}
