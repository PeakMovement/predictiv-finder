import { AlertTriangle, Phone, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSeverity } from '@/context/SeverityContext';
import { getSeverityDisplayInfo } from '@/services/symptom-severity-service';

interface EmergencyBannerProps {
  className?: string;
}

export function EmergencyBanner({ className }: EmergencyBannerProps) {
  const { evaluationResult, isEmergency, isSevere, hasRedFlags } = useSeverity();

  if (!evaluationResult || (!isEmergency && !isSevere && !hasRedFlags)) {
    return null;
  }

  const severityInfo = getSeverityDisplayInfo(evaluationResult.overall_severity);

  if (isEmergency) {
    return (
      <Alert variant="destructive" className={`border-red-500/50 bg-red-500/10 ${className}`}>
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-red-500 font-bold">⚠️ Critical Health Alert</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p className="text-red-400">
            Based on your symptoms, you may need immediate medical attention.
          </p>
          {evaluationResult.red_flags.length > 0 && (
            <p className="text-sm text-red-300">
              Warning signs: {evaluationResult.red_flags.join(', ')}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => window.open('tel:10177', '_self')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Emergency (10177)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={() => window.open('https://www.google.com/maps/search/hospital+near+me', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Find Nearest Hospital
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (isSevere) {
    return (
      <Alert className={`border-orange-500/50 bg-orange-500/10 ${className}`}>
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <AlertTitle className="text-orange-500 font-semibold">Urgent Medical Attention Recommended</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-orange-400">
            Your symptoms indicate you should seek medical care soon. Consider booking an appointment today.
          </p>
          {evaluationResult.red_flags.length > 0 && (
            <p className="text-sm text-orange-300 mt-1">
              Concerning signs: {evaluationResult.red_flags.join(', ')}
            </p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (hasRedFlags) {
    return (
      <Alert className={`border-yellow-500/50 bg-yellow-500/10 ${className}`}>
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <AlertTitle className="text-yellow-500 font-semibold">Symptoms to Monitor</AlertTitle>
        <AlertDescription className="mt-2 text-yellow-400">
          <p>
            Some symptoms warrant attention. If they worsen, seek medical care promptly.
          </p>
          <p className="text-sm text-yellow-300 mt-1">
            Watch for: {evaluationResult.red_flags.join(', ')}
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
