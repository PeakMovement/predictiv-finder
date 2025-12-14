import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Plus, X, Loader2 } from 'lucide-react';
import { 
  evaluateSymptomSeverity, 
  getSeverityDisplayInfo,
  type SymptomInput,
  type SeverityEvaluationResponse 
} from '@/services/symptom-severity-service';
import { toast } from 'sonner';

const BODY_REGIONS = [
  { value: 'head', label: 'Head' },
  { value: 'neck', label: 'Neck' },
  { value: 'chest', label: 'Chest' },
  { value: 'abdomen', label: 'Abdomen' },
  { value: 'back', label: 'Back' },
  { value: 'arms', label: 'Arms' },
  { value: 'legs', label: 'Legs' },
  { value: 'skin', label: 'Skin' },
  { value: 'general', label: 'General/Whole Body' },
  { value: 'mental', label: 'Mental/Emotional' },
];

interface SymptomEntry extends SymptomInput {
  id: string;
}

interface SymptomIntakeFormProps {
  onEvaluationComplete?: (result: SeverityEvaluationResponse) => void;
}

export function SymptomIntakeForm({ onEvaluationComplete }: SymptomIntakeFormProps) {
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [currentRegion, setCurrentRegion] = useState<string>('');
  const [currentDuration, setCurrentDuration] = useState<number>(24);
  const [currentSeverity, setCurrentSeverity] = useState<number>(3);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<SeverityEvaluationResponse | null>(null);

  const addSymptom = () => {
    if (!currentSymptom.trim()) {
      toast.error('Please describe your symptom');
      return;
    }

    const newSymptom: SymptomEntry = {
      id: crypto.randomUUID(),
      symptom_text: currentSymptom.trim(),
      body_region: currentRegion || undefined,
      duration_hours: currentDuration,
      severity_score: currentSeverity,
    };

    setSymptoms([...symptoms, newSymptom]);
    setCurrentSymptom('');
    setCurrentRegion('');
    setCurrentDuration(24);
    setCurrentSeverity(3);
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
    setEvaluationResult(null);
  };

  const handleEvaluate = async () => {
    if (symptoms.length === 0) {
      toast.error('Please add at least one symptom');
      return;
    }

    setIsEvaluating(true);
    setEvaluationResult(null);

    try {
      const result = await evaluateSymptomSeverity(
        symptoms.map(({ id, ...rest }) => rest)
      );
      setEvaluationResult(result);
      onEvaluationComplete?.(result);
      toast.success('Symptoms evaluated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to evaluate symptoms';
      toast.error(message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const getDurationLabel = (hours: number) => {
    if (hours < 24) return `${hours} hours`;
    if (hours < 168) return `${Math.round(hours / 24)} days`;
    return `${Math.round(hours / 168)} weeks`;
  };

  return (
    <div className="space-y-6">
      {/* Add Symptom Form */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Describe Your Symptoms</CardTitle>
          <CardDescription>
            Add each symptom you're experiencing for accurate severity assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symptom">What are you experiencing?</Label>
            <Textarea
              id="symptom"
              placeholder="e.g., Sharp headache on the left side, chest pain when breathing..."
              value={currentSymptom}
              onChange={(e) => setCurrentSymptom(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Body Region</Label>
              <Select value={currentRegion} onValueChange={setCurrentRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area affected" />
                </SelectTrigger>
                <SelectContent>
                  {BODY_REGIONS.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration: {getDurationLabel(currentDuration)}</Label>
              <Slider
                value={[currentDuration]}
                onValueChange={([value]) => setCurrentDuration(value)}
                min={1}
                max={336}
                step={1}
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Severity (1-10): {currentSeverity}</Label>
            <Slider
              value={[currentSeverity]}
              onValueChange={([value]) => setCurrentSeverity(value)}
              min={1}
              max={10}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>

          <Button onClick={addSymptom} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Symptom
          </Button>
        </CardContent>
      </Card>

      {/* Symptoms List */}
      {symptoms.length > 0 && (
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Your Symptoms ({symptoms.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {symptoms.map((symptom) => (
              <div
                key={symptom.id}
                className="flex items-start justify-between p-3 rounded-lg bg-background/50 border border-border/30"
              >
                <div className="flex-1">
                  <p className="font-medium">{symptom.symptom_text}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {symptom.body_region && (
                      <Badge variant="secondary" className="text-xs">
                        {BODY_REGIONS.find(r => r.value === symptom.body_region)?.label}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {getDurationLabel(symptom.duration_hours || 24)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Severity: {symptom.severity_score}/10
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSymptom(symptom.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="w-full mt-4"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                'Evaluate Severity'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Evaluation Result */}
      {evaluationResult && (
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Severity Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Severity */}
            <div className={`p-4 rounded-lg ${getSeverityDisplayInfo(evaluationResult.overall_severity).bgColor} ${getSeverityDisplayInfo(evaluationResult.overall_severity).borderColor} border`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall Severity</span>
                <Badge className={getSeverityDisplayInfo(evaluationResult.overall_severity).color}>
                  {getSeverityDisplayInfo(evaluationResult.overall_severity).label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {getSeverityDisplayInfo(evaluationResult.overall_severity).description}
              </p>
            </div>

            {/* Red Flags */}
            {evaluationResult.red_flags.length > 0 && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="font-medium text-red-500 mb-2">⚠️ Red Flags Detected</p>
                <div className="flex flex-wrap gap-2">
                  {evaluationResult.red_flags.map((flag, i) => (
                    <Badge key={i} variant="destructive" className="text-xs">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Results */}
            <div className="space-y-2">
              <p className="font-medium text-sm">Symptom Analysis</p>
              {evaluationResult.results.map((result, i) => (
                <div key={i} className="text-sm p-2 rounded bg-background/50 border border-border/30">
                  <div className="flex items-center justify-between">
                    <span className={getSeverityDisplayInfo(result.calculated_severity).color}>
                      {getSeverityDisplayInfo(result.calculated_severity).label}
                    </span>
                    {result.escalated && (
                      <Badge variant="outline" className="text-xs text-orange-500">
                        Escalated
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">{result.reasoning}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Evaluated at {new Date(evaluationResult.evaluated_at).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
