import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HealthAssistantInput } from './HealthAssistantInput';
import { SymptomIntakeForm } from '@/components/symptom-intake';
import { EmergencyBanner } from './EmergencyBanner';
import { EscalationOverlay } from './EscalationOverlay';
import { useSeverity } from '@/context/SeverityContext';
import { useEscalation } from '@/hooks/useEscalation';
import { Stethoscope, ClipboardList, AlertTriangle, CheckCircle } from 'lucide-react';
import type { HealthQuery } from '@/services/physician-recommendation-service';
import type { SeverityEvaluationResponse } from '@/services/symptom-severity-service';

interface ProductionHealthAssistantProps {
  onProceedToRecommendations: (query: HealthQuery) => void;
  isLoading?: boolean;
}

type AssistantMode = 'quick' | 'detailed';

export function ProductionHealthAssistant({ 
  onProceedToRecommendations, 
  isLoading = false 
}: ProductionHealthAssistantProps) {
  const [mode, setMode] = useState<AssistantMode>('quick');
  const [hasCompletedEvaluation, setHasCompletedEvaluation] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<HealthQuery | null>(null);
  
  const { 
    setEvaluationResult, 
    evaluationResult, 
    escalationLevel,
    isEscalationAcknowledged 
  } = useSeverity();
  
  // Automatically triggers escalation behaviors when severity changes
  const escalationActions = useEscalation();

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
    
    // If escalation requires acknowledgment and not acknowledged, store query
    if (escalationActions.blockCasualInteraction && !isEscalationAcknowledged) {
      setPendingQuery(query);
      console.log('[ProductionHealthAssistant] Query blocked - escalation acknowledgment required');
      return;
    }
    
    onProceedToRecommendations(query);
  }, [evaluationResult, escalationActions, isEscalationAcknowledged, escalationLevel, onProceedToRecommendations]);

  // Handle detailed symptom evaluation completion
  const handleEvaluationComplete = useCallback((result: SeverityEvaluationResponse) => {
    console.log('[ProductionHealthAssistant] Symptom evaluation complete:', {
      severity: result.overall_severity,
      redFlags: result.red_flags,
      timestamp: new Date().toISOString(),
    });
    
    // Store in context - this triggers escalation via useEscalation hook
    setEvaluationResult(result);
    setHasCompletedEvaluation(true);
  }, [setEvaluationResult]);

  // Handle proceeding after evaluation
  const handleProceedAfterEvaluation = useCallback(() => {
    // Check if escalation blocks progression
    if (escalationActions.blockCasualInteraction && !isEscalationAcknowledged) {
      console.log('[ProductionHealthAssistant] Progression blocked - acknowledge escalation first');
      return;
    }
    
    // Build query from evaluation context
    const symptomsDescription = evaluationResult?.results
      .map(r => r.reasoning)
      .join('; ') || 'General health concern';
    
    const query: HealthQuery = {
      prompt: `Health evaluation: ${symptomsDescription}. Severity: ${evaluationResult?.overall_severity || 'unknown'}.`,
    };
    
    onProceedToRecommendations(query);
  }, [evaluationResult, escalationActions, isEscalationAcknowledged, onProceedToRecommendations]);

  // Process pending query when escalation is acknowledged
  React.useEffect(() => {
    if (pendingQuery && isEscalationAcknowledged) {
      console.log('[ProductionHealthAssistant] Processing pending query after acknowledgment');
      onProceedToRecommendations(pendingQuery);
      setPendingQuery(null);
    }
  }, [pendingQuery, isEscalationAcknowledged, onProceedToRecommendations]);

  // Determine if user can proceed
  const canProceed = !escalationActions.blockCasualInteraction || isEscalationAcknowledged;

  return (
    <div className="min-h-screen w-full overflow-x-hidden overflow-y-auto animate-fade-in">
      {/* Escalation overlay - blocks interaction until acknowledged */}
      <EscalationOverlay />
      
      <div className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="w-full max-w-6xl mx-auto space-y-6">
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
                  AI Health Assistant
                </CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground max-w-2xl mx-auto">
                Find the right physician for your health needs
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-4 md:px-8">
              <Tabs value={mode} onValueChange={(v) => setMode(v as AssistantMode)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="quick" className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Quick Search
                  </TabsTrigger>
                  <TabsTrigger value="detailed" className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Detailed Assessment
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="quick" className="mt-0">
                  <HealthAssistantInput 
                    onSubmit={handleQuickSubmit} 
                    isLoading={isLoading} 
                  />
                </TabsContent>
                
                <TabsContent value="detailed" className="mt-0 space-y-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      Provide detailed symptom information for a comprehensive severity assessment
                    </p>
                  </div>
                  
                  <SymptomIntakeForm onEvaluationComplete={handleEvaluationComplete} />
                  
                  {/* Post-evaluation action */}
                  {hasCompletedEvaluation && evaluationResult && (
                    <Card className="border-primary/30 bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {canProceed ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-amber-500" />
                            )}
                            <div>
                              <p className="font-medium">
                                Evaluation Complete - {evaluationResult.overall_severity.toUpperCase()} severity
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {canProceed 
                                  ? 'Ready to find recommended physicians' 
                                  : 'Please acknowledge the health alert before continuing'}
                              </p>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={handleProceedAfterEvaluation}
                            disabled={!canProceed || isLoading}
                            className="w-full md:w-auto"
                          >
                            {isLoading ? 'Finding Physicians...' : 'Find Physicians'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
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
