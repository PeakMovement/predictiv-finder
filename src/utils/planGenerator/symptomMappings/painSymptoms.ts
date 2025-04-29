
import { SymptomMapping } from "./types";
import { ServiceCategory } from "../types";

export const PAIN_SYMPTOMS: Record<string, SymptomMapping> = {
  "ankle sprain": {
    primary: 'physiotherapist',
    specialties: ['biokineticist'],
    secondary: ['personal-trainer'],
    priority: 0.85,
    keywords: ['twisted ankle', 'ankle injury', 'rolled ankle', 'ankle pain', 'sprained ankle'],
  },
  "shoulder strain": {
    primary: 'physiotherapist',
    specialties: ['biokineticist'],
    secondary: ['personal-trainer'],
    priority: 0.85,
    keywords: ['hurt shoulder', 'injured shoulder', 'shoulder pain', 'rotator cuff', 'shoulder mobility'],
  },
  "knee pain": {
    primary: 'physiotherapist',
    specialties: ['biokineticist', 'orthopedics'],
    secondary: ['personal-trainer'],
    priority: 0.85,
    keywords: ['sore knee', 'knee injury', 'runner\'s knee', 'ACL', 'knee pain', 'knee joint pain'],
  },
  "back pain": {
    primary: 'physiotherapist',
    specialties: ['biokineticist', 'orthopedics'],
    secondary: ['personal-trainer'],
    priority: 0.9,
    keywords: ['lower back', 'back injury', 'sciatica', 'back ache', 'lumbar pain', 'spinal pain'],
  },
  "joint pain": {
    primary: 'physiotherapist',
    specialties: ['orthopedics'],
    secondary: ['biokineticist'],
    priority: 0.8,
    keywords: ['arthritis', 'joint stiffness', 'joint inflammation', 'sore joints', 'painful joints'],
  },
  "headaches": {
    primary: 'family-medicine',
    specialties: ['neurology'],
    priority: 0.8,
    keywords: ['migraines', 'head pain', 'tension headache', 'cluster headache', 'headache'],
  },
  "pain": {
    primary: 'physiotherapist',
    specialties: ['family-medicine'],
    secondary: ['pain-management'],
    priority: 0.7,
    keywords: ['ache', 'hurt', 'sore', 'discomfort', 'painful', 'aching'],
  },
  "sports injury": {
    primary: 'physiotherapist',
    specialties: ['orthopedics'],
    secondary: ['personal-trainer'],
    priority: 0.85,
    keywords: ['athletic injury', 'sports trauma', 'training injury', 'muscle tear', 'strained muscle'],
  }
};
