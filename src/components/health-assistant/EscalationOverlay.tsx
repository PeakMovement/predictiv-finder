import { AlertTriangle, Phone, MapPin, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSeverity } from '@/context/SeverityContext';
import { motion, AnimatePresence } from 'framer-motion';

interface EscalationOverlayProps {
  onContinue?: () => void;
}

/**
 * Full-screen escalation overlay for critical/severe situations.
 * Blocks interaction until user acknowledges the severity.
 */
export function EscalationOverlay({ onContinue }: EscalationOverlayProps) {
  const { 
    evaluationResult, 
    isEmergency, 
    isSevere, 
    shouldShowOverlay,  // Single source of truth for visibility
    acknowledgeEscalation,
  } = useSeverity();

  // LOCKED RULE: Visibility controlled by SeverityContext
  if (!shouldShowOverlay || !evaluationResult) {
    return null;
  }

  const handleAcknowledge = () => {
    acknowledgeEscalation();
    onContinue?.();
  };

  const handleEmergencyCall = () => {
    window.open('tel:10177', '_self');
  };

  const handleFindHospital = () => {
    window.open('https://www.google.com/maps/search/hospital+near+me', '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 30 }}
          className={`max-w-lg mx-4 p-6 rounded-2xl border-2 ${
            isEmergency 
              ? 'bg-red-500/10 border-red-500/50' 
              : 'bg-orange-500/10 border-orange-500/50'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${
              isEmergency ? 'bg-red-500/20' : 'bg-orange-500/20'
            }`}>
              {isEmergency ? (
                <ShieldAlert className={`w-8 h-8 ${isEmergency ? 'text-red-500' : 'text-orange-500'}`} />
              ) : (
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              )}
            </div>
            
            <div className="flex-1">
              <h2 className={`text-xl font-bold mb-2 ${
                isEmergency ? 'text-red-500' : 'text-orange-500'
              }`}>
                {isEmergency ? '⚠️ Critical Health Alert' : 'Urgent Medical Attention Recommended'}
              </h2>
              
              <p className={`mb-4 ${isEmergency ? 'text-red-400' : 'text-orange-400'}`}>
                {isEmergency 
                  ? 'Based on your symptoms, you may need immediate medical attention. Please do not ignore this warning.'
                  : 'Your symptoms indicate you should seek medical care soon. Consider booking an appointment today.'
                }
              </p>

              {evaluationResult.red_flags.length > 0 && (
                <div className={`p-3 rounded-lg mb-4 ${
                  isEmergency ? 'bg-red-500/10' : 'bg-orange-500/10'
                }`}>
                  <p className={`text-sm font-medium ${
                    isEmergency ? 'text-red-300' : 'text-orange-300'
                  }`}>
                    Warning signs detected:
                  </p>
                  <ul className="mt-1 text-sm text-muted-foreground">
                    {evaluationResult.red_flags.map((flag, idx) => (
                      <li key={idx}>• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {isEmergency && (
                  <>
                    <Button 
                      variant="destructive" 
                      onClick={handleEmergencyCall}
                      className="flex-1"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Emergency (10177)
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleFindHospital}
                      className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Find Hospital
                    </Button>
                  </>
                )}
                
                <Button 
                  variant={isEmergency ? 'ghost' : 'default'}
                  onClick={handleAcknowledge}
                  className={isEmergency ? 'text-muted-foreground' : ''}
                >
                  {isEmergency ? 'I understand, continue anyway' : 'I understand, find me a doctor'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
