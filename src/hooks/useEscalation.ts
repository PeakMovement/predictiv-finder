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
 * Hook that automatically triggers escalation behaviors when severity crosses thresholds.
 * This runs side effects when severity evaluation results change.
 */
export function useEscalation(): EscalationActions {
  const { evaluationResult, isEmergency, isSevere, hasRedFlags } = useSeverity();
  const hasTriggeredRef = useRef<string | null>(null);

  // Determine escalation actions based on current severity
  const actions: EscalationActions = {
    blockCasualInteraction: isEmergency,
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

  // Auto-trigger notifications when severity changes
  useEffect(() => {
    if (!evaluationResult) return;

    // Create a unique key for this evaluation to prevent duplicate triggers
    const evalKey = `${evaluationResult.overall_severity}-${evaluationResult.red_flags.join(',')}`;
    
    // Don't re-trigger for the same evaluation
    if (hasTriggeredRef.current === evalKey) return;
    hasTriggeredRef.current = evalKey;

    // Automatic escalation based on severity
    if (isEmergency) {
      // Critical severity - immediate action required
      toast.error('Critical Health Alert', {
        description: 'Your symptoms may require immediate medical attention. Please seek emergency care.',
        duration: Infinity, // Don't auto-dismiss critical alerts
        action: {
          label: 'Call 10177',
          onClick: () => window.open('tel:10177', '_self'),
        },
      });
      
      // Log escalation event
      console.warn('[ESCALATION] Critical severity detected - emergency mode activated', {
        severity: evaluationResult.overall_severity,
        redFlags: evaluationResult.red_flags,
        timestamp: new Date().toISOString(),
      });
    } else if (isSevere) {
      // Severe severity - urgent attention needed
      toast.warning('Urgent Medical Attention Recommended', {
        description: 'Based on your symptoms, you should seek medical care soon - ideally today.',
        duration: 15000,
      });
      
      console.warn('[ESCALATION] Severe severity detected - urgent mode activated', {
        severity: evaluationResult.overall_severity,
        redFlags: evaluationResult.red_flags,
        timestamp: new Date().toISOString(),
      });
    } else if (hasRedFlags) {
      // Red flags present but not severe - monitor
      toast.info('Symptoms to Monitor', {
        description: 'Some symptoms warrant attention. If they worsen, seek medical care promptly.',
        duration: 8000,
      });
    }
  }, [evaluationResult, isEmergency, isSevere, hasRedFlags]);

  return actions;
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
