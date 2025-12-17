import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import type { SeverityEvaluationResponse } from '@/services/symptom-severity-service';

export type EscalationLevel = 'none' | 'monitor' | 'caution' | 'urgent' | 'emergency';

// Session storage keys
const STORAGE_KEYS = {
  EVALUATION: 'severity_evaluation',
  ACKNOWLEDGED_KEY: 'severity_acknowledged_key',
} as const;

/**
 * Generate a deterministic key from evaluation data for acknowledgment tracking.
 * This prevents re-showing overlay for the same evaluation after refresh.
 */
function generateEvaluationKey(result: SeverityEvaluationResponse | null): string | null {
  if (!result) return null;
  return `${result.overall_severity}:${result.red_flags.sort().join(',')}:${result.evaluated_at}`;
}

/**
 * SINGLE SOURCE OF TRUTH for all severity and escalation logic.
 * All trigger conditions are computed here - no other file should derive these independently.
 * 
 * PHASE 2.2: Now includes session persistence to prevent re-triggering on refresh/navigation.
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

/**
 * Load evaluation from sessionStorage on mount.
 * Returns null if not found or invalid.
 */
function loadStoredEvaluation(): SeverityEvaluationResponse | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.EVALUATION);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored) as SeverityEvaluationResponse;
    // Validate required fields exist
    if (!parsed.overall_severity || !Array.isArray(parsed.red_flags)) {
      console.warn('[SeverityContext] Invalid stored evaluation, clearing');
      sessionStorage.removeItem(STORAGE_KEYS.EVALUATION);
      return null;
    }
    
    console.log('[SeverityContext] Restored evaluation from session:', {
      severity: parsed.overall_severity,
      redFlags: parsed.red_flags.length,
    });
    return parsed;
  } catch (error) {
    console.warn('[SeverityContext] Failed to load stored evaluation:', error);
    sessionStorage.removeItem(STORAGE_KEYS.EVALUATION);
    return null;
  }
}

/**
 * Check if the given evaluation key was already acknowledged in this session.
 */
function isKeyAcknowledged(evalKey: string | null): boolean {
  if (!evalKey) return false;
  const storedKey = sessionStorage.getItem(STORAGE_KEYS.ACKNOWLEDGED_KEY);
  return storedKey === evalKey;
}

export function SeverityProvider({ children }: { children: ReactNode }) {
  // Initialize from sessionStorage for refresh persistence
  const [evaluationResult, setEvaluationResultState] = useState<SeverityEvaluationResponse | null>(() => loadStoredEvaluation());
  const [isEscalationAcknowledged, setIsEscalationAcknowledged] = useState(() => {
    // Check if current evaluation was already acknowledged
    const stored = loadStoredEvaluation();
    const key = generateEvaluationKey(stored);
    return isKeyAcknowledged(key);
  });

  // Persist evaluation to sessionStorage
  useEffect(() => {
    if (evaluationResult) {
      sessionStorage.setItem(STORAGE_KEYS.EVALUATION, JSON.stringify(evaluationResult));
      console.log('[SeverityContext] Evaluation persisted to session');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.EVALUATION);
      sessionStorage.removeItem(STORAGE_KEYS.ACKNOWLEDGED_KEY);
      console.log('[SeverityContext] Session cleared');
    }
  }, [evaluationResult]);

  const setEvaluationResult = useCallback((result: SeverityEvaluationResponse | null) => {
    setEvaluationResultState(result);
    
    if (result) {
      const newKey = generateEvaluationKey(result);
      // Check if this specific evaluation was already acknowledged
      const wasAcknowledged = isKeyAcknowledged(newKey);
      setIsEscalationAcknowledged(wasAcknowledged);
      
      console.log('[SeverityContext] New evaluation set:', {
        severity: result.overall_severity,
        redFlags: result.red_flags.length,
        evalKey: newKey,
        previouslyAcknowledged: wasAcknowledged,
        timestamp: new Date().toISOString(),
      });
    } else {
      setIsEscalationAcknowledged(false);
    }
  }, []);

  const clearEvaluation = useCallback(() => {
    setEvaluationResultState(null);
    setIsEscalationAcknowledged(false);
    sessionStorage.removeItem(STORAGE_KEYS.EVALUATION);
    sessionStorage.removeItem(STORAGE_KEYS.ACKNOWLEDGED_KEY);
    console.log('[SeverityContext] Evaluation cleared');
  }, []);

  const acknowledgeEscalation = useCallback(() => {
    setIsEscalationAcknowledged(true);
    
    // Persist acknowledgment key to prevent re-showing on refresh
    const evalKey = generateEvaluationKey(evaluationResult);
    if (evalKey) {
      sessionStorage.setItem(STORAGE_KEYS.ACKNOWLEDGED_KEY, evalKey);
      console.log('[SeverityContext] Escalation acknowledged and persisted:', evalKey);
    }
  }, [evaluationResult]);

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
