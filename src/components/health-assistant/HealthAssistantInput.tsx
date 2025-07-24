import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { HealthQuery, PhysicianRecommendation, findRecommendedPhysicians } from '@/services/physician-recommendation-service';
import PhysicianCard from '@/components/physician-recommendations/PhysicianCard';
import { User, MapPin, DollarSign, Stethoscope } from 'lucide-react';

interface HealthAssistantInputProps {
  onSubmit: (query: HealthQuery) => void;
  isLoading?: boolean;
}

const exampleQueries = [
  "I've been experiencing lower back pain for 3 weeks, especially when sitting. My budget is R1000 per month and I'd prefer a doctor in Johannesburg.",
  "Having skin issues - acne and rash on my face. Budget is R800 and location Cape Town.",
  "Chest pain and heart palpitations, need specialist consultation. My budget is R1200 per month in Durban.",
  "Frequent headaches and memory issues. Budget R1500, prefer Pretoria location."
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
  const { toast } = useToast();

  // Debounced search for auto-recommendations
  const debouncedSearch = useCallback(
    debounce(async (searchPrompt: string) => {
      if (searchPrompt.trim().length >= 15) { // Only search if prompt is substantial
        setIsAutoSearching(true);
        try {
          const recommendations = await findRecommendedPhysicians({ prompt: searchPrompt });
          setAutoRecommendations(recommendations.slice(0, 3)); // Show top 3
        } catch (error) {
          console.error('Auto-search error:', error);
          setAutoRecommendations([]);
        } finally {
          setIsAutoSearching(false);
        }
      } else {
        setAutoRecommendations([]);
      }
    }, 1000), // 1 second delay
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
    debouncedSearch(query.prompt);
  }, [query.prompt, debouncedSearch]);

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

  const handleExampleClick = (example: string) => {
    setQuery({ prompt: example });
  };

  const handleAutoRecommendationSelect = (physician: PhysicianRecommendation) => {
    toast({
      title: "Physician Selected from Auto-Recommendations",
      description: `Selected ${physician.Name} - ${physician.Title}`,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
                    placeholder="Example: I've been experiencing lower back pain for 3 weeks, especially when sitting. My budget is R1000 per month and I'd prefer a doctor in Johannesburg."
                    value={query.prompt}
                    onChange={(e) => setQuery({ prompt: e.target.value })}
                    className="min-h-[160px] text-base leading-relaxed border-2 border-input focus:border-health-purple/50 transition-all duration-300 bg-background resize-none"
                    required
                  />
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Include your budget (e.g., R1000)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Mention your preferred location</span>
                    </div>
                  </div>
                  {isAutoSearching && (
                    <div className="flex items-center gap-2 text-sm text-health-purple">
                      <div className="animate-spin w-4 h-4 border-2 border-health-purple border-t-transparent rounded-full" />
                      <span>Finding recommendations...</span>
                    </div>
                  )}
                </div>

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
                          {example}
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

        {/* Right side - Auto Recommendations */}
        {(autoRecommendations.length > 0 || isAutoSearching) && (
          <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-health-purple" />
                Live Recommendations
              </CardTitle>
              <CardDescription className="text-gray-600">
                Based on your current description
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAutoSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-health-purple/20 border-t-health-purple rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {autoRecommendations.map((physician, index) => (
                    <div 
                      key={`auto-${physician.Name}-${index}`}
                      className="transform scale-95"
                    >
                      <PhysicianCard 
                        physician={physician}
                        onSelect={handleAutoRecommendationSelect}
                      />
                    </div>
                  ))}
                  {autoRecommendations.length > 0 && (
                    <p className="text-xs text-gray-500 text-center pt-4 border-t">
                      Live preview • Click "Find My Physician" for complete results
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HealthAssistantInput;