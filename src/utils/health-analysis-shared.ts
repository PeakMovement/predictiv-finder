/**
 * Shared health analysis utilities used by both quick analysis and physician recommendations
 */

export interface AnalysisResult {
  primaryConcerns: string[];
  budget?: number;
  location?: string;
  recommendedDoctor: string[];
  hasEnoughInfo?: boolean;
}

/**
 * Extracts budget from prompt text (looks for R amount or amount patterns)
 */
export const extractBudgetFromText = (prompt: string): number | undefined => {
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
export const extractLocationFromText = (prompt: string): string | undefined => {
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
 * Analyzes health issue text to extract medical specialties - shared with physician service
 */
export const analyzeHealthIssueForSpecialties = (issue: string): string[] => {
  const issueLower = issue.toLowerCase();
  const specialties: string[] = [];
  
  // Map health issues to ACTUAL physician titles from CSV data
  const specialtyMappings = {
    'Physiotherapist': [
      'rehabilitation', 'mobility', 'injury recovery', 'post-surgery', 'exercise therapy',
      'movement', 'physical therapy', 'pain management', 'stiffness', 'range of motion',
      'swelling', 'muscle strength', 'back pain', 'knee pain', 'shoulder', 'hip', 'neck',
      'spine', 'joint pain', 'muscle pain', 'injury', 'hurt', 'ache', 'sore', 'tight',
      'lower back', 'upper back', 'leg pain', 'arm pain', 'ankle', 'wrist', 'elbow',
      'mobility issues', 'walking problems', 'movement difficulty', 'strain', 'sprain',
      'arthritis', 'joint stiffness', 'muscle weakness', 'balance problems',
      'sports injury', 'pulled muscle', 'running injury', 'gym injury', 'exercise injury'
    ],
    'BioKineticist': [
      'exercise', 'biomechanics', 'movement analysis', 'chronic disease', 'injury prevention',
      'rehab', 'physical assessment', 'wellness', 'orthopedic condition', 'cardiac rehab',
      'musculoskeletal', 'posture', 'fitness', 'training', 'exercise prescription',
      'movement dysfunction', 'corrective exercise', 'functional movement', 'strength training',
      'conditioning', 'performance optimization', 'chronic pain management',
      'athlete recovery', 'return to sport', 'sports performance', 'athletic performance'
    ],
    'Chiropractor': [
      'spine', 'back pain', 'alignment', 'neck pain', 'adjustment', 'posture', 'subluxation',
      'joint', 'manual therapy', 'vertebrae', 'musculoskeletal', 'headache', 'spinal',
      'chiropractic', 'spinal adjustment', 'back alignment', 'posture problems',
      'spinal manipulation', 'joint manipulation', 'vertebral', 'disc problems'
    ],
    'General Physician': [
      'fever', 'cold', 'cough', 'infection', 'check-up', 'blood pressure', 'general health',
      'flu', 'sore throat', 'runny nose', 'congestion', 'fatigue', 'body pain', 'general',
      'medical check', 'health screening', 'routine check', 'annual exam', 'physical exam',
      'medical consultation', 'health concerns', 'feeling unwell', 'sick', 'illness',
      'symptoms', 'medical advice', 'health check', 'general consultation',
      'skin', 'acne', 'rash', 'heart', 'chest pain', 'anxiety', 'depression', 'stress',
      'stomach', 'digestive', 'eye', 'vision', 'urinary', 'kidney', 'nutrition', 'diet',
      'weight loss', 'women health', 'hormonal', 'diabetes', 'thyroid'
    ]
  };
  
  // Check for specialty matches
  Object.entries(specialtyMappings).forEach(([specialty, keywords]) => {
    if (keywords.some(keyword => issueLower.includes(keyword))) {
      specialties.push(specialty);
    }
  });
  
  return [...new Set(specialties)]; // Remove duplicates
};

/**
 * Extracts primary health concerns from text
 */
export const extractPrimaryConcerns = (text: string): string[] => {
  const concerns: string[] = [];
  const textLower = text.toLowerCase();
  
  // Common health concern patterns
  const concernPatterns = [
    'pain', 'ache', 'hurt', 'sore', 'injury', 'problem', 'issue', 'condition',
    'trouble', 'difficulty', 'discomfort', 'swelling', 'inflammation', 'infection',
    'disease', 'syndrome', 'disorder', 'symptoms', 'fever', 'nausea', 'headache'
  ];
  
  concernPatterns.forEach(pattern => {
    if (textLower.includes(pattern)) {
      // Extract context around the concern
      const regex = new RegExp(`([a-zA-Z\\s]*${pattern}[a-zA-Z\\s]*)`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        concerns.push(...matches.map(match => match.trim()));
      }
    }
  });
  
  // If no specific concerns found, extract general health mentions
  if (concerns.length === 0) {
    const words = text.split(/\s+/);
    const healthWords = words.filter(word => 
      ['health', 'medical', 'doctor', 'treatment', 'therapy', 'consultation'].includes(word.toLowerCase())
    );
    if (healthWords.length > 0) {
      concerns.push('General health consultation');
    }
  }
  
  return [...new Set(concerns)].slice(0, 3); // Return max 3 unique concerns
};

/**
 * Complete analysis function used by both components
 */
export const analyzeHealthQuery = (query: string): AnalysisResult => {
  const budget = extractBudgetFromText(query);
  const location = extractLocationFromText(query);
  const recommendedDoctor = analyzeHealthIssueForSpecialties(query);
  const primaryConcerns = extractPrimaryConcerns(query);
  
  return {
    primaryConcerns,
    budget,
    location,
    recommendedDoctor
  };
};