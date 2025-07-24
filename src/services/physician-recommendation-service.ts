import Papa from 'papaparse';

export interface Physician {
  Name: string;
  Title: string;
  Location: string;
  Experience: number;
  Price: number;
}

export interface PhysicianRecommendation extends Physician {
  affordability: 'Within budget' | 'Above budget';
  matchReason?: string;
}

export interface HealthQuery {
  prompt: string;
}

/**
 * Extracts budget from prompt text (looks for R amount or amount patterns)
 */
const extractBudget = (prompt: string): number | undefined => {
  const budgetPatterns = [
    /R\s*(\d+)/i,                          // R1000
    /budget.*?R?\s*(\d+)/i,               // budget is R1000 or budget is 1000
    /(\d+).*?per\s*month/i,               // 1000 per month
    /(\d+).*?monthly/i,                   // 1000 monthly
    /(\d+).*?budget/i,                    // 1000 budget
    /(\d+).*?rand/i,                      // 1000 rands
    /(\d+)\s*(ZAR|zar)/i,                 // 1000 ZAR
    /i have.*?(\d+)\s*(rands|rand|ZAR)/i,// I have 1000 rand
    /can spend.*?(\d+)/i,                 // can spend 1000
    /my budget.*?is.*?(\d+)/i,            // my budget is 1000
    /I can afford.*?(\d+)/i,              // I can afford 1000
    /around\s*R?\s*(\d+)/i,               // around R1000
    /upto\s*R?\s*(\d+)/i,                 // upto R1000
    /not more than\s*R?\s*(\d+)/i,        // not more than R1000
    /maximum.*?R?\s*(\d+)/i,              // maximum R1000
    /(\d+)\s*(per\s*visit|per\s*session)/i // 1000 per visit/session
  ];
  
  for (const pattern of budgetPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      const amount = parseInt(match[1]);
      // Only accept reasonable budget amounts (100-50000)
      if (amount >= 100 && amount <= 50000) {
        return amount;
      }
    }
  }
  
  return undefined;
};

/**
 * Extracts location from prompt text
 */
const extractLocation = (prompt: string): string | undefined => {
  const locationPatterns = [
    /(Johannesburg|Cape town|Durban|Pretoria|Port Elizabeth)/i, // Specific cities first
    /\bin\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)*?)(?:\s+and|\s+or|\.|$)/i, // in Johannesburg
    /location.*?([a-zA-Z]+(?:\s+[a-zA-Z]+)*?)(?:\s+and|\s+or|\.|$)/i,
    /prefer.*?([a-zA-Z]+(?:\s+[a-zA-Z]+)*?)(?:\s+location|\.|$)/i // prefer Johannesburg location
  ];
  
  for (const pattern of locationPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      const location = match[1].trim();
      // Filter out common non-location words
      const nonLocationWords = ['issues', 'and', 'or', 'the', 'for', 'with', 'my', 'budget', 'per', 'month'];
      if (!nonLocationWords.includes(location.toLowerCase()) && location.length > 2) {
        return location;
      }
    }
  }
  
  return undefined;
};

/**
 * Analyzes health issue text to extract medical specialties
 */
const analyzeHealthIssue = (issue: string): string[] => {
  const issueLower = issue.toLowerCase();
  const specialties: string[] = [];
  
  // Specialty mapping based on common health issues
  const specialtyMappings = {
    'Physiotherapist': [
      'rehabilitation', 'mobility', 'injury recovery', 'post-surgery', 'exercise therapy',
      'movement', 'physical therapy', 'pain management', 'stiffness', 'range of motion',
      'swelling', 'muscle strength', 'back pain', 'knee pain', 'shoulder', 'hip'
    ],
    'BioKineticist': [
      'exercise', 'biomechanics', 'movement analysis', 'chronic disease', 'injury prevention',
      'rehab', 'physical assessment', 'wellness', 'orthopedic condition', 'cardiac rehab',
      'musculoskeletal', 'posture', 'fitness', 'training'
    ],
    'Massage Therapist': [
      'massage', 'relaxation', 'stress relief', 'muscle tension', 'deep tissue', 'trigger point',
      'soft tissue', 'therapeutic touch', 'circulation', 'pain relief', 'wellbeing', 'bodywork'
    ],
    'Podiatrist': [
      'foot', 'ankle', 'heel pain', 'bunions', 'plantar fasciitis', 'toenail', 'orthotics',
      'gait', 'flat feet', 'diabetic foot', 'corns', 'blisters'
    ],
    'Sports Therapist': [
      'sports injury', 'sprain', 'strain', 'rehabilitation', 'athlete recovery',
      'exercise prescription', 'injury prevention', 'fitness', 'conditioning', 'training',
      'performance', 'taping', 'sports', 'athlete'
    ],
    'General Physician': [
      'fever', 'cold', 'cough', 'infection', 'check-up', 'blood pressure', 'general health',
      'diabetes', 'headache', 'digestive issues', 'fatigue', 'body pain', 'general'
    ],
    'Dietician': [
      'nutrition', 'diet', 'meal plan', 'weight loss', 'cholesterol', 'blood sugar',
      'balanced diet', 'eating habits', 'nutritional deficiency', 'diabetes', 'BMI',
      'healthy eating', 'food', 'weight'
    ],
    'Chiropractor': [
      'spine', 'back pain', 'alignment', 'neck pain', 'adjustment', 'posture', 'subluxation',
      'joint', 'manual therapy', 'vertebrae', 'musculoskeletal', 'headache', 'spinal'
    ]
  };
  
  // Check for specialty matches
  Object.entries(specialtyMappings).forEach(([specialty, keywords]) => {
    if (keywords.some(keyword => issueLower.includes(keyword))) {
      specialties.push(specialty);
    }
  });
  
  // Default to General Physician if no specialty found
  if (specialties.length === 0) {
    specialties.push('General Physician');
  }
  
  return specialties;
};

