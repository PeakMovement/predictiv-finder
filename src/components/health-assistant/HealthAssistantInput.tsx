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
  const [analysisResult, setAnalysisResult] = useState<any>(null);
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
    
    if (lowerPrompt.includes('pain') || lowerPrompt.includes('hurt') || lowerPrompt.includes('ache')) concerns.push('Pain management');
    if (lowerPrompt.includes('weight') || lowerPrompt.includes('diet') || lowerPrompt.includes('obesity')) concerns.push('Weight management');
    if (lowerPrompt.includes('mental') || lowerPrompt.includes('stress') || lowerPrompt.includes('anxiety') || lowerPrompt.includes('depression')) concerns.push('Mental health');
    if (lowerPrompt.includes('heart') || lowerPrompt.includes('cardio') || lowerPrompt.includes('chest pain')) concerns.push('Cardiovascular health');
    if (lowerPrompt.includes('diabetes') || lowerPrompt.includes('blood sugar')) concerns.push('Diabetes management');
    if (lowerPrompt.includes('skin') || lowerPrompt.includes('acne') || lowerPrompt.includes('rash')) concerns.push('Dermatology');
    if (lowerPrompt.includes('headache') || lowerPrompt.includes('migraine') || lowerPrompt.includes('memory')) concerns.push('Neurology');
    
    return concerns.length > 0 ? concerns : ['General health consultation'];
  };

  const getRecommendedDoctor = (concerns: string[]): string => {
    if (concerns.includes('Pain management')) return 'Orthopedic Doctor';
    if (concerns.includes('Cardiovascular health')) return 'Cardiologist';
    if (concerns.includes('Mental health')) return 'Psychiatrist';
    if (concerns.includes('Dermatology')) return 'Dermatologist';
    if (concerns.includes('Neurology')) return 'Neurologist';
    if (concerns.includes('Weight management')) return 'Endocrinologist';
    if (concerns.includes('Diabetes management')) return 'Endocrinologist';
    return 'General Practitioner';
  };

  // Analysis only (no auto-recommendations)
  const debouncedAnalysis = useCallback(
    debounce(async (searchPrompt: string) => {
      if (searchPrompt.trim().length >= 10) {
        try {
          // Generate analysis for display (no physician search)
          const primaryConcerns = extractHealthConcerns(searchPrompt);
          const analysis = {
            primaryConcerns,
            budget: extractBudget(searchPrompt),
            location: extractLocation(searchPrompt),
            recommendedDoctor: getRecommendedDoctor(primaryConcerns),
            hasEnoughInfo: searchPrompt.trim().length > 30 && (extractBudget(searchPrompt) !== undefined || extractLocation(searchPrompt) !== undefined)
          };
          setAnalysisResult(analysis);
        } catch (error) {
          console.error('Analysis error:', error);
          setAnalysisResult(null);
        }
      } else {
        setAnalysisResult(null);
      }
    }, 500), // 0.5 second delay for analysis only
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
        <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-health-purple/10">
                <Stethoscope className="w-8 h-8 text-health-purple" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                AI Health Assistant
              </CardTitle>
            </div>
            <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect physician for your health needs. Just describe your symptoms, budget, and location in one message.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left side - Main prompt input */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="health-prompt" className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                    <User className="w-5 h-5 text-health-purple" />
                    Describe your health concern *
                  </Label>
                  <Textarea
                    id="health-prompt"
                    placeholder="Describe your health concern, budget, and preferred location..."
                    value={query.prompt}
                    onChange={(e) => setQuery({ prompt: e.target.value })}
                    className="min-h-[160px] text-base leading-relaxed border-2 border-input focus:border-health-purple/50 transition-all duration-300 bg-background resize-none"
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
                         {analysisResult.recommendedDoctor && (
                           <div className="flex items-start gap-2">
                             <span className="font-medium text-muted-foreground">Recommended doctor:</span>
                             <span>{analysisResult.recommendedDoctor}</span>
                           </div>
                         )}
                         <div className="flex items-center gap-2 pt-2 border-t">
                          {analysisResult.hasEnoughInfo ? (
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
                    className="px-8 py-6 text-lg font-semibold bg-health-purple hover:bg-health-purple-dark text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
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
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-health-purple rounded-full animate-pulse"></span>
                  Try these examples
                </h3>
                <div className="space-y-3">
                  {exampleQueries.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full text-left h-auto p-4 justify-start border-2 border-border hover:border-health-purple/50 hover:bg-health-purple/5 transition-all duration-300 hover:scale-105 hover:shadow-md group bg-background whitespace-normal"
                      onClick={() => handleExampleClick(example)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="p-2 rounded-full bg-health-purple/10 group-hover:bg-health-purple/20 transition-colors flex-shrink-0">
                          <User className="w-4 h-4 text-health-purple" />
                        </div>
                         <div className="text-sm leading-relaxed text-gray-600 group-hover:text-gray-900 transition-colors text-left break-words">
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