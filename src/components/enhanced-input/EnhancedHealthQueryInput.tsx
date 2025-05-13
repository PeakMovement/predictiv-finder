
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { FormFeedback } from '@/components/ui/form-feedback';
import { validateStringInput } from '@/utils/inputValidation';
import { useToast } from '@/hooks/use-toast';
import { HealthConcern } from './types';

// Import our new components
import QuerySuggestions from './components/QuerySuggestions';
import HealthConcernsSection from './components/HealthConcernsSection';
import QuerySuggestionButtons from './components/QuerySuggestionButtons';
import ExampleQueries from './components/ExampleQueries';

interface EnhancedHealthQueryInputProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
}

/**
 * Enhanced input component for health queries
 * Provides suggestions, common health concerns, and example queries
 */
const EnhancedHealthQueryInput: React.FC<EnhancedHealthQueryInputProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Common health concerns with descriptions
  const commonHealthConcerns: HealthConcern[] = [
    {
      label: "Knee Pain",
      description: "Pain, stiffness, or swelling in the knee joint",
      examples: ["running injury", "osteoarthritis", "ligament strain"]
    },
    {
      label: "Back Pain",
      description: "Discomfort in the lower, middle, or upper back",
      examples: ["muscle strain", "herniated disc", "posture issues"]
    },
    {
      label: "Weight Management",
      description: "Support for healthy weight goals",
      examples: ["weight loss", "muscle gain", "metabolic health"]
    },
    {
      label: "Stress & Anxiety",
      description: "Mental health support for stress reduction",
      examples: ["work stress", "anxiety management", "relaxation"]
    },
    {
      label: "Sports Performance",
      description: "Optimize athletic performance and recovery",
      examples: ["marathon training", "strength goals", "injury prevention"]
    },
    {
      label: "Nutrition Guidance",
      description: "Dietary advice for specific health goals",
      examples: ["balanced diet", "sport nutrition", "dietary restrictions"]
    }
  ];
  
  // Sample budget suggestions
  const budgetSuggestions = ["R1000", "R2000", "R5000"];
  
  // Sample timeframe suggestions
  const timeframeSuggestions = ["4 weeks", "8 weeks", "3 months"];

  // Example queries
  const exampleQueries = [
    {
      text: "I've been experiencing knee pain for 3 months, especially after running. I'm training for a marathon in 6 months and need help managing the pain while still training. My budget is R3000 per month."
    },
    {
      text: "I'm looking for a weight loss plan. I need to lose about 10kg in the next 3 months for my wedding. I have a sedentary job and struggle with portion control. Budget around R2000 per month."
    }
  ];

  // Analyze input and provide suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && query.length > 5) {
        const newSuggestions: string[] = [];
        
        // Check if budget is missing
        if (!query.toLowerCase().includes("budget") && !query.match(/r\s*\d+/i)) {
          newSuggestions.push("Consider adding your budget");
        }
        
        // Check if timeframe is missing
        if (!query.toLowerCase().includes("week") && 
            !query.toLowerCase().includes("month") && 
            !query.toLowerCase().includes("day")) {
          newSuggestions.push("Consider specifying your timeframe");
        }
        
        // Check if specific goals are mentioned
        if (!query.toLowerCase().includes("goal") && 
            !query.toLowerCase().includes("aim") && 
            !query.toLowerCase().includes("want to")) {
          newSuggestions.push("Consider adding your specific health goals");
        }
        
        setSuggestions(newSuggestions);
      } else {
        setSuggestions([]);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [query]);

  // Handle submission with validation
  const handleSubmit = () => {
    const validation = validateStringInput(query, 10);
    
    if (!validation.isValid) {
      setError(validation.errorMessage || 'Please provide a valid description of your health needs.');
      
      toast({
        title: "Input too short",
        description: "Please provide more details about your health needs.",
        variant: "destructive",
      });
      
      return;
    }
    
    // Clear error if valid
    setError('');
    onSubmit(query);
  };

  // Add suggested text to query
  const addSuggestion = (text: string) => {
    setQuery((current) => {
      // Add appropriate spacing
      const needsSpace = current.length > 0 && !current.endsWith(' ');
      return `${current}${needsSpace ? ' ' : ''}${text}`;
    });
    
    // Focus the textarea after adding suggestion
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Toggle health concern selection
  const toggleConcern = (label: string) => {
    setSelectedConcerns(prev => {
      if (prev.includes(label)) {
        return prev.filter(c => c !== label);
      } else {
        return [...prev, label];
      }
    });
    
    // Add the concern to the query if it's being selected
    if (!selectedConcerns.includes(label)) {
      const concernData = commonHealthConcerns.find(c => c.label === label);
      if (concernData) {
        setQuery(prev => {
          const base = prev.length > 0 ? `${prev}. I'm dealing with ` : `I'm dealing with `;
          return `${base}${label.toLowerCase()}`;
        });
      }
    }
  };

  // Handle adding budget to query
  const addBudgetSuggestion = (budget: string) => {
    addSuggestion(`My budget is ${budget} per month.`);
  };

  // Handle adding timeframe to query
  const addTimeframeSuggestion = (timeframe: string) => {
    addSuggestion(`I'm looking for a ${timeframe} program.`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Describe Your Health Needs</CardTitle>
          <CardDescription>
            The more details you provide, the better we can personalize your health plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label htmlFor="health-query" className="block text-sm font-medium mb-2">
              What are your health concerns or goals?
            </label>
            <Textarea
              id="health-query"
              placeholder="Describe your health situation, goals, any pain or discomfort, budget considerations, and timeframe..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-32 resize-none"
              ref={textareaRef}
            />
            
            {error && (
              <FormFeedback
                message={error}
                variant="error"
                className="mt-2"
              />
            )}
          </div>
          
          <QuerySuggestions suggestions={suggestions} />
          
          <HealthConcernsSection 
            commonHealthConcerns={commonHealthConcerns} 
            selectedConcerns={selectedConcerns} 
            toggleConcern={toggleConcern} 
          />
          
          <div className="space-y-4">
            <QuerySuggestionButtons 
              title="Add Budget Information"
              suggestions={budgetSuggestions}
              onAddSuggestion={addBudgetSuggestion}
            />
            
            <QuerySuggestionButtons 
              title="Add Timeframe"
              suggestions={timeframeSuggestions}
              onAddSuggestion={addTimeframeSuggestion}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            disabled={isLoading}
            onClick={handleSubmit}
            className="bg-health-purple hover:bg-health-purple-dark"
          >
            {isLoading ? 'Generating Plans...' : 'Generate Health Plans'}
          </Button>
        </CardFooter>
      </Card>
      
      <ExampleQueries 
        examples={exampleQueries} 
        onUseExample={setQuery} 
      />
    </div>
  );
};

export default EnhancedHealthQueryInput;
