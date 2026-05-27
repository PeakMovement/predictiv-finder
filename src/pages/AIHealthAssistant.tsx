import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductionHealthAssistant } from '@/components/health-assistant/ProductionHealthAssistant';
import PhysicianRecommendationsView from '@/components/physician-recommendations/PhysicianRecommendationsView';
import DirectionalGuidanceView from '@/components/directional-guidance/DirectionalGuidanceView';
import { ConsentGate } from '@/components/popia/ConsentGate';
import { useSeverity } from '@/context/SeverityContext';
import { useEscalation } from '@/hooks/useEscalation';
import { PUBLIC_LAUNCH_MODE } from '@/config/launchMode';
import { CURRENT_CONSENT_VERSION } from '@/config/popia';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { HealthQuery } from '@/services/physician-recommendation-service';
import type { AiAnalysis } from '@/types/ai-analysis';

export default function AIHealthAssistant() {
  const [healthQuery, setHealthQuery] = useState<HealthQuery | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { evaluationResult, escalationLevel } = useSeverity();
  const { toast } = useToast();

  const initialSymptoms = searchParams.get('symptoms')
    ? decodeURIComponent(searchParams.get('symptoms')!)
    : undefined;

  useEscalation();

  const handleProceedToRecommendations = async (query: HealthQuery) => {
    setIsLoading(true);
    setAiAnalysis(null);
    try {
      console.log('[AIHealthAssistant] Analysing concern via edge function');
      const { data, error } = await supabase.functions.invoke(
        'analyze-health-concern',
        {
          body: {
            message: query.prompt,
            consent_version: CURRENT_CONSENT_VERSION,
          },
        }
      );

      if (error) {
        console.error('[AIHealthAssistant] analyzer error', error);
        toast({
          title: 'We could not analyse that just now',
          description:
            'Showing fallback guidance. Please try again in a moment.',
          variant: 'destructive',
        });
      } else if (data?.analysis) {
        setAiAnalysis(data.analysis as AiAnalysis);
      }

      setHealthQuery(query);
    } catch (err) {
      console.error('[AIHealthAssistant] unexpected analyzer failure', err);
      setHealthQuery(query);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setHealthQuery(null);
    setAiAnalysis(null);
  };

  useEffect(() => {
    if (escalationLevel !== 'none') {
      console.log('[AIHealthAssistant] escalation', {
        level: escalationLevel,
        severity: evaluationResult?.overall_severity,
      });
    }
  }, [escalationLevel, evaluationResult]);

  return (
    <ConsentGate>
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
                aiAnalysis={aiAnalysis}
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
    </ConsentGate>
  );
}
