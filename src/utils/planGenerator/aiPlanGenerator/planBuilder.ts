
import { AIHealthPlan, Practitioner, ServiceCategory } from "@/types";
import { OptimizedService } from "@/utils/planGenerator/types";
import { getMockPractitioners } from "./mockData";
import { generateUniqueId } from "@/utils/idGenerator";

interface PlanBuilderOptions {
  planType: AIHealthPlan['planType'];
  timeFrame: string;
  description?: string;
  customName?: string;
  customTotalCost?: number;
  includePractitioners?: boolean;
  expectedOutcomes?: AIHealthPlan['expectedOutcomes'];
  rationales?: AIHealthPlan['rationales'];
  progressTimeline?: AIHealthPlan['progressTimeline'];
  alternativeOptions?: AIHealthPlan['alternativeOptions'];
}

export function buildHealthPlan(
  services: OptimizedService[],
  options: PlanBuilderOptions
): AIHealthPlan {
  // Default name based on plan type
  let planName = "";
  switch (options.planType) {
    case 'best-fit':
      planName = "Balanced Health Plan";
      break;
    case 'high-impact':
      planName = "Intensive Health Plan";
      break;
    case 'progressive':
      planName = "Progressive Health Plan";
      break;
    default:
      planName = "Customized Health Plan";
  }
  
  // Use custom name if provided
  if (options.customName) {
    planName = options.customName;
  }
  
  // Generate a default description if none provided
  const serviceTypes = services.map(s => s.type);
  // Convert array to string first
  const serviceTypeNames = Array.isArray(serviceTypes) ? 
    serviceTypes.map(type => String(type).replace(/-/g, ' ')).join(', ') : 
    String(serviceTypes).replace(/-/g, ' ');
  
  const description = options.description || 
    `A ${options.timeFrame} health plan designed to address your specific needs with a combination of ${serviceTypeNames}.`;
  
  // Calculate total cost or use provided cost
  const totalCost = options.customTotalCost !== undefined
    ? options.customTotalCost
    : services.reduce((sum, service) => sum + service.totalCost, 0);
  
  // Get practitioners if needed
  let enhancedServices = services.map(service => {
    // Ensure frequency is present for all services
    const frequency = service.frequency || "weekly";
    
    const planService = {
      type: service.type,
      price: service.costPerSession,
      sessions: service.sessions,
      description: getServiceDescription(service.type, service.sessions),
      frequency: frequency
    };
    
    // Add practitioners if needed
    if (options.includePractitioners) {
      const practitioners = getMockPractitioners(service.type, 2);
      return {
        ...planService,
        recommendedPractitioners: practitioners
      };
    }
    
    return planService;
  });
  
  // Build the complete health plan
  const plan: AIHealthPlan = {
    id: generateUniqueId(),
    name: planName,
    description: description,
    services: enhancedServices,
    totalCost: totalCost,
    planType: options.planType,
    timeFrame: options.timeFrame
  };
  
  // Add optional fields if provided
  if (options.expectedOutcomes) {
    plan.expectedOutcomes = options.expectedOutcomes;
  }
  
  if (options.rationales) {
    plan.rationales = options.rationales;
  }
  
  if (options.progressTimeline) {
    plan.progressTimeline = options.progressTimeline;
  }
  
  if (options.alternativeOptions) {
    plan.alternativeOptions = options.alternativeOptions;
  }
  
  return plan;
}

/**
 * Generate a descriptive text for a service based on type and session count
 */
