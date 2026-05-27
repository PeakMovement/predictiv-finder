import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { HealthQuery } from '@/services/physician-recommendation-service';
import { User, Stethoscope, CheckCircle, AlertCircle } from 'lucide-react';
import { analyzeHealthQuery, AnalysisResult } from '@/utils/health-analysis-shared';

interface QuickHealthInputProps {
  onSubmit: (query: HealthQuery) => void;
  isLoading?: boolean;
  initialSymptoms?: string;
}

const exampleQueries = [
  {
    short: "Lower back pain when sitting at my desk — Johannesburg",
    full: "I've been getting lower back pain for the past three weeks, mostly when I sit at my desk for long stretches. I'm based in Johannesburg."
  },
  {
    short: "Persistent acne on my jawline — Cape Town",
    full: "I've had stubborn acne along my jawline for a few months and over-the-counter products aren't helping. I'm in Cape Town."
  },
  {
    short: "Tightness in my chest when I exercise — Durban",
    full: "I sometimes get a tight feeling in my chest when I jog or climb stairs. I'd like to understand who I should see. I'm in Durban."
  },
  {
    short: "Frequent headaches and trouble focusing — Pretoria",
    full: "I've been having frequent headaches and finding it hard to focus at work. Based in Pretoria."
  }
];

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function QuickHealthInput({ onSubmit, isLoading = false, initialSymptoms }: QuickHealthInputProps) {
  const [query, setQuery] = useState<HealthQuery>({ prompt: initialSymptoms || '' });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  // Analysis using shared utility
  const debouncedAnalysis = useCallback(
    debounce(async (searchPrompt: string) => {
      if (searchPrompt.trim().length >= 10) {
        try {
          const analysis = analyzeHealthQuery(searchPrompt);
          const hasEnoughInfo = searchPrompt.trim().length > 30 && (analysis.budget !== undefined || analysis.location !== undefined);
          setAnalysisResult({
            ...analysis,
            hasEnoughInfo
          });
        } catch (error) {
          console.error('Analysis error:', error);
          setAnalysisResult(null);
        }
      } else {
        setAnalysisResult(null);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedAnalysis(query.prompt);
  }, [query.prompt, debouncedAnalysis]);

  const handleSubmit = () => {
    if (!query.prompt.trim()) {
      toast({
        title: "Health prompt required",
        description: "Please describe your health concern, budget, and location",
        variant: "destructive",
      });
      return;
    }

    if (query.prompt.trim().length < 10) {
      toast({
        title: "Please provide more details",
        description: "Your description should be at least 10 characters long",
        variant: "destructive",
      });
      return;
    }

    onSubmit(query);
  };

  const handleExampleClick = (example: { short: string; full: string }) => {
    setQuery({ prompt: example.full });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row items-start justify-center gap-5 md:gap-6 lg:gap-12 w-full">
        {/* Left side - Main prompt input */}
        <div className="w-full lg:flex-[55] space-y-3">
          <div>
            <Label htmlFor="health-prompt" className="text-base md:text-lg font-semibold flex items-center gap-2 text-foreground mb-2">
              <User className="w-5 h-5 text-primary" />
              Describe your health concern *
            </Label>
            <Textarea
              id="health-prompt"
              placeholder="Describe your health concern, budget, and preferred location..."
              value={query.prompt}
              onChange={(e) => setQuery({ prompt: e.target.value })}
              className="min-h-[140px] md:min-h-[160px] text-base leading-relaxed border border-border/40 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-lg resize-none mb-2"
              required
            />
            <p className="text-xs md:text-sm text-muted-foreground">
              * Please try to mention the budget, issue and location if possible
            </p>
          </div>

          {/* Analysis Display */}
          {analysisResult && (
            <Card className="bg-muted/50 border-dashed my-3">
              <CardContent className="p-3 md:pt-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Quick Analysis
                </h4>
                <div className="space-y-2 text-sm">
                  {analysisResult.primaryConcerns.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-muted-foreground">Issues:</span>
                      <span>{analysisResult.primaryConcerns.join(', ')}</span>
                    </div>
                  )}
                  {analysisResult.budget && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-muted-foreground">Budget:</span>
                      <span>R{analysisResult.budget.toLocaleString()}</span>
                    </div>
                  )}
                  {analysisResult.location && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-muted-foreground">Location:</span>
                      <span>{analysisResult.location}</span>
                    </div>
                  )}
                  {analysisResult.recommendedDoctor && analysisResult.recommendedDoctor.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-muted-foreground">Recommended doctors:</span>
                      <span>{analysisResult.recommendedDoctor.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    {(analysisResult as any).hasEnoughInfo ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 text-xs">Good information for recommendations</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-600 text-xs">Try adding budget or location for better results</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-start mt-4">
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              size="lg"
              className="w-full lg:w-auto px-8 py-4 md:py-5 text-base md:text-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3" />
                  Finding Physicians...
                </>
              ) : (
                <>
                  <Stethoscope className="w-5 h-5 mr-3" />
                  Find My Physician
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right side - Examples */}
        <div className="w-full lg:flex-[45] space-y-2.5">
          <h3 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]"></span>
            Try these examples
          </h3>
          <div className="space-y-2">
            {exampleQueries.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full text-left h-auto p-3 justify-start border border-border/40 bg-background/30 hover:border-primary/50 hover:bg-background/50 transition-all duration-300 group whitespace-normal"
                onClick={() => handleExampleClick(example)}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="p-1.5 rounded-full bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors text-left break-words">
                    {example.short}
                  </div>
                </div>
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center lg:text-left">
            Click any example to use it as your prompt
          </p>
        </div>
      </div>
    </div>
  );
}

export default QuickHealthInput;
