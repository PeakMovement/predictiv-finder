import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { HealthQuery, PhysicianRecommendation, findRecommendedPhysicians } from '@/services/physician-recommendation-service';
import PhysicianCard from '@/components/physician-recommendations/PhysicianCard';
import { User, MapPin, DollarSign, Stethoscope, CheckCircle, AlertCircle } from 'lucide-react';
import { analyzeHealthQuery, AnalysisResult } from '@/utils/health-analysis-shared';

interface HealthAssistantInputProps {
  onSubmit: (query: HealthQuery) => void;
  isLoading?: boolean;
}

const exampleQueries = [
  { 
    short: "Lower back pain, R1000, Johannesburg",
    full: "I've been experiencing lower back pain for 3 weeks, especially when sitting. My budget is R1000 per month and I'd prefer a doctor in Johannesburg."
  },
  { 
    short: "Skin issues - acne, R800, Cape Town",
    full: "Having skin issues - acne and rash on my face. Budget is R800 and location Cape Town."
  },
  { 
    short: "Chest pain, specialist needed, R1200, Durban",
    full: "Chest pain and heart palpitations, need specialist consultation. My budget is R1200 per month in Durban."
  },
  { 
    short: "Headaches and memory issues, R1500, Pretoria",
    full: "Frequent headaches and memory issues. Budget R1500, prefer Pretoria location."
  }
];

