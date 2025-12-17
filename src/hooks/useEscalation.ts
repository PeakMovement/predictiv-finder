import { useEffect, useRef } from 'react';
import { useSeverity } from '@/context/SeverityContext';
import { toast } from 'sonner';

export interface EscalationActions {
  blockCasualInteraction: boolean;
  forceEmergencyGuidance: boolean;
  showImmediateAlert: boolean;
  recommendedAction: 'none' | 'monitor' | 'schedule_soon' | 'seek_care_today' | 'emergency';
}

/**
 * Hook that handles escalation SIDE EFFECTS only.
 * All trigger logic is in SeverityContext - this hook only fires toasts and logs.
 * 
 * IMPORTANT: Do NOT add trigger logic here. Use useSeverity() directly for conditions.
 */
export function useEscalation(): EscalationActions {
  const { 
    evaluationResult, 
    isEmergency, 
    isSevere, 
    hasRedFlags,
    escalationLevel,
    shouldBlockInteraction,
  } = useSeverity();
  
  // Ref to prevent duplicate triggers for same evaluation
  const lastTriggeredKey = useRef<string | null>(null);

  // SIDE EFFECT: Fire notifications when severity changes
  useEffect(() => {
    if (!evaluationResult) {
      lastTriggeredKey.current = null;
      return;
    }

    // Create deterministic key from evaluation
    const evalKey = `${evaluationResult.overall_severity}:${evaluationResult.red_flags.sort().join(',')}:${evaluationResult.evaluated_at}`;
    
    // Prevent duplicate triggers
    if (lastTriggeredKey.current === evalKey) {
      return;
    }
    lastTriggeredKey.current = evalKey;

    console.log('[useEscalation] Triggering notifications for:', {
      severity: evaluationResult.overall_severity,
      escalationLevel,
      evalKey,
    });

    // Fire appropriate notification based on severity
    if (isEmergency) {
      toast.error('Critical Health Alert', {
        description: 'Your symptoms may require immediate medical attention. Please seek emergency care.',
        duration: Infinity,
        action: {
          label: 'Call 10177',
          onClick: () => window.open('tel:10177', '_self'),
        },
      });
      console.warn('[ESCALATION] CRITICAL - Emergency mode activated');
    } else if (isSevere) {
      toast.warning('Urgent Medical Attention Recommended', {
        description: 'Based on your symptoms, you should seek medical care soon - ideally today.',
        duration: 15000,
      });
      console.warn('[ESCALATION] SEVERE - Urgent mode activated');
    } else if (hasRedFlags) {
      toast.info('Symptoms to Monitor', {
        description: 'Some symptoms warrant attention. If they worsen, seek medical care promptly.',
        duration: 8000,
      });
      console.info('[ESCALATION] RED FLAGS - Monitor mode');
    }
  }, [evaluationResult, isEmergency, isSevere, hasRedFlags, escalationLevel]);

  // Return actions derived from context (single source of truth)
  return {
    blockCasualInteraction: shouldBlockInteraction,
    forceEmergencyGuidance: isEmergency || isSevere,
    showImmediateAlert: isEmergency || isSevere,
    recommendedAction: isEmergency 
      ? 'emergency' 
      : isSevere 
        ? 'seek_care_today' 
        : hasRedFlags 
          ? 'schedule_soon' 
          : evaluationResult 
            ? 'monitor' 
            : 'none',
  };
}

/**
 * Get human-readable escalation message based on actions
 */
export function getEscalationMessage(actions: EscalationActions): string | null {
  switch (actions.recommendedAction) {
    case 'emergency':
      return 'This is a medical emergency. Please call emergency services (10177) or go to the nearest emergency room immediately.';
    case 'seek_care_today':
      return 'Your symptoms require prompt medical attention. Please schedule an appointment for today or visit urgent care.';
    case 'schedule_soon':
      return 'Consider scheduling a medical appointment within the next few days to address these symptoms.';
    case 'monitor':
      return 'Your symptoms appear manageable. Monitor them and seek care if they worsen.';
    default:
      return null;
  }
}
