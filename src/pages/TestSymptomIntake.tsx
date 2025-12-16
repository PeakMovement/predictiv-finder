import { SymptomIntakeForm } from '@/components/symptom-intake';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Code, ArrowRight, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSeverity } from '@/context/SeverityContext';
import { useEscalation, getEscalationMessage } from '@/hooks/useEscalation';
import { EscalationOverlay } from '@/components/health-assistant/EscalationOverlay';
import type { SeverityEvaluationResponse } from '@/services/symptom-severity-service';

export default function TestSymptomIntake() {
  const { isAuthenticated, currentUser } = useAuth();
  const { setEvaluationResult, escalationLevel, isEscalationAcknowledged } = useSeverity();
  const [lastResult, setLastResult] = useState<SeverityEvaluationResponse | null>(null);
  const navigate = useNavigate();
  
  // Auto-triggers toasts and logging on severity changes
  const escalationActions = useEscalation();

  const handleEvaluationComplete = (result: SeverityEvaluationResponse) => {
    console.log('[TestSymptomIntake] Evaluation complete:', result);
    setLastResult(result);
    setEvaluationResult(result); // Store in global context - triggers escalation
  };

  const handleContinueToAssistant = () => {
    navigate('/');
  };

  const escalationMessage = getEscalationMessage(escalationActions);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Escalation Overlay - blocks until acknowledged */}
      <EscalationOverlay onContinue={handleContinueToAssistant} />
      
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Symptom Intake Test</h1>
            <p className="text-sm text-muted-foreground">Phase 2.4 - End-to-end testing</p>
          </div>
        </div>

        {/* Auth Status */}
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auth Status</span>
              <span className={`text-sm ${isAuthenticated ? 'text-green-500' : 'text-red-500'}`}>
                {isAuthenticated ? `✓ Logged in as ${currentUser?.email}` : '✗ Not logged in'}
              </span>
            </div>
            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground mt-2">
                You must be logged in to test the severity evaluator. The edge function requires JWT.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Symptom Intake Form */}
        <SymptomIntakeForm onEvaluationComplete={handleEvaluationComplete} />

        {/* Escalation Status Display */}
        {lastResult && (
          <Card className={`border-2 ${
            escalationLevel === 'emergency' ? 'border-red-500/50 bg-red-500/5' :
            escalationLevel === 'urgent' ? 'border-orange-500/50 bg-orange-500/5' :
            escalationLevel === 'caution' ? 'border-yellow-500/50 bg-yellow-500/5' :
            'border-border/40 bg-card/50'
          }`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${
                  escalationLevel === 'emergency' ? 'text-red-500' :
                  escalationLevel === 'urgent' ? 'text-orange-500' :
                  escalationLevel === 'caution' ? 'text-yellow-500' :
                  'text-muted-foreground'
                }`} />
                Escalation Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Level: <span className="font-mono">{escalationLevel}</span></div>
                <div>Acknowledged: <span className="font-mono">{isEscalationAcknowledged ? 'Yes' : 'No'}</span></div>
                <div>Block Casual: <span className="font-mono">{escalationActions.blockCasualInteraction ? 'Yes' : 'No'}</span></div>
                <div>Force Emergency: <span className="font-mono">{escalationActions.forceEmergencyGuidance ? 'Yes' : 'No'}</span></div>
              </div>
              {escalationMessage && (
                <p className="text-sm text-muted-foreground mt-2 p-2 bg-background/50 rounded">
                  {escalationMessage}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Continue to Assistant Button */}
        {lastResult && isEscalationAcknowledged && (
          <Button 
            onClick={handleContinueToAssistant}
            className="w-full"
            size="lg"
          >
            Continue to Health Assistant
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {/* Raw JSON Output */}
        {lastResult && (
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Code className="w-4 h-4" />
                Raw JSON Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-background/50 p-4 rounded-lg overflow-auto max-h-80 border border-border/30">
                {JSON.stringify(lastResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
