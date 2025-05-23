
import { ServiceCategory } from "../types";

// Enhanced treatment option interface with additional constraints
export interface EnhancedTreatmentOption {
  id: string;
  name: string;
  category: string;
  serviceType: ServiceCategory;
  practitioner: string;
  cost: number;
  recommendedFrequency: number;
  utility: number;
  minSessions: number;
  maxSessions: number;
  timeRequired: number; // in minutes
  deliveryType: 'in-person' | 'remote' | 'hybrid';
  location: string;
  goalTags: string[];
  urgency: 'low' | 'medium' | 'high';
  utilityPerRand: number;
  timeToBefit: number; // in weeks
  constraints: {
    availability?: string;
    maxClients?: number;
    timeSlots?: string[];
    otherLimitations?: string;
  };
}

// Sample treatment options from the spreadsheet
export const treatmentOptions: EnhancedTreatmentOption[] = [
  {
    id: "T1",
    name: "Physio Session A",
    category: "Back Pain",
    serviceType: "physiotherapist",
    practitioner: "Physio A",
    cost: 400,
    recommendedFrequency: 2,
    utility: 3,
    minSessions: 1,
    maxSessions: 4,
    timeRequired: 60,
    deliveryType: "in-person",
    location: "Cape Town - CBD",
    goalTags: ["pain relief", "back pain", "mobility"],
    urgency: "high",
    utilityPerRand: 0.0075,
    timeToBefit: 4,
    constraints: {
      availability: "Available Mon/Wed/Fri only"
    }
  },
  {
    id: "T2",
    name: "Dietician Consultation B",
    category: "Weight Loss",
    serviceType: "dietician",
    practitioner: "Dietician B",
    cost: 600,
    recommendedFrequency: 1,
    utility: 4,
    minSessions: 1,
    maxSessions: 2,
    timeRequired: 45,
    deliveryType: "remote",
    location: "Online",
    goalTags: ["weight loss", "nutrition", "fat loss"],
    urgency: "medium",
    utilityPerRand: 0.0067,
    timeToBefit: 6,
    constraints: {
      maxClients: 10
    }
  },
  {
    id: "T3",
    name: "Back Pain Session A",
    category: "Back Pain",
    serviceType: "physiotherapist",
    practitioner: "Physio A",
    cost: 450,
    recommendedFrequency: 2,
    utility: 4,
    minSessions: 1,
    maxSessions: 3,
    timeRequired: 45,
    deliveryType: "in-person",
    location: "Cape Town - CBD",
    goalTags: ["pain relief", "back pain", "mobility"],
    urgency: "high",
    utilityPerRand: 0.00889,
    timeToBefit: 3,
    constraints: {
      availability: "Available Weekends only"
    }
  },
  {
    id: "T4",
    name: "Weight Loss Plan B",
    category: "Weight Loss",
    serviceType: "dietician",
    practitioner: "Dietician B",
    cost: 600,
    recommendedFrequency: 2,
    utility: 3,
    minSessions: 1,
    maxSessions: 3,
    timeRequired: 30,
    deliveryType: "remote",
    location: "Online",
    goalTags: ["weight loss", "nutrition", "metabolism"],
    urgency: "medium",
    utilityPerRand: 0.005,
    timeToBefit: 4,
    constraints: {
      availability: "Flexible"
    }
  },
  {
    id: "T5",
    name: "Anxiety Therapy C",
    category: "Anxiety",
    serviceType: "psychology",
    practitioner: "Psychologist C",
    cost: 750,
    recommendedFrequency: 3,
    utility: 5,
    minSessions: 2,
    maxSessions: 4,
    timeRequired: 60,
    deliveryType: "in-person",
    location: "Sea Point",
    goalTags: ["mental health", "stress", "anxiety"],
    urgency: "high",
    utilityPerRand: 0.00667,
    timeToBefit: 6,
    constraints: {
      maxClients: 5,
      availability: "Daily limit"
    }
  },
  {
    id: "T6",
    name: "Marathon Coaching D",
    category: "Marathon Training",
    serviceType: "coaching",
    practitioner: "Coach D",
    cost: 500,
    recommendedFrequency: 3,
    utility: 4,
    minSessions: 2,
    maxSessions: 4,
    timeRequired: 60,
    deliveryType: "remote",
    location: "Online",
    goalTags: ["running", "endurance", "performance"],
    urgency: "medium",
    utilityPerRand: 0.008,
    timeToBefit: 5,
    constraints: {
      availability: "Available Tue/Thu"
    }
  },
  {
    id: "T7",
    name: "Posture Align Session E",
    category: "Posture Correction",
    serviceType: "chiropractor",
    practitioner: "Chiropractor E",
    cost: 550,
    recommendedFrequency: 2,
    utility: 3,
    minSessions: 1,
    maxSessions: 3,
    timeRequired: 45,
    deliveryType: "in-person",
    location: "Southern Suburbs",
    goalTags: ["posture", "alignment", "spine health"],
    urgency: "low",
    utilityPerRand: 0.00545,
    timeToBefit: 4,
    constraints: {
      availability: "Available mornings"
    }
  },
  {
    id: "T8",
    name: "Rehab Recovery Plan F",
    category: "Rehabilitation",
    serviceType: "physiotherapist",
    practitioner: "Physio F",
    cost: 700,
    recommendedFrequency: 3,
    utility: 4,
    minSessions: 2,
    maxSessions: 4,
    timeRequired: 60,
    deliveryType: "in-person",
    location: "Cape Town - CBD",
    goalTags: ["rehab", "muscle injury", "mobility"],
    urgency: "high",
    utilityPerRand: 0.00571,
    timeToBefit: 6,
    constraints: {
      availability: "Flexible"
    }
  },
  {
    id: "T9",
    name: "Hypertrophy Training G",
    category: "Muscle Building",
    serviceType: "personal-trainer",
    practitioner: "Trainer G",
    cost: 400,
    recommendedFrequency: 4,
    utility: 4,
    minSessions: 3,
    maxSessions: 5,
    timeRequired: 60,
    deliveryType: "in-person",
    location: "Sea Point",
    goalTags: ["muscle growth", "strength", "fitness"],
    urgency: "medium",
    utilityPerRand: 0.01,
    timeToBefit: 5,
    constraints: {
      availability: "Available Tue/Thu"
    }
  },
  {
    id: "T10",
    name: "Macro Planning H",
    category: "Nutrition Planning",
    serviceType: "dietician",
    practitioner: "Dietician H",
    cost: 500,
    recommendedFrequency: 2,
    utility: 3,
    minSessions: 1,
    maxSessions: 3,
    timeRequired: 30,
    deliveryType: "remote",
    location: "Online",
    goalTags: ["macro tracking", "healthy eating"],
    urgency: "low",
    utilityPerRand: 0.006,
    timeToBefit: 4,
    constraints: {
      maxClients: 5,
      availability: "Daily limit"
    }
  },
  {
    id: "T11",
    name: "Online Yoga Flow I",
    category: "Online Yoga",
    serviceType: "yoga-instructor",
    practitioner: "Yoga Instructor I",
    cost: 300,
    recommendedFrequency: 4,
    utility: 3,
    minSessions: 3,
    maxSessions: 5,
    timeRequired: 60,
    deliveryType: "remote",
    location: "Online",
    goalTags: ["flexibility", "mindfulness", "recovery"],
    urgency: "low",
    utilityPerRand: 0.01,
    timeToBefit: 3,
    constraints: {
      availability: "Available mornings"
    }
  },
  {
    id: "T12",
    name: "Mindfulness Therapy J",
    category: "Mental Wellness",
    serviceType: "psychology",
    practitioner: "Therapist J",
    cost: 650,
    recommendedFrequency: 2,
    utility: 4,
    minSessions: 1,
    maxSessions: 3,
    timeRequired: 60,
    deliveryType: "in-person",
    location: "Southern Suburbs",
    goalTags: ["calm", "clarity", "anxiety relief"],
    urgency: "medium",
    utilityPerRand: 0.00615,
    timeToBefit: 5,
    constraints: {
      availability: "Flexible"
    }
  }
];

