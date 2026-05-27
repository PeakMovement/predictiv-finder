import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Stethoscope, Wallet, ListChecks, Loader2, Sparkles } from 'lucide-react';
import { DisclaimerBanner } from './DisclaimerBanner';
import {
  analyzeHealthIssue,
  type HealthQuery,
} from '@/services/physician-recommendation-service';
import { estimatePriceRange, type PriceEstimate } from '@/services/price-estimate-service';
import type { AiAnalysis } from '@/types/ai-analysis';

interface DirectionalGuidanceViewProps {
  healthQuery: HealthQuery;
  onBack: () => void;
  aiAnalysis?: AiAnalysis | null;
}

/**
 * Generates a loose, plain-language list of next-step suggestions for a
 * given specialty. No diagnoses, no dosages — directional only.
 */
const buildPlanSteps = (specialty: string | null): string[] => {
  const base = [
    'Write down when the issue started, what triggers it, and what (if anything) helps.',
    'Track severity on a 1–10 scale over the next few days to spot patterns.',
    'Rest the affected area where possible and avoid activities that clearly worsen it.',
  ];
  if (!specialty) {
    return [
      ...base,
      'Book a general consultation if symptoms persist beyond 7 days or get worse.',
    ];
  }
  return [
    ...base,
    `Consider an initial consultation with a ${specialty.toLowerCase()} for a hands-on assessment.`,
    'Bring your notes and any prior scans, scripts, or test results to the appointment.',
  ];
};

const summariseConcern = (prompt: string): string => {
  const trimmed = prompt.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= 180) return trimmed;
  return trimmed.slice(0, 177).trimEnd() + '…';
};

export const DirectionalGuidanceView = ({
  healthQuery,
  onBack,
  aiAnalysis,
}: DirectionalGuidanceViewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      try {
        const detected = analyzeHealthIssue(healthQuery.prompt);
        const estimate = await estimatePriceRange(detected);
        if (cancelled) return;
        setSpecialties(detected);
        setPriceEstimate(estimate);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [healthQuery]);

  const primarySpecialty = aiAnalysis?.suggested_specialty ?? specialties[0] ?? null;
  const planSteps =
    aiAnalysis?.next_steps && aiAnalysis.next_steps.length > 0
      ? aiAnalysis.next_steps
      : buildPlanSteps(specialties[0] ?? null);
  const summary = aiAnalysis?.concern_summary ?? summariseConcern(healthQuery.prompt);
  const aiPriceLabel = aiAnalysis
    ? `R${aiAnalysis.price_range_zar.min.toLocaleString()} – R${aiAnalysis.price_range_zar.max.toLocaleString()}`
    : null;
  const understoodChips = aiAnalysis
    ? [
        ...aiAnalysis.symptoms.slice(0, 4),
        aiAnalysis.duration ?? null,
        aiAnalysis.body_region ?? null,
      ].filter(Boolean) as string[]
    : [];

  return (
    <div className="w-full max-w-3xl mx-auto py-6 animate-fade-in space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="flex items-center gap-2 hover:bg-accent"
      >
        <ArrowLeft size={16} />
        Back
      </Button>

      <DisclaimerBanner />

      {isLoading ? (
        <Card className="shadow-glass border border-glass-border bg-glass backdrop-blur-xl">
          <CardContent className="py-16 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Reviewing your concern…</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Concern summary */}
          <Card className="shadow-glass border border-glass-border bg-glass backdrop-blur-xl">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Your concern
                </h2>
                {aiAnalysis && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
                    <Sparkles className="h-3 w-3" /> AI understood
                  </span>
                )}
              </div>
              <p className="text-base text-foreground leading-relaxed">{summary}</p>
              {understoodChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {understoodChips.map((chip) => (
                    <span
                      key={chip}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price + specialty */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-glass border border-glass-border bg-glass backdrop-blur-xl">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">
                    Estimated price per session
                  </h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {priceEstimate?.formatted ?? 'Not enough data'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {priceEstimate
                    ? `Based on ${priceEstimate.sampleSize} listed practitioner${
                        priceEstimate.sampleSize === 1 ? '' : 's'
                      }${primarySpecialty ? ` (${primarySpecialty})` : ''}.`
                    : 'Try describing the concern in more detail for a tighter estimate.'}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-glass border border-glass-border bg-glass backdrop-blur-xl">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">
                    Suggested direction
                  </h3>
                </div>
                {primarySpecialty ? (
                  <>
                    <p className="text-2xl font-bold text-foreground">{primarySpecialty}</p>
                    {specialties.length > 1 && (
                      <p className="text-xs text-muted-foreground">
                        Alternative: {specialties.slice(1).join(', ')}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">General Physician</p>
                    <p className="text-xs text-muted-foreground">
                      A GP can triage and refer you to the right specialist.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Proposed plan */}
          <Card className="shadow-glass border border-glass-border bg-glass backdrop-blur-xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ListChecks className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  Suggested next steps
                </h3>
              </div>
              <ol className="space-y-3">
                {planSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DirectionalGuidanceView;
