import { AlertTriangle } from 'lucide-react';

export const DisclaimerBanner = () => (
  <div
    role="note"
    className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-accent/40 px-4 py-3 text-sm text-foreground backdrop-blur-sm"
  >
    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
    <p className="leading-relaxed text-muted-foreground">
      <span className="font-semibold text-foreground">Directional guidance only.</span>{' '}
      This is not medical advice. For diagnosis or treatment, please consult a
      qualified healthcare professional.
    </p>
  </div>
);

export default DisclaimerBanner;
