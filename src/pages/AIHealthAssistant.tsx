import React, { useState } from 'react';
import { HealthAssistantInput } from '@/components/health-assistant/HealthAssistantInput';
import { EmergencyBanner } from '@/components/health-assistant/EmergencyBanner';
import PhysicianRecommendationsView from '@/components/physician-recommendations/PhysicianRecommendationsView';
import { useSeverity } from '@/context/SeverityContext';
import type { HealthQuery } from '@/services/physician-recommendation-service';

export default function AIHealthAssistant() {
  const [healthQuery, setHealthQuery] = useState<HealthQuery | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { evaluationResult } = useSeverity();

  const handleSubmit = async (query: HealthQuery) => {
    setIsLoading(true);
    try {
      setHealthQuery(query);
    } catch (error) {
      console.error('Error processing health query:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setHealthQuery(null);
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Emergency/Severity Banner */}
        <EmergencyBanner className="mb-6" />
        
        {!healthQuery ? (
          <HealthAssistantInput onSubmit={handleSubmit} isLoading={isLoading} />
        ) : (
          <PhysicianRecommendationsView 
            healthQuery={healthQuery} 
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
