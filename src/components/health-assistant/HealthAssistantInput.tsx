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
  {
    issue: "I've been experiencing lower back pain for 3 weeks, especially when sitting",
    budget: 1000,
    location: "Johannesburg"
  },
  {
    issue: "Having skin issues - acne and rash on my face",
    budget: 800,
    location: "Cape Town"
  },
  {
    issue: "Chest pain and heart palpitations, need specialist consultation",
    budget: 1200,
    location: "Durban"
  },
  {
    issue: "Frequent headaches and memory issues",
    budget: 1500,
    location: "Pretoria"
  }
];

export const HealthAssistantInput: React.FC<HealthAssistantInputProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [query, setQuery] = useState<HealthQuery>({
    issue: '',
    budget: undefined,
    location: ''
  });
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!query.issue.trim()) {
      toast({
        title: "Health issue required",
        description: "Please describe your health concern or issue",
        variant: "destructive",
      });
      return;
    }

    if (query.issue.trim().length < 10) {
      toast({
        title: "Please provide more details",
        description: "Your description should be at least 10 characters long",
        variant: "destructive",
      });
      return;
    }

    onSubmit(query);
  };

  const handleExampleClick = (example: typeof exampleQueries[0]) => {
    setQuery({
      issue: example.issue,
      budget: example.budget,
      location: example.location
    });
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
            <Label htmlFor="health-issue" className="text-base font-medium">
              What health issue are you experiencing? *
            </Label>
            <Textarea
              id="health-issue"
              placeholder="Describe your symptoms, pain, or health concerns in detail..."
              value={query.issue}
              onChange={(e) => setQuery(prev => ({ ...prev, issue: e.target.value }))}
              className="mt-2 h-32"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget" className="text-base font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Monthly Budget (Rands)
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 1000"
                value={query.budget || ''}
                onChange={(e) => setQuery(prev => ({ 
                  ...prev, 
                  budget: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-base font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Preferred Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., Johannesburg, Cape Town"
                value={query.location || ''}
                onChange={(e) => setQuery(prev => ({ ...prev, location: e.target.value }))}
                className="mt-2"
              />
            </div>
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
                  <div>
                    <div className="font-medium text-sm mb-1">
                      {example.issue}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Budget: R{example.budget} • Location: {example.location}
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