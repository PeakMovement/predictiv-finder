import React, { useState, useEffect } from 'react';
import { ProductionHealthAssistant } from '@/components/health-assistant/ProductionHealthAssistant';
import PhysicianRecommendationsView from '@/components/physician-recommendations/PhysicianRecommendationsView';
import { useSeverity } from '@/context/SeverityContext';
import { useEscalation } from '@/hooks/useEscalation';
import type { HealthQuery } from '@/services/physician-recommendation-service';

export default function AIHealthAssistant() {
  const [healthQuery, setHealthQuery] = useState<HealthQuery | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { evaluationResult, escalationLevel, clearEvaluation } = useSeverity();
  
  // Hook that triggers automatic escalation behaviors (toasts, logging)
  const escalationActions = useEscalation();

  const handleProceedToRecommendations = async (query: HealthQuery) => {
    setIsLoading(true);
    try {
      console.log('[AIHealthAssistant] Proceeding to recommendations:', {
        prompt: query.prompt.substring(0, 50) + '...',
        severityContext: evaluationResult?.overall_severity,
        escalationLevel,
      });
      setHealthQuery(query);
    } catch (error) {
      console.error('Error processing health query:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    console.log('[AIHealthAssistant] Navigating back to input', {
      previousSeverity: evaluationResult?.overall_severity,
      timestamp: new Date().toISOString(),
    });
    setHealthQuery(null);
    // Keep evaluation state when going back - user might want to find different doctors
    // Evaluation is cleared when a new one is performed
  };

  // Log escalation state for QA observability
  useEffect(() => {
    if (escalationLevel !== 'none') {
      console.log('[AIHealthAssistant] Escalation state:', {
        level: escalationLevel,
        actions: escalationActions,
        severity: evaluationResult?.overall_severity,
        redFlags: evaluationResult?.red_flags,
        timestamp: new Date().toISOString(),
      });
    }
  }, [escalationLevel, escalationActions, evaluationResult]);

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
      {!healthQuery ? (
        <ProductionHealthAssistant 
          onProceedToRecommendations={handleProceedToRecommendations} 
          isLoading={isLoading} 
        />
      ) : (
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <PhysicianRecommendationsView 
            healthQuery={healthQuery} 
            onBack={handleBack}
          />
        </div>
      )}
    </div>
  );
}
