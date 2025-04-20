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