export const HealthAssistantInput: React.FC<HealthAssistantInputProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [query, setQuery] = useState<HealthQuery>({
    prompt: ''
  });
  const [autoRecommendations, setAutoRecommendations] = useState<PhysicianRecommendation[]>([]);
  const [isAutoSearching, setIsAutoSearching] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  // Helper functions for analysis
  const extractBudget = (prompt: string): number | undefined => {
    const budgetPatterns = [
      /(?:budget|afford|spend|cost|price).*?R?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /R\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:rand|rands)/i
    ];
    
    for (const pattern of budgetPatterns) {
      const match = prompt.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0) return amount;
      }
    }
    return undefined;
  };

  const extractLocation = (prompt: string): string | undefined => {
    const knownCities = ['johannesburg', 'cape town', 'durban', 'pretoria', 'bloemfontein', 'port elizabeth', 'sandton', 'centurion', 'joburg', 'jozi'];
    
    // First try direct city name matching
    for (const city of knownCities) {
      if (prompt.toLowerCase().includes(city)) {
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }
    
    // Then try pattern matching with known cities
    const locationPatterns = [
      /(?:in|at|near|around|from|location|prefer|area)\s+(johannesburg|cape town|durban|pretoria|bloemfontein|port elizabeth|sandton|centurion|joburg|jozi)/i,
      /(johannesburg|cape town|durban|pretoria|bloemfontein|port elizabeth|sandton|centurion|joburg|jozi)\s+(?:area|location|city)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = prompt.match(pattern);
      if (match) {
        const location = match[1];
        return location.charAt(0).toUpperCase() + location.slice(1);
      }
    }
    return undefined;
  };

  const extractHealthConcerns = (prompt: string): string[] => {
    const concerns: string[] = [];
    const lowerPrompt = prompt.toLowerCase();
    
    // Check specific conditions first (more specific matches)
    if (lowerPrompt.includes('heart') || lowerPrompt.includes('cardio') || lowerPrompt.includes('chest pain') || lowerPrompt.includes('palpitation')) concerns.push('Cardiovascular health');
    if (lowerPrompt.includes('headache') || lowerPrompt.includes('migraine') || lowerPrompt.includes('memory') || lowerPrompt.includes('neurolog')) concerns.push('Neurology');
    if (lowerPrompt.includes('skin') || lowerPrompt.includes('acne') || lowerPrompt.includes('rash') || lowerPrompt.includes('dermat')) concerns.push('Dermatology');
    if (lowerPrompt.includes('diabetes') || lowerPrompt.includes('blood sugar') || lowerPrompt.includes('endocrin')) concerns.push('Diabetes management');
    if (lowerPrompt.includes('weight') || lowerPrompt.includes('diet') || lowerPrompt.includes('obesity')) concerns.push('Weight management');
    if (lowerPrompt.includes('mental') || lowerPrompt.includes('stress') || lowerPrompt.includes('anxiety') || lowerPrompt.includes('depression') || lowerPrompt.includes('psychiatr')) concerns.push('Mental health');
    
    // General pain management (checked last to avoid overriding specific conditions)
    if ((lowerPrompt.includes('pain') || lowerPrompt.includes('hurt') || lowerPrompt.includes('ache')) && 
        !concerns.includes('Cardiovascular health')) concerns.push('Pain management');
    
    return concerns.length > 0 ? concerns : ['General health consultation'];
  };

  const getRecommendedDoctor = (concerns: string[]): string[] => {
    const doctors: string[] = [];
    
    if (concerns.includes('Cardiovascular health')) doctors.push('Cardiologist');
    if (concerns.includes('Neurology')) doctors.push('Neurologist');
    if (concerns.includes('Dermatology')) doctors.push('Dermatologist');
    if (concerns.includes('Diabetes management')) doctors.push('Endocrinologist');
    if (concerns.includes('Weight management')) doctors.push('Dietician', 'Endocrinologist');
    if (concerns.includes('Mental health')) doctors.push('Psychiatrist', 'Psychologist');
    if (concerns.includes('Pain management')) doctors.push('Orthopedic Doctor', 'Physiotherapist');
    if (concerns.includes('General health consultation')) doctors.push('General Practitioner');
    
    // Remove duplicates and limit to 3 doctors
    return [...new Set(doctors)].slice(0, 3);
  };

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

  const handleAutoRecommendationSelect = (physician: PhysicianRecommendation) => {
    toast({
      title: "Physician Selected from Auto-Recommendations",
      description: `Selected ${physician.Name} - ${physician.Title}`,
    });
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden animate-fade-in">
      <div className="w-full px-4 py-6">
        <div className="w-full max-w-6xl mx-auto">
        {/* Left side - Input Form */}
        <Card className="shadow-glass border border-glass-border bg-glass backdrop-blur-xl card-hover">
          <CardHeader className="text-center pb-8 glow-purple-radial">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                <Stethoscope className="w-8 h-8 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                AI Health Assistant
              </CardTitle>
            </div>
            <CardDescription className="text-lg text-subtext max-w-2xl mx-auto">
              Find the perfect physician for your health needs. Just describe your symptoms, budget, and location in one message.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left side - Main prompt input */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="health-prompt" className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <User className="w-5 h-5 text-primary" />
                    Describe your health concern *
                  </Label>
                  <Textarea
                    id="health-prompt"
                    placeholder="Describe your health concern, budget, and preferred location..."
                    value={query.prompt}
                    onChange={(e) => setQuery({ prompt: e.target.value })}
                    className="min-h-[160px] text-base leading-relaxed border border-glass-border focus:border-primary/50 transition-all duration-300 bg-glass backdrop-blur-lg resize-none shadow-glass"
                    required
                  />
                   <p className="text-sm text-muted-foreground">
                     * Please try to mention the budget, issue and location if possible
                   </p>
                  {isAutoSearching && (
                    <div className="flex items-center gap-2 text-sm text-health-purple">
                      <div className="animate-spin w-4 h-4 border-2 border-health-purple border-t-transparent rounded-full" />
                      <span>Finding recommendations...</span>
                    </div>
                  )}
                </div>

                {/* Analysis Display */}
                {analysisResult && (
                  <Card className="bg-muted/50 border-dashed">
                    <CardContent className="pt-4">
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

                <div className="flex justify-center lg:justify-start">
                  <Button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    size="lg"
                    className="px-8 py-6 text-lg font-semibold btn-primary-glow text-white hover:scale-105 transition-all duration-300"
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]"></span>
                  Try these examples
                </h3>
                <div className="space-y-3">
                  {exampleQueries.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full text-left h-auto p-4 justify-start border border-glass-border bg-glass backdrop-blur-lg hover:border-primary/50 hover:bg-glass-highlight transition-all duration-300 hover:scale-105 hover:shadow-glass group whitespace-normal"
                      onClick={() => handleExampleClick(example)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="p-2 rounded-full bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                         <div className="text-sm leading-relaxed text-subtext group-hover:text-foreground transition-colors text-left break-words">
                           {example.short}
                         </div>
                      </div>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Click any example to use it as your prompt
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
      </div>
    </div>
  );
};

export default HealthAssistantInput;