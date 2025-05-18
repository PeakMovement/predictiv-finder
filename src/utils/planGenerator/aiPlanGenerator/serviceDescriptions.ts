
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
    'personal-trainer': 'Customized personal training sessions designed to help you reach your fitness goals with expert guidance and motivation.',
    'coaching': 'Holistic coaching to help you develop behavior change strategies, set meaningful goals, and sustain long-term health habits.',
    'psychology': 'Psychological assessment and therapy focused on mental wellbeing, addressing emotional challenges and developing effective coping strategies.',
    'psychiatry': 'Psychiatric evaluation and treatment, potentially including medication management, for addressing mental health conditions.',
    'family-medicine': 'Comprehensive primary care from a family physician who coordinates your overall health management and preventative care.',
    'pain-management': 'Specialized pain assessment and multidisciplinary treatment approach to reduce pain and improve quality of life.',
    'podiatrist': 'Specialized foot and ankle care addressing issues related to gait, balance, biomechanics and foot health.',
    'general-practitioner': 'Primary healthcare provider offering comprehensive health assessment, diagnosis and treatment for a wide range of conditions.',
    'sport-physician': 'Specialized medical care for athletes and active individuals, focused on performance, injury prevention and sports-specific rehabilitation.',
    'orthopedic-surgeon': 'Expert surgical assessment and management of musculoskeletal issues, potentially including surgical interventions when necessary.',
    'gastroenterology': 'Specialized assessment and treatment of digestive system disorders and gastrointestinal health.',
    'massage-therapy': 'Therapeutic massage treatments to relieve tension, reduce stress, improve circulation and enhance recovery.',
    'nutrition-coaching': 'Practical nutrition guidance helping you improve eating habits and make sustainable dietary changes.',
    'occupational-therapy': 'Therapy focused on developing, recovering, or maintaining daily living and work skills for those with physical or mental health challenges.',
    'physical-therapy': 'Rehabilitation treatments focused on restoring movement and function after injury or managing chronic conditions.',
    'chiropractor': 'Specialized care focusing on diagnosis and treatment of neuromuscular disorders through manual adjustment of the spine.',
    'nurse-practitioner': 'Advanced practice nurse providing primary, acute and specialty healthcare services including diagnosis and treatment.',
    'cardiology': 'Specialized assessment and treatment of heart and cardiovascular system conditions.',
    'dermatology': 'Expert medical care for skin, hair and nail conditions, addressing both cosmetic and health concerns.',
    'neurology': 'Specialized assessment and treatment of conditions affecting the nervous system, brain and spinal cord.',
    'endocrinology': 'Medical specialty focused on diagnosing and managing hormone-related disorders and metabolic conditions.',
    'urology': 'Specialized care for conditions affecting the urinary tract system and male reproductive organs.',
    'oncology': 'Specialized cancer care including diagnosis, treatment planning and ongoing management.',
    'rheumatology': 'Expert care for autoimmune and inflammatory conditions affecting joints, muscles and connective tissues.',
    'pediatrics': 'Specialized healthcare for infants, children and adolescents, focusing on development and child-specific conditions.',
    'geriatrics': 'Healthcare specialized for the elderly, addressing age-related conditions and maintaining quality of life.',
    'sports-medicine': 'Specialized care for sports-related injuries and performance optimization for athletes of all levels.',
    'internal-medicine': 'Specialized care focusing on the diagnosis and treatment of complex medical conditions affecting internal organs.',
    'orthopedics': 'Specialized non-surgical treatment of musculoskeletal conditions affecting bones, joints, muscles and connective tissues.',
    'neurosurgery': 'Highly specialized surgical care for conditions affecting the brain, spine and nervous system.',
    'infectious-disease': 'Expert diagnosis and treatment of complex infections and communicable diseases.',
    'plastic-surgery': 'Surgical specialty focused on reconstruction, repair or alteration of the body for functional or aesthetic purposes.',
    'obstetrics-gynecology': 'Specialized care for women\'s health, including reproductive and maternal health services.',
    'emergency-medicine': 'Immediate care for acute illnesses and injuries requiring prompt medical attention.',
    'anesthesiology': 'Specialized care related to pain management, sedation and anesthesia during surgical procedures.',
    'radiology': 'Medical specialty using imaging techniques for diagnosis and treatment of disease.',
    'geriatric-medicine': 'Specialized healthcare for the elderly focusing on managing multiple conditions and maintaining independence.',
    'strength-coaching': 'Specialized coaching focused on improving strength, power and muscle development with expert technique guidance.',
    'run-coaching': 'Specialized coaching for runners of all levels, focusing on technique, training plans and performance improvement.',
    'all': 'Comprehensive healthcare services addressing all aspects of your physical and mental wellbeing.'
  };
  
  return descriptions[serviceType] || 'Professional healthcare services tailored to your specific needs.';
}
