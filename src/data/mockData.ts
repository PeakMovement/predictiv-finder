
import { DIETICIANS } from './practitioners/dieticians';
import { PHYSIOTHERAPISTS } from './practitioners/physiotherapists';
import { BIOKINETICISTS } from './practitioners/biokineticists';
import { COACHES } from './practitioners/coaches';
import { DOCTORS } from './practitioners/doctors';
import { RUN_COACHES } from './practitioners/run-coaches';
import { STRENGTH_COACHES } from './practitioners/strength-coaches';
import { NUTRITION_COACHES } from './practitioners/nutrition-coaches';
import { AIHealthPlan } from '@/types';

export const PRACTITIONERS = [
  ...DOCTORS,
  ...DIETICIANS,
  ...PHYSIOTHERAPISTS,
  ...BIOKINETICISTS,
  ...COACHES,
  ...RUN_COACHES,
  ...STRENGTH_COACHES,
  ...NUTRITION_COACHES
];

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

export const EXAMPLE_AI_PLANS: AIHealthPlan[] = [
  {
    id: "plan1",
    name: "Comprehensive Knee Recovery Plan",
    description: "A multidisciplinary approach to rehabilitate your knee injury while preparing to resume running safely with expert supervision.",
    services: [
      {
        type: "physiotherapist",
        price: 600,
        sessions: 3,
        description: "Initial assessment and rehabilitation program focusing on knee stability, pain management, and progressive mobility improvements."
      },
      {
        type: "biokineticist",
        price: 550,
        sessions: 2,
        description: "Specialized exercise therapy to rebuild knee strength, improve movement patterns, and restore functional capacity."
      },
      {
        type: "coaching",
        price: 350,
        sessions: 1,
        description: "Running technique assessment and customized re-entry plan with gradual progression to prevent re-injury."
      },
      {
        type: "family-medicine",
        price: 400,
        sessions: 1,
        description: "Medical evaluation to rule out structural damage and develop a comprehensive recovery timeline."
      }
    ],
    totalCost: 3650,
    planType: "best-fit",
    timeFrame: "8 weeks"
  },
  {
    id: "plan2",
    name: "High-Impact Knee Rehabilitation Focus",
    description: "Intensive therapeutic approach to rapidly address your knee injury with modern treatment modalities and establish a solid foundation for return to running.",
    services: [
      {
        type: "physiotherapist",
        price: 600,
        sessions: 4,
        description: "Comprehensive rehabilitation program with hands-on therapy, advanced modalities, and progressive movement protocols."
      },
      {
        type: "coaching",
        price: 350,
        sessions: 1,
        description: "Expert guidance on running form modifications and biomechanical assessment to prevent future knee injuries."
      },
      {
        type: "biokineticist",
        price: 550,
        sessions: 1,
        description: "Advanced movement screening and corrective exercise programming to address underlying movement dysfunctions."
      }
    ],
    totalCost: 3300,
    planType: "high-impact",
    timeFrame: "4 weeks"
  },
  {
    id: "plan3",
    name: "Progressive Return-to-Running Journey",
    description: "A staged approach that gradually builds from rehabilitation to running, spreading costs over time with multi-disciplinary support.",
    services: [
      {
        type: "physiotherapist",
        price: 600,
        sessions: 2,
        description: "Initial assessment and targeted treatment to address pain, inflammation, and restricted mobility."
      },
      {
        type: "biokineticist",
        price: 550,
        sessions: 1,
        description: "Customized exercise program to restore function, improve stability, and prevent re-injury."
      },
      {
        type: "coaching",
        price: 350,
        sessions: 1,
        description: "Running program design with gradual progression milestones and technique refinement."
      },
      {
        type: "dietician",
        price: 350,
        sessions: 1,
        description: "Anti-inflammatory nutrition strategy to support tissue healing and recovery."
      }
    ],
    totalCost: 2450,
    planType: "progressive",
    timeFrame: "10 weeks"
  }
];
