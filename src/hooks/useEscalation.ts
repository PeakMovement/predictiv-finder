import { useEffect, useRef } from 'react';
import { useSeverity } from '@/context/SeverityContext';
import { toast } from 'sonner';

export interface EscalationActions {
  blockCasualInteraction: boolean;
  forceEmergencyGuidance: boolean;
  showImmediateAlert: boolean;
  recommendedAction: 'none' | 'monitor' | 'schedule_soon' | 'seek_care_today' | 'emergency';
}

// Session storage key to track if toasts were already shown this session
const TOAST_SHOWN_KEY = 'severity_toast_shown_key';

/**
 * Hook that handles escalation SIDE EFFECTS only.
 * All trigger logic is in SeverityContext - this hook only fires toasts and logs.
 * 
 * PHASE 2.2: Now prevents re-triggering toasts on navigation/refresh for same evaluation.
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
    isEscalationAcknowledged,
  } = useSeverity();
  
  // Ref to prevent duplicate triggers within same render cycle
  const lastTriggeredKey = useRef<string | null>(null);

  // SIDE EFFECT: Fire notifications when severity changes
  // Skips if evaluation was already acknowledged (re-entry protection)
  useEffect(() => {
    if (!evaluationResult) {
      lastTriggeredKey.current = null;
      return;
    }

    // Create deterministic key from evaluation
    const evalKey = `${evaluationResult.overall_severity}:${evaluationResult.red_flags.sort().join(',')}:${evaluationResult.evaluated_at}`;
    
    // Prevent duplicate triggers within same component lifecycle
    if (lastTriggeredKey.current === evalKey) {
      return;
    }
    
    // PHASE 2.2: Check sessionStorage to prevent re-triggering on refresh
    const previouslyShownKey = sessionStorage.getItem(TOAST_SHOWN_KEY);
    if (previouslyShownKey === evalKey) {
      console.log('[useEscalation] Toast already shown for this evaluation, skipping');
      lastTriggeredKey.current = evalKey;
      return;
    }
    
    // PHASE 2.2: Skip toasts if already acknowledged (prevents re-trigger on navigation)
    if (isEscalationAcknowledged) {
      console.log('[useEscalation] Evaluation already acknowledged, skipping toasts');
      lastTriggeredKey.current = evalKey;
      return;
    }
    
    lastTriggeredKey.current = evalKey;
    sessionStorage.setItem(TOAST_SHOWN_KEY, evalKey);

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
  }, [evaluationResult, isEmergency, isSevere, hasRedFlags, escalationLevel, isEscalationAcknowledged]);

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

/**
 * Clear all escalation session data (use on logout or explicit reset)
 */
export function clearEscalationSession(): void {
  sessionStorage.removeItem(TOAST_SHOWN_KEY);
  console.log('[useEscalation] Session data cleared');
}