/**
 * Loads physician data from CSV file
 */
export const loadPhysicianData = async (): Promise<Physician[]> => {
  try {
    const response = await fetch('/physicians.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse<Physician>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
          }
          resolve(results.data.filter(row => row.Name && row.Title));
        },
        error: (error) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error loading physician data:', error);
    return [];
  }
};

/**
 * Implements the filtering and ranking logic as specified
 */
export const findRecommendedPhysicians = async (query: HealthQuery): Promise<PhysicianRecommendation[]> => {
  const physicians = await loadPhysicianData();
  if (physicians.length === 0) return [];

  const budget = extractBudget(query.prompt);
  const location = extractLocation(query.prompt);
  const detectedSpecialties = analyzeHealthIssue(query.prompt);

  console.log('Query analysis:', { budget, location, detectedSpecialties });

  // STEP 1: Filter by location first (mandatory if location provided)
  let availablePhysicians = physicians;
  if (location) {
    availablePhysicians = physicians.filter(p =>
      p.Location.toLowerCase().includes(location.toLowerCase())
    );
    
    console.log(`Found ${availablePhysicians.length} physicians in ${location}`);
    if (availablePhysicians.length === 0) {
      return []; // No physicians in specified location
    }
  }

  // STEP 2: Find relevant specialty within the location
  let candidatePhysicians: Physician[] = [];
  
  // Try to match detected specialties
  for (const specialty of detectedSpecialties) {
    const specialtyMatches = availablePhysicians.filter(p => p.Title === specialty);
    if (specialtyMatches.length > 0) {
      candidatePhysicians.push(...specialtyMatches);
      console.log(`Found ${specialtyMatches.length} ${specialty}(s)`);
    }
  }

  // STEP 3: Fallback to General Physician if no specialty found
  if (candidatePhysicians.length === 0) {
    console.log('No specialists found, looking for General Physicians...');
    const generalPhysicians = availablePhysicians.filter(p => 
      p.Title === 'General Physician' || 
      p.Title.toLowerCase().includes('general physician')
    );
    
    if (generalPhysicians.length > 0) {
      candidatePhysicians = generalPhysicians;
      console.log(`Using ${generalPhysicians.length} General Physician(s) as fallback`);
    } else {
      console.log('Available specialties in location:', [...new Set(availablePhysicians.map(p => p.Title))]);
      return []; // No suitable physicians found
    }
  }

  // Remove duplicates
  candidatePhysicians = candidatePhysicians.filter((physician, index, self) =>
    index === self.findIndex(p => p.Name === physician.Name)
  );

  // STEP 4: Price filtering and budget-aware categorization
  let withinBudget: Physician[] = [];
  let aboveBudget: Physician[] = [];

  if (budget !== undefined) {
    withinBudget = candidatePhysicians.filter(p => p.Price <= budget);
    aboveBudget = candidatePhysicians.filter(p => p.Price > budget);
    console.log(`Budget analysis: ${withinBudget.length} within budget, ${aboveBudget.length} above budget`);
  } else {
    withinBudget = candidatePhysicians;
  }

  // STEP 5: Sort by experience (high to low) within each budget category
  withinBudget.sort((a, b) => b.Experience - a.Experience);
  aboveBudget.sort((a, b) => b.Experience - a.Experience);

  // STEP 6: Build final selection - prioritize within budget, then above budget
  const finalSelection: Physician[] = [];
  
  // Add up to 3 within budget physicians (sorted by experience)
  finalSelection.push(...withinBudget.slice(0, 3));
  
  // If we need more results, add above budget ones
  if (finalSelection.length < 3 && aboveBudget.length > 0) {
    const remainingSlots = 3 - finalSelection.length;
    finalSelection.push(...aboveBudget.slice(0, remainingSlots));
  }

  console.log(`Final selection: ${finalSelection.length} physicians`);

  return finalSelection.map(physician => ({
    ...physician,
    affordability: budget !== undefined && physician.Price <= budget ? 'Within budget' : 'Above budget',
    matchReason: `${physician.Title} with ${physician.Experience} years experience in ${physician.Location}`
  }));
};


/**
 * Get all unique specialties from the data
 */
export const getAvailableSpecialties = async (): Promise<string[]> => {
  const physicians = await loadPhysicianData();
  return [...new Set(physicians.map(p => p.Title))].sort();
};

/**
 * Get all unique locations from the data
 */
export const getAvailableLocations = async (): Promise<string[]> => {
  const physicians = await loadPhysicianData();
  return [...new Set(physicians.map(p => p.Location))].sort();
};
