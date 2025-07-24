import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { HealthQuery } from '@/services/physician-recommendation-service';
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
  const { toast } = useToast();

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

  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-fade-in">
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
              className="min-h-[120px] text-base leading-relaxed border-2 border-input focus:border-health-purple/50 transition-all duration-300 bg-background"
              required
            />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Include your budget (e.g., R1000)</span>
              <MapPin className="w-4 h-4 ml-4" />
              <span>Mention your preferred location</span>
            </div>
          </div>

          <div className="flex justify-center">
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

          <div className="border-t border-border pt-8">
            <h3 className="text-xl font-semibold mb-6 text-center flex items-center justify-center gap-2 text-gray-900">
              <span className="w-2 h-2 bg-health-purple rounded-full animate-pulse"></span>
              Try these examples
              <span className="w-2 h-2 bg-health-purple rounded-full animate-pulse"></span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exampleQueries.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left h-auto p-6 justify-start border-2 border-border hover:border-health-purple/50 hover:bg-health-purple/5 transition-all duration-300 hover:scale-105 hover:shadow-md group bg-background"
                  onClick={() => handleExampleClick(example)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-health-purple/10 group-hover:bg-health-purple/20 transition-colors">
                      <User className="w-4 h-4 text-health-purple" />
                    </div>
                    <div className="text-sm leading-relaxed text-gray-600 group-hover:text-gray-900 transition-colors">
                      {example}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthAssistantInput;