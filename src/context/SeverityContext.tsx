import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { SeverityEvaluationResponse } from '@/services/symptom-severity-service';

export type EscalationLevel = 'none' | 'monitor' | 'caution' | 'urgent' | 'emergency';

export interface SeverityContextState {
  evaluationResult: SeverityEvaluationResponse | null;
  setEvaluationResult: (result: SeverityEvaluationResponse | null) => void;
  clearEvaluation: () => void;
  isEmergency: boolean;
  isSevere: boolean;
  hasRedFlags: boolean;
  escalationLevel: EscalationLevel;
  acknowledgeEscalation: () => void;
  isEscalationAcknowledged: boolean;
}

const SeverityContext = createContext<SeverityContextState | undefined>(undefined);

export function SeverityProvider({ children }: { children: ReactNode }) {
  const [evaluationResult, setEvaluationResultState] = useState<SeverityEvaluationResponse | null>(null);
  const [isEscalationAcknowledged, setIsEscalationAcknowledged] = useState(false);

  const setEvaluationResult = useCallback((result: SeverityEvaluationResponse | null) => {
    setEvaluationResultState(result);
    // Reset acknowledgment when new evaluation comes in
    setIsEscalationAcknowledged(false);
  }, []);

  const clearEvaluation = useCallback(() => {
    setEvaluationResultState(null);
    setIsEscalationAcknowledged(false);
  }, []);

  const acknowledgeEscalation = useCallback(() => {
    setIsEscalationAcknowledged(true);
  }, []);

  const isEmergency = evaluationResult?.overall_severity === 'critical';
  const isSevere = evaluationResult?.overall_severity === 'severe' || isEmergency;
  const hasRedFlags = (evaluationResult?.red_flags?.length ?? 0) > 0;

  // Compute escalation level
  const escalationLevel: EscalationLevel = isEmergency 
    ? 'emergency' 
    : isSevere 
      ? 'urgent' 
      : hasRedFlags 
        ? 'caution' 
        : evaluationResult 
          ? 'monitor' 
          : 'none';

  return (
    <SeverityContext.Provider
      value={{
        evaluationResult,
        setEvaluationResult,
        clearEvaluation,
        isEmergency,
        isSevere,
        hasRedFlags,
        escalationLevel,
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
