import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuickHealthInput } from './QuickHealthInput';
import { FindPractitionerTab } from './FindPractitionerTab';
import { EmergencyBanner } from './EmergencyBanner';
import { EscalationOverlay } from './EscalationOverlay';
import { useSeverity } from '@/context/SeverityContext';
import { useEscalation } from '@/hooks/useEscalation';
import { Stethoscope, MapPin, Home } from 'lucide-react';
import type { HealthQuery } from '@/services/physician-recommendation-service';

interface ProductionHealthAssistantProps {
  onProceedToRecommendations: (query: HealthQuery) => void;
  isLoading?: boolean;
  initialSymptoms?: string;
}

type AssistantMode = 'quick' | 'detailed';

export function ProductionHealthAssistant({
  onProceedToRecommendations,
  isLoading = false,
  initialSymptoms
}: ProductionHealthAssistantProps) {
  const [mode, setMode] = useState<AssistantMode>('quick');
  const [pendingQuery, setPendingQuery] = useState<HealthQuery | null>(null);

  const {
    evaluationResult,
    escalationLevel,
    shouldBlockInteraction,  // Single source of truth
    isEscalationAcknowledged,
  } = useSeverity();

  // Side effects only - trigger logic is in context
  useEscalation();

  // Handle quick query submission
  const handleQuickSubmit = useCallback((query: HealthQuery) => {
    console.log('[ProductionHealthAssistant] Quick query submitted:', {
      prompt: query.prompt.substring(0, 50) + '...',
      escalationLevel,
    });

    // If no severity evaluation, proceed directly
    if (!evaluationResult) {
      onProceedToRecommendations(query);
      return;
    }

    // LOCKED RULE: Block only if context says so
    if (shouldBlockInteraction) {
      setPendingQuery(query);
      console.log('[ProductionHealthAssistant] Query blocked - escalation acknowledgment required');
      return;
    }

    onProceedToRecommendations(query);
  }, [evaluationResult, shouldBlockInteraction, escalationLevel, onProceedToRecommendations]);

  // Process pending query when escalation is acknowledged
  React.useEffect(() => {
    if (pendingQuery && isEscalationAcknowledged) {
      console.log('[ProductionHealthAssistant] Processing pending query after acknowledgment');
      onProceedToRecommendations(pendingQuery);
      setPendingQuery(null);
    }
  }, [pendingQuery, isEscalationAcknowledged, onProceedToRecommendations]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden overflow-y-auto animate-fade-in">
      {/* Escalation overlay - blocks interaction until acknowledged */}
      <EscalationOverlay />

      <div className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          {/* Return to main menu */}
          <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
            <Link to="/">
              <Home className="w-4 h-4" />
              Main Menu
            </Link>
          </Button>

          {/* Emergency/Severity Banner - persistent reminder */}
          <EmergencyBanner className="mb-2" />

          {/* Mode Selector */}
          <Card className="shadow-glass border border-glass-border bg-glass backdrop-blur-xl">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                  <Stethoscope className="w-8 h-8 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
                  Predictiv
                </CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground max-w-2xl mx-auto">
                Find the right physician for your health needs
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 md:px-8">
              <Tabs value={mode} onValueChange={(v) => {
                const newMode = v as AssistantMode;
                console.log('[ProductionHealthAssistant] Mode changed:', { from: mode, to: newMode });
                setMode(newMode);
              }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="quick" className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Quick Search
                  </TabsTrigger>
                  <TabsTrigger value="detailed" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Find a Practitioner
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="quick" className="mt-0">
                  <QuickHealthInput
                    onSubmit={handleQuickSubmit}
                    isLoading={isLoading}
                    initialSymptoms={initialSymptoms}
                  />
                </TabsContent>

                <TabsContent value="detailed" className="mt-0 space-y-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      Use your location to browse practitioners near you, ranked by rating and distance
                    </p>
                  </div>

                  <FindPractitionerTab />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProductionHealthAssistant;
