
import { ServiceCategory } from "../types";

const PROFESSIONAL_MENTIONS: Record<string, ServiceCategory> = {
  'doctor': 'family-medicine',
  'physician': 'family-medicine',
  'dietician': 'dietician',
  'nutritionist': 'dietician',
  'trainer': 'personal-trainer',
  'program': 'personal-trainer',
  'meal plan': 'dietician',
  'coach': 'coaching',
  'physio': 'physiotherapist',
  'physiotherapist': 'physiotherapist',
  'therapist': 'psychiatry',
  'psychiatrist': 'psychiatry',
  'psychologist': 'psychiatry',
  'dermatologist': 'dermatology',
  'skin doctor': 'dermatology',
  'cardiologist': 'cardiology',
  'heart doctor': 'cardiology',
  'neurologist': 'neurology',
  'gastroenterologist': 'gastroenterology',
  'orthopedist': 'orthopedics',
  'rheumatologist': 'rheumatology'
};

export const detectProfessionalMentions = (inputLower: string): ServiceCategory[] => {
  const mentionedServices = new Set<ServiceCategory>();
  
  Object.entries(PROFESSIONAL_MENTIONS).forEach(([term, service]) => {
    if (inputLower.includes(term)) {
      mentionedServices.add(service);
      console.log("Adding service from professional mention:", service, "from term:", term);
    }
  });
  
  return Array.from(mentionedServices);
};
