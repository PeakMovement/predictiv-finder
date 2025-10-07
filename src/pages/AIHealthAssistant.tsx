import React, { useState } from 'react';
import { HealthAssistantInput } from '@/components/health-assistant/HealthAssistantInput';
import PhysicianRecommendationsView from '@/components/physician-recommendations/PhysicianRecommendationsView';
import type { HealthQuery } from '@/services/physician-recommendation-service';

export default function AIHealthAssistant() {
  const [healthQuery, setHealthQuery] = useState<HealthQuery | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-8">
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
