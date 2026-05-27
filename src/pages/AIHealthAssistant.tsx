import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductionHealthAssistant } from '@/components/health-assistant/ProductionHealthAssistant';
import PhysicianRecommendationsView from '@/components/physician-recommendations/PhysicianRecommendationsView';
import DirectionalGuidanceView from '@/components/directional-guidance/DirectionalGuidanceView';
import { useSeverity } from '@/context/SeverityContext';
import { useEscalation } from '@/hooks/useEscalation';
import { PUBLIC_LAUNCH_MODE } from '@/config/launchMode';
import type { HealthQuery } from '@/services/physician-recommendation-service';

export default function AIHealthAssistant() {
  const [healthQuery, setHealthQuery] = useState<HealthQuery | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { evaluationResult, escalationLevel, clearEvaluation } = useSeverity();
  
  // Extract symptoms from URL parameter
  const initialSymptoms = searchParams.get('symptoms') 
    ? decodeURIComponent(searchParams.get('symptoms')!) 
    : undefined;
  
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
    <div className="relative min-h-screen overflow-y-auto bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-0"
      />
      {!healthQuery ? (
        <ProductionHealthAssistant 
          onProceedToRecommendations={handleProceedToRecommendations} 
          isLoading={isLoading}
          initialSymptoms={initialSymptoms}
        />
      ) : (
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {PUBLIC_LAUNCH_MODE ? (
            <DirectionalGuidanceView
              healthQuery={healthQuery}
              onBack={handleBack}
            />
          ) : (
            <PhysicianRecommendationsView
              healthQuery={healthQuery}
              onBack={handleBack}
            />
          )}
        </div>
      )}
    </div>
  );
}
