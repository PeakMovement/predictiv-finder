import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import type { SeverityEvaluationResponse } from '@/services/symptom-severity-service';

export type EscalationLevel = 'none' | 'monitor' | 'caution' | 'urgent' | 'emergency';

/**
 * SINGLE SOURCE OF TRUTH for all severity and escalation logic.
 * All trigger conditions are computed here - no other file should derive these independently.
 */
export interface SeverityContextState {
  // Raw evaluation data
  evaluationResult: SeverityEvaluationResponse | null;
  setEvaluationResult: (result: SeverityEvaluationResponse | null) => void;
  clearEvaluation: () => void;
  
  // LOCKED TRIGGER CONDITIONS (derived, read-only)
  isEmergency: boolean;        // severity === 'critical'
  isSevere: boolean;           // severity === 'severe' OR isEmergency
  hasRedFlags: boolean;        // red_flags.length > 0
  escalationLevel: EscalationLevel;
  
  // LOCKED ESCALATION RULES (derived, read-only)
  shouldShowOverlay: boolean;  // Show blocking overlay
  shouldBlockInteraction: boolean; // Block casual progression
  requiresAcknowledgment: boolean; // Escalation requires user acknowledgment
  
  // Acknowledgment state
  acknowledgeEscalation: () => void;
  isEscalationAcknowledged: boolean;
}

const SeverityContext = createContext<SeverityContextState | undefined>(undefined);

export function SeverityProvider({ children }: { children: ReactNode }) {
  const [evaluationResult, setEvaluationResultState] = useState<SeverityEvaluationResponse | null>(null);
  const [isEscalationAcknowledged, setIsEscalationAcknowledged] = useState(false);

  const setEvaluationResult = useCallback((result: SeverityEvaluationResponse | null) => {
    setEvaluationResultState(result);
    // RULE: Reset acknowledgment when new evaluation arrives
    setIsEscalationAcknowledged(false);
    
    if (result) {
      console.log('[SeverityContext] New evaluation set:', {
        severity: result.overall_severity,
        redFlags: result.red_flags.length,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const clearEvaluation = useCallback(() => {
    setEvaluationResultState(null);
    setIsEscalationAcknowledged(false);
    console.log('[SeverityContext] Evaluation cleared');
  }, []);

  const acknowledgeEscalation = useCallback(() => {
    setIsEscalationAcknowledged(true);
    console.log('[SeverityContext] Escalation acknowledged');
  }, []);

  // LOCKED TRIGGER CONDITIONS - computed from evaluationResult only
  const derivedState = useMemo(() => {
    const severity = evaluationResult?.overall_severity;
    const redFlags = evaluationResult?.red_flags ?? [];
    
    // Primary conditions
    const isEmergency = severity === 'critical';
    const isSevere = severity === 'severe' || isEmergency;
    const hasRedFlags = redFlags.length > 0;
    
    // Escalation level (deterministic cascade)
    const escalationLevel: EscalationLevel = isEmergency 
      ? 'emergency' 
      : isSevere 
        ? 'urgent' 
        : hasRedFlags 
          ? 'caution' 
          : evaluationResult 
            ? 'monitor' 
            : 'none';
    
    // LOCKED ESCALATION RULES
    // Rule 1: Show overlay for severe/critical ONLY
    const requiresAcknowledgment = isEmergency || isSevere;
    
    // Rule 2: Overlay shown when requires acknowledgment AND not yet acknowledged
    const shouldShowOverlay = requiresAcknowledgment && !isEscalationAcknowledged;
    
    // Rule 3: Block interaction only for emergency (critical) AND not acknowledged
    const shouldBlockInteraction = isEmergency && !isEscalationAcknowledged;
    
    return {
      isEmergency,
      isSevere,
      hasRedFlags,
      escalationLevel,
      requiresAcknowledgment,
      shouldShowOverlay,
      shouldBlockInteraction,
    };
  }, [evaluationResult, isEscalationAcknowledged]);

  return (
    <SeverityContext.Provider
      value={{
        evaluationResult,
        setEvaluationResult,
        clearEvaluation,
        ...derivedState,
        acknowledgeEscalation,
        isEscalationAcknowledged,
      }}
    >
      {children}
    </SeverityContext.Provider>
  );
}

export function useSeverity() {
  const context = useContext(SeverityContext);
  if (!context) {
    throw new Error('useSeverity must be used within a SeverityProvider');
  }
  return context;
}
