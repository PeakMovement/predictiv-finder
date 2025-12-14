import { createContext, useContext, useState, ReactNode } from 'react';
import type { SeverityEvaluationResponse } from '@/services/symptom-severity-service';

export interface SeverityContextState {
  evaluationResult: SeverityEvaluationResponse | null;
  setEvaluationResult: (result: SeverityEvaluationResponse | null) => void;
  clearEvaluation: () => void;
  isEmergency: boolean;
  isSevere: boolean;
  hasRedFlags: boolean;
}

const SeverityContext = createContext<SeverityContextState | undefined>(undefined);

export function SeverityProvider({ children }: { children: ReactNode }) {
  const [evaluationResult, setEvaluationResult] = useState<SeverityEvaluationResponse | null>(null);

  const clearEvaluation = () => setEvaluationResult(null);

  const isEmergency = evaluationResult?.overall_severity === 'critical';
  const isSevere = evaluationResult?.overall_severity === 'severe' || isEmergency;
  const hasRedFlags = (evaluationResult?.red_flags?.length ?? 0) > 0;

  return (
    <SeverityContext.Provider
      value={{
        evaluationResult,
        setEvaluationResult,
        clearEvaluation,
        isEmergency,
        isSevere,
        hasRedFlags,
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
