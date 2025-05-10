import { ServiceCategory } from "@/types";

/**
 * Generates service descriptions based on the service type and budget level
 */
export const generateServiceDescription = (
  serviceType: string, 
  isHighEnd: boolean,
  isKneePainWithRace: boolean = false,
  medicalConditions: string[] = []
): string => {
  // Special case descriptions for knee pain + race preparation
  if (isKneePainWithRace) {
    switch (serviceType) {
      case 'physiotherapist':
        return isHighEnd 
          ? 'Specialized knee rehabilitation focused on running biomechanics and race-specific demands.' 
          : 'Targeted knee therapy to support safe race preparation and running mechanics.';
      case 'coaching':
        return isHighEnd 
          ? 'Personalized race training plan designed to accommodate knee limitations while optimizing performance.' 
          : 'Modified race preparation coaching that respects knee recovery needs.';
      case 'personal-trainer':
        return isHighEnd 
          ? 'Customized strength program focusing on knee stability, running economy, and race-specific preparation.' 
          : 'Knee-friendly training sessions that support your race goals.';
    }
  }
  
  // Special case for any back pain condition
  const hasBackPain = medicalConditions?.some(c => c?.toLowerCase().includes('back') && c?.toLowerCase().includes('pain'));
  if (hasBackPain) {
    switch (serviceType) {
      case 'physiotherapist':
        return isHighEnd 
          ? 'Comprehensive back assessment with specialized manual therapy and movement correction.' 
          : 'Back pain treatment with targeted exercises for relief and functional improvement.';
      case 'personal-trainer':
        return isHighEnd 
          ? 'Personalized training program with core stability focus to support back health.' 
          : 'Back-safe exercise sessions to build strength without aggravating pain.';
    }
  }
  
  // Special case for anxiety
  const hasAnxiety = medicalConditions?.some(c => c?.toLowerCase().includes('anxiety'));
  if (hasAnxiety) {
    switch (serviceType) {
      case 'coaching':
        return isHighEnd 
          ? 'Holistic coaching focused on mental wellness techniques and anxiety management strategies.' 
          : 'Supportive coaching sessions to develop coping skills for anxiety.';
      case 'dietician':
        return isHighEnd 
          ? 'Specialized nutrition plan addressing the connection between diet, mood, and anxiety.' 
          : 'Diet guidance to support mental wellbeing and reduce anxiety triggers.';
    }
  }

  // Standard descriptions as fallback
  const descriptions: Record<string, { affordable: string; highEnd: string }> = {
    'dietician': {
      affordable: 'Basic dietary advice and meal planning.',
      highEnd: 'Comprehensive nutritional assessment and personalized meal plans.'
    },
    'personal-trainer': {
      affordable: 'Group fitness sessions focusing on strength and endurance.',
      highEnd: 'Personalized training sessions with tailored exercise programs.'
    },
    'physiotherapist': {
      affordable: 'Standard physiotherapy sessions for rehabilitation.',
      highEnd: 'Advanced physiotherapy with specialized manual therapy.'
    },
    'cardiology': {
      affordable: 'Basic cardiac health check-up.',
      highEnd: 'Comprehensive cardiac evaluation with advanced diagnostics.'
    },
    'endocrinology': {
      affordable: 'Initial consultation for hormonal imbalances.',
      highEnd: 'Detailed endocrine assessment and personalized treatment plans.'
    },
    'internal-medicine': {
      affordable: 'General internal medicine consultation.',
      highEnd: 'Specialized internal medicine consultation with comprehensive testing.'
    },
    'gastroenterology': {
      affordable: 'Standard digestive health assessment.',
      highEnd: 'Advanced gastroenterological consultation with specialized treatment plan.'
    },
    'coaching': {
      affordable: 'Group coaching session with technique guidance and motivation',
      highEnd: 'Private coaching with personalized training plan and performance analysis'
    },
    'family-medicine': {
      affordable: "Clinical consultation with basic health assessment",
      highEnd: "Comprehensive medical evaluation with detailed health recommendations"
    },
    'biokineticist': {
      affordable: "Basic movement and biomechanical assessment",
      highEnd: "Advanced movement analysis with personalized exercise prescription"
    },
    'pediatrics': {
      affordable: "Standard pediatric health check-up",
      highEnd: "Comprehensive pediatric assessment with developmental evaluation"
    },
    'dermatology': {
      affordable: "Basic skin assessment and care recommendations",
      highEnd: "Advanced dermatological evaluation with specialized treatment"
    },
    'orthopedics': {
      affordable: "Standard orthopedic consultation",
      highEnd: "Comprehensive orthopedic evaluation with specialized treatment"
    },
    'neurology': {
      affordable: "Basic neurological check-up",
      highEnd: "Comprehensive neurological assessment with advanced diagnostics"
    },
    'obstetrics-gynecology': {
      affordable: "Standard gynecological check-up",
      highEnd: "Comprehensive women's health assessment with specialized care"
    },
    'emergency-medicine': {
      affordable: "Basic urgent care assessment",
      highEnd: "Comprehensive emergency medical evaluation"
    },
    'psychiatry': {
      affordable: "Initial mental health consultation",
      highEnd: "Comprehensive psychiatric evaluation with personalized treatment plan"
    },
    'anesthesiology': {
      affordable: "Standard pre-procedure assessment",
      highEnd: "Comprehensive anesthetic evaluation and pain management"
    },
    'urology': {
      affordable: "Basic urological health check-up",
      highEnd: "Comprehensive urological assessment with specialized treatment"
    },
    'oncology': {
      affordable: "Initial cancer screening consultation",
      highEnd: "Comprehensive oncological evaluation with personalized treatment plan"
    },
    'neurosurgery': {
      affordable: "Initial neurosurgical consultation",
      highEnd: "Comprehensive neurosurgical evaluation with specialized treatment"
    },
    'infectious-disease': {
      affordable: "Basic infectious disease screening",
      highEnd: "Comprehensive infectious disease assessment with specialized treatment"
    },
    'radiology': {
      affordable: "Standard imaging assessment",
      highEnd: "Advanced imaging with specialized interpretation"
    },
    'geriatric-medicine': {
      affordable: "Basic elder care consultation",
      highEnd: "Comprehensive geriatric assessment with specialized care plan"
    },
    'plastic-surgery': {
      affordable: "Initial cosmetic consultation",
      highEnd: "Comprehensive aesthetic evaluation with personalized treatment plan"
    },
    'rheumatology': {
      affordable: "Basic rheumatological check-up",
      highEnd: "Comprehensive rheumatological assessment with specialized treatment"
    },
    'pain-management': {
      affordable: "Basic pain assessment and treatment",
      highEnd: "Comprehensive pain evaluation with multimodal treatment plan"
    }
  };

  return isHighEnd ? 
    descriptions[serviceType]?.highEnd || "Premium specialized service" : 
    descriptions[serviceType]?.affordable || "Standard service";
};
