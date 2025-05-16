
import { ServiceCategory } from '../types';

/**
 * Get descriptive text for each service category
 * @param serviceType Type of medical/health service
 * @returns Standardized description text for the service
 */
export function getServiceDescription(serviceType: ServiceCategory): string {
  const descriptions: Record<ServiceCategory, string> = {
    'physiotherapist': 'Expert physiotherapy sessions focused on assessment, hands-on treatment, and rehabilitation exercises to restore mobility and function.',
    'biokineticist': 'Specialized biokinetic assessment and personalized exercise therapy to improve movement quality and physical functioning.',
    'dietician': 'Professional dietary assessment and personalized nutrition planning to optimize your health and achieve your nutritional goals.',
    'personal-trainer': 'Customized fitness training sessions designed to improve strength, endurance, and overall physical health.',
    'pain-management': 'Comprehensive pain management consultations using evidence-based techniques to reduce pain and improve quality of life.',
    'coaching': 'Supportive coaching sessions to help you set goals, develop strategies, and stay motivated on your health journey.',
    'psychology': 'Professional psychological support focusing on mental wellbeing, coping strategies, and emotional health.',
    'psychiatry': 'Expert psychiatric evaluation and treatment to address mental health concerns with both therapeutic and medication approaches.',
    'podiatrist': 'Specialized foot and lower limb assessment and treatment for optimal mobility and comfort.',
    'general-practitioner': 'Comprehensive medical consultations addressing general health concerns and coordinating your overall care.',
    'sport-physician': 'Specialized sports medicine consultations focused on athletic performance, injury prevention, and sports-related conditions.',
    'orthopedic-surgeon': 'Expert orthopedic evaluation focusing on musculoskeletal conditions and surgical intervention if required.',
    'family-medicine': 'Holistic family health consultations addressing preventative care and managing ongoing medical conditions.',
    'gastroenterology': 'Specialized digestive health consultations focusing on diagnosis and treatment of gastrointestinal conditions.',
    'massage-therapy': 'Therapeutic massage sessions to reduce muscle tension, improve circulation, and enhance recovery.',
    'nutrition-coaching': 'Personalized nutrition guidance to optimize diet, address specific health concerns, and reach your health goals.',
    'strength-coaching': 'Focused strength training sessions designed to build muscle, improve functional strength, and enhance physical performance.',
    'run-coaches': 'Specialized running assessment and coaching to improve technique, prevent injuries, and enhance performance.',
    'occupational-therapy': 'Practical assistance to develop, recover, or maintain daily living and work skills for better independence.',
    'physical-therapy': 'Therapeutic exercises and treatments designed to restore physical function and mobility after injury or illness.',
    'chiropractor': 'Specialized spinal adjustments and manual therapy to address musculoskeletal issues and improve function.',
    'nurse-practitioner': 'Advanced nursing consultations providing comprehensive healthcare services including diagnosis and treatment.',
    'cardiology': 'Specialized heart health consultations focusing on cardiovascular assessment, diagnosis, and management.',
    'dermatology': 'Expert skin health consultations addressing dermatological conditions and concerns.',
    'neurology': 'Specialized neurological assessment and treatment for conditions affecting the nervous system.',
    'endocrinology': 'Expert management of hormonal imbalances and endocrine system disorders.',
    'urology': 'Specialized assessment and treatment for urinary tract and reproductive system conditions.',
    'oncology': 'Comprehensive cancer care consultations providing specialized treatment and support.',
    'rheumatology': 'Expert assessment and management of autoimmune and inflammatory conditions affecting joints and connective tissues.',
    'pediatrics': 'Specialized healthcare for children focusing on development, preventive care, and childhood conditions.',
    'geriatrics': 'Comprehensive healthcare for older adults addressing age-related conditions and maintaining quality of life.',
    'sports-medicine': 'Specialized care for athletes and active individuals focusing on performance, injury prevention, and recovery.',
    'internal-medicine': 'Comprehensive care for adults focusing on prevention, diagnosis, and treatment of diseases.',
    'orthopedics': 'Specialized care for musculoskeletal conditions affecting bones, joints, and muscles.',
    'neurosurgery': 'Expert surgical intervention for conditions affecting the brain, spine, and nervous system.',
    'infectious-disease': 'Specialized care for complex infections and infectious diseases.',
    'plastic-surgery': 'Reconstructive and cosmetic surgical procedures to restore function and appearance.',
    'obstetrics-gynecology': 'Comprehensive women\'s healthcare addressing reproductive health and pregnancy.',
    'emergency-medicine': 'Urgent care for acute injuries and medical emergencies.',
    'anesthesiology': 'Specialized care in pain management and anesthesia for surgical procedures.',
    'radiology': 'Diagnostic imaging and interpretation to guide treatment decisions.',
    'geriatric-medicine': 'Specialized healthcare for the elderly addressing age-specific conditions and concerns.',
    'all': 'Comprehensive healthcare services covering all your medical and wellness needs.'
  };

  return descriptions[serviceType] || `Professional ${serviceType} services tailored to your specific health needs.`;
}

/**
 * Get session frequency recommendation based on service type
 * @param serviceType Type of medical/health service
 * @returns Recommended frequency (e.g. "weekly", "monthly")
 */
export function getRecommendedFrequency(serviceType: ServiceCategory): string {
  const frequencyMap: Partial<Record<ServiceCategory, string>> = {
    'physiotherapist': 'Weekly',
    'biokineticist': 'Twice weekly',
    'dietician': 'Monthly',
    'personal-trainer': 'Three times weekly',
    'pain-management': 'Fortnightly',
    'coaching': 'Weekly',
    'psychology': 'Weekly',
    'psychiatry': 'Monthly',
    'podiatrist': 'Quarterly',
    'general-practitioner': 'As needed',
    'sport-physician': 'As needed',
    'orthopedic-surgeon': 'As needed',
    'family-medicine': 'Quarterly',
    'gastroenterology': 'As needed',
    'massage-therapy': 'Weekly',
    'nutrition-coaching': 'Fortnightly'
  };

  return frequencyMap[serviceType] || 'As recommended by provider';
}
