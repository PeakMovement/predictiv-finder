import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck } from 'lucide-react';
import { useConsent } from '@/hooks/useConsent';

interface ConsentGateProps {
  children: React.ReactNode;
}

/**
 * Blocks the directional health assistant until the visitor explicitly
 * acknowledges POPIA-aligned consent: processing of health information and
 * understanding that this product is not medical advice.
 */
export function ConsentGate({ children }: ConsentGateProps) {
  const { hasConsent, grantConsent } = useConsent();
  const [processingAck, setProcessingAck] = useState(false);
  const [adviceAck, setAdviceAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (hasConsent) return <>{children}</>;

  const canContinue = processingAck && adviceAck && !submitting;

  const handleContinue = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    try {
      await grantConsent();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background text-foreground px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-0"
      />

      <div className="relative w-full max-w-xl rounded-2xl bg-card/50 border border-border backdrop-blur-md p-8 space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            Before we begin
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Your privacy & how this works
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Predictiv gives directional guidance about who to see and what care
            typically costs in Rand. To do that, what you type is processed by
            an AI model. Please read and agree before continuing.
          </p>
        </div>

        <ul className="space-y-3 text-sm text-card-foreground/85">
          <li className="flex gap-3">
            <ShieldCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <span>
              <strong className="text-foreground">What we process:</strong> the
              health description you type. Don&apos;t include ID numbers, full
              names of other people, or medical aid numbers.
            </span>
          </li>
          <li className="flex gap-3">
            <ShieldCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <span>
              <strong className="text-foreground">Where it goes:</strong> our
              backend forwards an anonymised version to a Google AI model
              (hosted outside South Africa) to extract symptoms and suggest a
              specialty. No training on your input.
            </span>
          </li>
          <li className="flex gap-3">
            <ShieldCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <span>
              <strong className="text-foreground">Not medical advice:</strong>{' '}
              outputs are directional only. For emergencies call{' '}
              <span className="text-primary font-semibold">10177</span>.
            </span>
          </li>
        </ul>

        <div className="space-y-3 rounded-xl bg-background/40 border border-border p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={processingAck}
              onCheckedChange={(v) => setProcessingAck(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm leading-relaxed">
              I consent to my health description being processed to generate
              directional guidance, in line with POPIA.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={adviceAck}
              onCheckedChange={(v) => setAdviceAck(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm leading-relaxed">
              I understand this is not medical advice and emergencies require
              calling 10177.
            </span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <Link
            to="/privacy"
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Read the full privacy notice
          </Link>
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="rounded-xl"
          >
            {submitting ? 'Saving…' : 'I agree & continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