// Helper function to get treatments by category
export const getTreatmentsByCategory = (category: string): EnhancedTreatmentOption[] => {
  return treatmentOptions.filter(treatment => 
    treatment.category.toLowerCase() === category.toLowerCase()
  );
};

// Helper function to get treatments by location
export const getTreatmentsByLocation = (location: string): EnhancedTreatmentOption[] => {
  if (location.toLowerCase() === "online") {
    return treatmentOptions.filter(treatment => 
      treatment.deliveryType === "remote"
    );
  }
  
  return treatmentOptions.filter(treatment => 
    treatment.location.toLowerCase().includes(location.toLowerCase()) || 
    treatment.deliveryType === "remote"
  );
};

// Helper function to get treatments by goal tags
export const getTreatmentsByGoal = (goalKeywords: string[]): EnhancedTreatmentOption[] => {
  return treatmentOptions.filter(treatment => 
    goalKeywords.some(keyword => 
      treatment.goalTags.some(tag => 
        tag.toLowerCase().includes(keyword.toLowerCase())
      )
    )
  );
};

// Helper function to filter treatments by availability
export const getTreatmentsByAvailability = (
  dayOfWeek: string, 
  timeOfDay?: 'morning' | 'afternoon' | 'evening'
): EnhancedTreatmentOption[] => {
  const dayLower = dayOfWeek.toLowerCase();
  
  return treatmentOptions.filter(treatment => {
    // If availability is flexible, always include
    if (treatment.constraints.availability?.toLowerCase().includes('flexible')) {
      return true;
    }
    
    const availLower = treatment.constraints.availability?.toLowerCase() || '';
    
    // Check for specific day
    if (dayLower === 'weekend' && availLower.includes('weekend')) {
      return true;
    }
    
    if ((dayLower === 'monday' || dayLower === 'mon') && availLower.includes('mon')) {
      return true;
    }
    
    if ((dayLower === 'tuesday' || dayLower === 'tue') && availLower.includes('tue')) {
      return true;
    }
    
    if ((dayLower === 'wednesday' || dayLower === 'wed') && availLower.includes('wed')) {
      return true;
    }
    
    if ((dayLower === 'thursday' || dayLower === 'thu') && availLower.includes('thu')) {
      return true;
    }
    
    if ((dayLower === 'friday' || dayLower === 'fri') && availLower.includes('fri')) {
      return true;
    }
    
    // Check for time of day if specified
    if (timeOfDay && availLower.includes(timeOfDay)) {
      return true;
    }
    
    return false;
  });
};
