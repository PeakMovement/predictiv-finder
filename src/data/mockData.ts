
import { Practitioner, AIHealthPlan } from '../types';

export const GOALS_BY_CATEGORY = {
  'dietician': [
    'Weight loss',
    'Muscle gain',
    'Performance nutrition',
    'Managing medical conditions',
    'Healthy eating habits',
    'Specialized diets'
  ],
  'personal-trainer': [
    'Weight loss',
    'Muscle building',
    'Cardiovascular health',
    'Sport-specific training',
    'Overall fitness',
    'Strength and conditioning'
  ],
  'biokineticist': [
    'Injury rehabilitation',
    'Chronic disease management',
    'Posture correction',
    'Sports performance',
    'Fall prevention',
    'Functional movement'
  ],
  'physiotherapist': [
    'Pain management',
    'Post-surgery recovery',
    'Sports injury rehabilitation',
    'Joint mobility',
    'Chronic condition management',
    'Neurological rehabilitation'
  ],
  'coaching': [
    'Running improvement',
    'Diet adherence',
    'Strength progression',
    'Performance enhancement',
    'Form correction',
    'Competition preparation'
  ],
};

export const PRACTITIONERS: Practitioner[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    serviceType: "dietician",
    pricePerSession: 450,
    serviceTags: ["weight loss", "diabetes management", "sports nutrition"],
    location: "Cape Town",
    isOnline: true,
    availability: "Mon-Fri, 9am-5pm",
    imageUrl: "/placeholder.svg",
    bio: "Registered dietician with 10 years of experience specializing in weight management and medical nutrition therapy.",
    rating: 4.8
  },
  {
    id: "2",
    name: "Mike Peterson",
    serviceType: "personal-trainer",
    pricePerSession: 400,
    serviceTags: ["strength training", "weight loss", "functional fitness"],
    location: "Johannesburg",
    isOnline: false,
    availability: "Mon-Sat, 6am-8pm",
    imageUrl: "/placeholder.svg",
    bio: "Certified personal trainer focused on helping clients achieve sustainable results through customized workout programs.",
    rating: 4.9
  },
  {
    id: "3",
    name: "Dr. James Wilson",
    serviceType: "physiotherapist",
    pricePerSession: 600,
    serviceTags: ["sports injuries", "post-surgery", "back pain"],
    location: "Pretoria",
    isOnline: true,
    availability: "Tue-Sat, 8am-6pm",
    imageUrl: "/placeholder.svg",
    bio: "Sports physiotherapist with experience working with professional athletes and everyday patients recovering from injuries.",
    rating: 4.7
  },
  {
    id: "4",
    name: "Lisa Ndlovu",
    serviceType: "biokineticist",
    pricePerSession: 550,
    serviceTags: ["rehabilitation", "chronic conditions", "posture correction"],
    location: "Durban",
    isOnline: true,
    availability: "Mon-Fri, 7am-7pm",
    imageUrl: "/placeholder.svg",
    bio: "Specialized in orthopedic rehabilitation and chronic disease management through scientifically-based exercise programs.",
    rating: 4.6
  },
  {
    id: "5",
    name: "Trevor Makhanya",
    serviceType: "coaching",
    pricePerSession: 350,
    serviceTags: ["running", "marathon", "beginners"],
    location: "Cape Town",
    isOnline: true,
    availability: "Weekends, 5am-10am",
    imageUrl: "/placeholder.svg",
    bio: "Experienced running coach who has completed 15 marathons and helped hundreds of beginners achieve their first finish line.",
    rating: 4.9
  },
  {
    id: "6",
    name: "Anita Patel",
    serviceType: "dietician",
    pricePerSession: 500,
    serviceTags: ["plant-based", "food allergies", "digestive health"],
    location: "Johannesburg",
    isOnline: true,
    availability: "Mon-Thu, 10am-6pm",
    imageUrl: "/placeholder.svg",
    bio: "Specializing in plant-based nutrition and food sensitivities with a focus on improving digestive health naturally.",
    rating: 4.8
  },
  {
    id: "7",
    name: "David Khumalo",
    serviceType: "personal-trainer",
    pricePerSession: 450,
    serviceTags: ["bodybuilding", "sports performance", "weight loss"],
    location: "Pretoria",
    isOnline: false,
    availability: "Mon-Fri, 5am-8pm",
    imageUrl: "/placeholder.svg",
    bio: "Former competitive bodybuilder now helping clients transform their physiques and athletic performance.",
    rating: 4.7
  },
  {
    id: "8",
    name: "Emma Roberts",
    serviceType: "coaching",
    pricePerSession: 400,
    serviceTags: ["strength", "powerlifting", "technique"],
    location: "Durban",
    isOnline: true,
    availability: "Tue-Sun, 8am-8pm",
    imageUrl: "/placeholder.svg",
    bio: "National powerlifting champion coaching clients on proper lifting techniques and strength progression.",
    rating: 4.9
  },
];

export const EXAMPLE_AI_PLANS: AIHealthPlan[] = [
  {
    id: "plan1",
    name: "Knee Recovery & Return to Running Plan",
    description: "A balanced plan to rehabilitate your knee injury while preparing to resume running safely.",
    services: [
      {
        type: "physiotherapist",
        price: 600,
        sessions: 3,
        description: "Initial assessment and rehabilitation program focusing on knee stability and pain management."
      },
      {
        type: "biokineticist",
        price: 550,
        sessions: 2,
        description: "Progressive exercise therapy to rebuild strength and proper movement patterns."
      },
      {
        type: "coaching",
        price: 350,
        sessions: 1,
        description: "Running technique assessment and customized re-entry plan to prevent re-injury."
      }
    ],
    totalCost: 3250,
    planType: "best-fit",
    timeFrame: "6 weeks"
  },
  {
    id: "plan2",
    name: "High-Impact Knee Rehabilitation Focus",
    description: "Intensive physiotherapy approach to rapidly address your knee injury and establish foundation for return to running.",
    services: [
      {
        type: "physiotherapist",
        price: 600,
        sessions: 4,
        description: "Comprehensive rehabilitation program with hands-on therapy and advanced modalities."
      },
      {
        type: "coaching",
        price: 350,
        sessions: 1,
        description: "Expert guidance on running form to prevent future knee injuries."
      }
    ],
    totalCost: 2750,
    planType: "high-impact",
    timeFrame: "4 weeks"
  },
  {
    id: "plan3",
    name: "Progressive Return-to-Running Journey",
    description: "A staged approach that gradually builds from rehabilitation to running, spreading costs over time.",
    services: [
      {
        type: "physiotherapist",
        price: 600,
        sessions: 2,
        description: "Initial assessment and treatment to address pain and inflammation."
      },
      {
        type: "biokineticist",
        price: 550,
        sessions: 1,
        description: "Customized exercise program to restore function and prevent re-injury."
      },
      {
        type: "coaching",
        price: 350,
        sessions: 1,
        description: "Running program design with gradual progression milestones."
      }
    ],
    totalCost: 2100,
    planType: "progressive",
    timeFrame: "8 weeks"
  }
];
