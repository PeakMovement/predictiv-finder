import { SymptomIntakeForm } from '@/components/symptom-intake';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Code, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSeverity } from '@/context/SeverityContext';
import type { SeverityEvaluationResponse } from '@/services/symptom-severity-service';

export default function TestSymptomIntake() {
  const { isAuthenticated, currentUser } = useAuth();
  const { setEvaluationResult } = useSeverity();
  const [lastResult, setLastResult] = useState<SeverityEvaluationResponse | null>(null);
  const navigate = useNavigate();

  const handleEvaluationComplete = (result: SeverityEvaluationResponse) => {
    console.log('[TestSymptomIntake] Evaluation complete:', result);
    setLastResult(result);
    setEvaluationResult(result); // Store in global context
  };

  const handleContinueToAssistant = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
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

        {/* Continue to Assistant Button */}
        {lastResult && (
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
