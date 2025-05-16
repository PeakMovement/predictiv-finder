
import { ServiceCategory } from '@/types';

/**
 * Returns a description for a given service type
 * @param serviceType The type of health service
 * @returns Description text for the service
 */
export function getServiceDescription(serviceType: ServiceCategory): string {
  const descriptions: Record<string, string> = {
    'physiotherapist': 'Treatment focused on restoring movement and function through physical rehabilitation techniques.',
    'biokineticist': 'Exercise-based therapy designed to improve functional capacity and prevent injuries.',
    'dietician': 'Personalized nutrition planning and dietary guidance for improved health outcomes.',
    'personal-trainer': 'Structured exercise programming and motivation to achieve fitness goals.',
    'pain-management': 'Specialized techniques for reducing pain and improving quality of life.',
    'coaching': 'Guidance and support for achieving health and wellness goals through behavior change.',
    'psychology': 'Therapeutic interventions to improve mental health and emotional wellbeing.',
    'psychiatry': 'Medical treatment of mental health conditions through medication and therapy.',
    'family-medicine': 'Comprehensive primary care for all ages and common health concerns.',
    'gastroenterology': 'Specialized care for digestive system disorders and conditions.',
    'neurology': 'Diagnosis and management of disorders affecting the nervous system.',
    'cardiology': 'Specialized care for heart and cardiovascular system conditions.',
    'dermatology': 'Treatment of skin conditions and disorders through medical intervention.',
    'rheumatology': 'Management of autoimmune and inflammatory conditions affecting joints and tissues.',
    'nutrition-coaching': 'Practical guidance for implementing sustainable dietary changes.',
    'strength-coaching': 'Specialized training to improve muscular strength and physical performance.',
    'run-coaches': 'Specialized coaching for improving running technique, endurance, and performance.',
    'orthopedics': 'Specialized care for musculoskeletal conditions and injuries.',
    'endocrinology': 'Management of hormonal disorders and metabolic conditions.',
    'chiropractor': 'Hands-on spinal manipulation to improve alignment and physical function.',
  };
  
  // Convert service type to lowercase and replace hyphens with spaces for matching
  const normalizedType = serviceType.toLowerCase();
  
  // Return the description if it exists, otherwise provide a generic description
  return descriptions[normalizedType] || 
    `Professional ${normalizedType.replace(/-/g, ' ')} services tailored to your health needs.`;
}

/**
 * Get service descriptions for multiple service types
 * @param serviceTypes Array of service types
 * @returns Array of service descriptions
 */
export function getServiceDescriptions(serviceTypes: ServiceCategory[]): Array<{serviceType: ServiceCategory, description: string}> {
  return serviceTypes.map(serviceType => ({
    serviceType,
    description: getServiceDescription(serviceType)
  }));
}
