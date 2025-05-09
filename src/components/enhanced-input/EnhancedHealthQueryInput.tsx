
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Badge } from '@/components/ui/badge';
import { validateStringInput } from '@/utils/inputValidation';
import { AlertCircle, HelpCircle, Lightbulb, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedHealthQueryInputProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
}

// Common health concerns with descriptions
const commonHealthConcerns = [
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

const EnhancedHealthQueryInput: React.FC<EnhancedHealthQueryInputProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Sample budget suggestions
  const budgetSuggestions = ["R1000", "R2000", "R5000"];
  
  // Sample timeframe suggestions
  const timeframeSuggestions = ["4 weeks", "8 weeks", "3 months"];

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
          
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Lightbulb className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">Suggestions to improve your query</h3>
                      <ul className="mt-2 text-sm text-amber-700 list-disc list-inside">
                        {suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Common Health Concerns</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowHelp(!showHelp)}
                className="h-8 px-2 text-gray-500"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">Help</span>
              </Button>
            </div>
            
            <AnimatePresence>
              {showHelp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3 text-sm">
                      <p className="text-blue-800">
                        Click on any health concern to add it to your query. This helps our AI understand your needs better.
                        For best results, include:
                      </p>
                      <ul className="list-disc list-inside mt-2 text-blue-700 text-xs">
                        <li>Your main health concern or goal</li>
                        <li>Any pain or discomfort you're experiencing</li>
                        <li>Your budget (e.g., "my budget is R2000")</li>
                        <li>Your timeframe (e.g., "looking for an 8-week program")</li>
                        <li>Any preferences (e.g., "prefer in-person sessions")</li>
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex flex-wrap gap-2">
              {commonHealthConcerns.map((concern) => (
                <Badge
                  key={concern.label}
                  variant={selectedConcerns.includes(concern.label) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => toggleConcern(concern.label)}
                >
                  {concern.label}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Add Budget Information</h3>
              <div className="flex flex-wrap gap-2">
                {budgetSuggestions.map((budget) => (
                  <Button
                    key={budget}
                    variant="outline"
                    size="sm"
                    onClick={() => addSuggestion(`My budget is ${budget} per month.`)}
                  >
                    {budget}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Add Timeframe</h3>
              <div className="flex flex-wrap gap-2">
                {timeframeSuggestions.map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant="outline"
                    size="sm"
                    onClick={() => addSuggestion(`I'm looking for a ${timeframe} program.`)}
                  >
                    {timeframe}
                  </Button>
                ))}
              </div>
            </div>
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
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md">
        <h3 className="text-lg font-medium mb-4">Example Queries</h3>
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-sm italic mb-1">
              "I've been experiencing knee pain for 3 months, especially after running. I'm training for a marathon in 6 months and need help managing the pain while still training. My budget is R3000 per month."
            </p>
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setQuery("I've been experiencing knee pain for 3 months, especially after running. I'm training for a marathon in 6 months and need help managing the pain while still training. My budget is R3000 per month.")}
              >
                Use this example
              </Button>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-sm italic mb-1">
              "I'm looking for a weight loss plan. I need to lose about 10kg in the next 3 months for my wedding. I have a sedentary job and struggle with portion control. Budget around R2000 per month."
            </p>
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setQuery("I'm looking for a weight loss plan. I need to lose about 10kg in the next 3 months for my wedding. I have a sedentary job and struggle with portion control. Budget around R2000 per month.")}
              >
                Use this example
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHealthQueryInput;
