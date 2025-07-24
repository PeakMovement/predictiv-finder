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
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Stethoscope className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl">AI Health Assistant</CardTitle>
          </div>
          <CardDescription>
            Find the perfect physician for your health needs based on specialty, budget, and location
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="health-prompt" className="text-base font-medium">
              Describe your health concern, budget, and location *
            </Label>
            <Textarea
              id="health-prompt"
              placeholder="Example: I've been experiencing lower back pain for 3 weeks. My budget is R1000 per month and I'd prefer a doctor in Johannesburg."
              value={query.prompt}
              onChange={(e) => setQuery({ prompt: e.target.value })}
              className="mt-2 h-32"
              required
            />
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              size="lg"
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Finding Physicians...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Find My Physician
                </>
              )}
            </Button>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium mb-4 text-center">Try these examples:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exampleQueries.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left h-auto p-4 justify-start"
                  onClick={() => handleExampleClick(example)}
                >
                  <div className="font-medium text-sm">
                    {example}
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