function getServiceDescription(type: ServiceCategory, sessions: number): string {
  const descriptions: Record<string, (sessions: number) => string> = {
    'physiotherapist': (sessions) => 
      `${sessions} sessions with a qualified physiotherapist to assess, treat, and rehabilitate physical conditions through specialized techniques.`,
    
    'biokineticist': (sessions) => 
      `${sessions} sessions with a biokineticist focusing on improving your physical functioning and movement through exercise-based rehabilitation.`,
    
    'dietician': (sessions) => 
      `${sessions} consultations with a registered dietician who will create a personalized nutrition plan and provide ongoing guidance.`,
    
    'personal-trainer': (sessions) => 
      `${sessions} sessions with a certified personal trainer who will design and guide you through personalized workout routines.`,
    
    'pain-management': (sessions) => 
      `${sessions} specialized pain management sessions to address chronic or acute pain through various therapeutic approaches.`,
    
    'coaching': (sessions) => 
      `${sessions} coaching sessions to provide motivation, accountability, and strategies to help you achieve your health and wellness goals.`,
    
    'psychology': (sessions) => 
      `${sessions} sessions with a psychologist to address mental health concerns and develop coping strategies through evidence-based therapy.`,
    
    'psychiatry': (sessions) => 
      `${sessions} consultations with a psychiatrist to assess mental health conditions and manage treatment, including medication if appropriate.`,
    
    // Add descriptions for ALL service categories
    'podiatrist': (sessions) => 
      `${sessions} sessions with a podiatrist focusing on diagnosis, treatment, and prevention of foot and ankle problems.`,
    
    'general-practitioner': (sessions) => 
      `${sessions} consultations with a general practitioner for comprehensive primary healthcare and medical advice.`,
    
    'sport-physician': (sessions) => 
      `${sessions} sessions with a sport physician specializing in the treatment and prevention of sports-related injuries and conditions.`,
    
    'orthopedic-surgeon': (sessions) => 
      `${sessions} consultations with an orthopedic surgeon specializing in conditions affecting the musculoskeletal system.`,
    
    'family-medicine': (sessions) => 
      `${sessions} appointments with a family medicine doctor for comprehensive healthcare for individuals and families across all ages.`,
    
    'gastroenterology': (sessions) => 
      `${sessions} consultations with a gastroenterologist focusing on digestive system disorders and treatment.`,
    
    'massage-therapy': (sessions) => 
      `${sessions} massage therapy sessions to relieve muscle tension, improve circulation, and promote relaxation and wellness.`,
    
    'nutrition-coach': (sessions) => 
      `${sessions} sessions with a nutrition coach to develop healthy eating habits and practical food strategies for your lifestyle.`,
    
    'occupational-therapy': (sessions) => 
      `${sessions} occupational therapy sessions to develop, recover, or maintain daily living and work skills.`,
    
    'physical-therapy': (sessions) => 
      `${sessions} physical therapy sessions focused on restoring movement and function through specialized exercises and techniques.`,
    
    'chiropractor': (sessions) => 
      `${sessions} chiropractic sessions focusing on diagnosis and treatment of mechanical disorders of the musculoskeletal system.`,
    
    'nurse-practitioner': (sessions) => 
      `${sessions} consultations with a nurse practitioner providing comprehensive healthcare services and education.`,
    
    'cardiology': (sessions) => 
      `${sessions} cardiology consultations for assessment, diagnosis, and treatment of heart-related conditions.`,
    
    'dermatology': (sessions) => 
      `${sessions} dermatology sessions for diagnosis and treatment of skin, hair, and nail conditions.`,
    
    'neurology': (sessions) => 
      `${sessions} neurology consultations focused on disorders of the nervous system including brain, spinal cord, and nerves.`,
    
    'endocrinology': (sessions) => 
      `${sessions} endocrinology consultations for hormonal and metabolic disorders assessment and management.`,
    
    'urology': (sessions) => 
      `${sessions} urology consultations for diagnosis and treatment of conditions affecting the urinary tract and reproductive organs.`,
    
    'oncology': (sessions) => 
      `${sessions} oncology consultations for cancer care, including diagnosis, treatment options, and management.`,
    
    'rheumatology': (sessions) => 
      `${sessions} rheumatology sessions for diagnosis and treatment of autoimmune and inflammatory conditions affecting joints and muscles.`,
    
    'pediatrics': (sessions) => 
      `${sessions} pediatric consultations for comprehensive healthcare for children, focusing on growth, development, and wellness.`,
    
    'geriatrics': (sessions) => 
      `${sessions} geriatric consultations specializing in the health needs and care of older adults.`,
    
    'sports-medicine': (sessions) => 
      `${sessions} sports medicine sessions focusing on physical fitness and treatment of sports-related injuries.`,
    
    'internal-medicine': (sessions) => 
      `${sessions} internal medicine consultations for comprehensive adult healthcare, focusing on diagnosis and treatment of complex conditions.`,
    
    'orthopedics': (sessions) => 
      `${sessions} orthopedic consultations focusing on injuries and diseases of the musculoskeletal system.`,
    
    'neurosurgery': (sessions) => 
      `${sessions} neurosurgery consultations for evaluation and surgical treatment options for disorders of the nervous system.`,
    
    'infectious-disease': (sessions) => 
      `${sessions} infectious disease consultations for diagnosis and treatment of infections caused by bacteria, viruses, fungi or parasites.`,
    
    'plastic-surgery': (sessions) => 
      `${sessions} plastic surgery consultations for reconstructive or cosmetic surgical procedures.`,
    
    'obstetrics-gynecology': (sessions) => 
      `${sessions} obstetrics and gynecology consultations focusing on women's reproductive health.`,
    
    'emergency-medicine': (sessions) => 
      `${sessions} emergency medicine consultations for acute illnesses and injuries requiring immediate medical attention.`,
    
    'anesthesiology': (sessions) => 
      `${sessions} anesthesiology consultations for pain management strategies before, during, and after surgical procedures.`,
    
    'radiology': (sessions) => 
      `${sessions} radiology appointments for diagnostic imaging services to identify and monitor various medical conditions.`,
    
    'geriatric-medicine': (sessions) => 
      `${sessions} geriatric medicine consultations focused on healthcare needs specific to elderly patients.`,
    
    'all': (sessions) => 
      `${sessions} comprehensive healthcare sessions addressing multiple aspects of your wellness journey.`
  };
  
  return descriptions[type] 
    ? descriptions[type](sessions) 
    : `${sessions} sessions with a ${String(type).replace(/-/g, ' ')} specialist tailored to your specific health needs.`;
}
