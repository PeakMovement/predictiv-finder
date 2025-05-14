
import React, { useState, useRef, useEffect } from 'react';
import { Send, HelpCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';
import ExamplePrompts from './components/ExamplePrompts';
import InputTips from './components/InputTips';
import InputAnalysisDisplay from './components/InputAnalysisDisplay';

export interface AIAssistantInputProps {
  onSubmit: (input: string) => void;
  isLoading?: boolean;
  onError?: (type: any, message: string) => void;
  initialInput?: string;
}

export interface InputTipsProps {
  tipItems: string[];
}

export interface ExamplePromptsProps {
  examples: Array<{
    title: string;
    content: string;
    icon?: React.ReactNode;
  }>;
  onExampleClick: (content: string) => void;
}

export interface AnalysisProps {
  analysis: {
    suggestedCategories?: string[];
    budget?: number;
    hasBudgetConstraint?: boolean;
    primaryIssue?: string;
    medicalConditions?: string[];
    timeAvailability?: number;
    locationInfo?: {
      location?: string;
      isRemote: boolean;
    };
    specificGoals?: string[];
    hasEnoughInformation?: boolean;
    servicePriorities?: Record<string, number>;
    contextualFactors?: string[];
  }
}

const AIAssistantInput: React.FC<AIAssistantInputProps> = ({
  onSubmit,
  isLoading = false,
  onError,
  initialInput = ''
}) => {
  const [input, setInput] = useState(initialInput);
  const [showTips, setShowTips] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Reset error when input changes
  useEffect(() => {
    if (error && input) {
      setError('');
    }
  }, [input, error]);
  
  // Auto-resize textarea as content changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!input.trim()) {
      const errorMessage = 'Please describe your health concerns or goals';
      setError(errorMessage);
      if (onError) onError('input_validation', errorMessage);
      return;
    }
    
    if (input.trim().length < 10) {
      const errorMessage = 'Please provide more details about your health needs';
      setError(errorMessage);
      if (onError) onError('input_validation', errorMessage);
      return;
    }
    
    // Submit the input
    onSubmit(input.trim());
  };
  
  const handleUseExample = (example: string) => {
    setInput(example);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Sample health tips to show to users
  const healthTips = [
    'Be specific about your symptoms, their duration, and severity',
    'Mention any relevant medical history or conditions',
    'Include any treatments you\'ve already tried',
    'Specify if you have budget constraints or preferences',
    'Mention your location if relevant for in-person services',
  ];

  // Sample example queries
  const exampleQueries = [
    {
      title: 'Back pain after working out',
      content: 'I\'ve been experiencing lower back pain after weightlifting sessions for about 3 weeks. Looking for a treatment plan and ways to prevent it.'
    },
    {
      title: 'Weight loss support plan',
      content: 'Looking for a comprehensive plan to lose 10kg in the next 3 months. I prefer a mix of nutrition guidance and exercise.'
    },
    {
      title: 'Stress and anxiety management',
      content: 'I need help managing work-related stress and anxiety. Open to both therapy and holistic approaches.'
    }
  ];

  // Mock analysis for the input preview
  const generateMockAnalysis = (input: string) => {
    if (!input || input.length < 20) return null;
    
    return {
      primaryIssue: input.includes('pain') ? 'Pain management' : 'Health optimization',
      medicalConditions: input.includes('pain') ? ['Back pain'] : [],
      specificGoals: ['Improve overall health'],
      suggestedCategories: ['physiotherapy', 'nutrition-coaching'],
      budget: input.includes('budget') ? 5000 : undefined,
      hasBudgetConstraint: input.includes('budget'),
      timeAvailability: 8,
      locationInfo: {
        location: input.includes('Cape Town') ? 'Cape Town' : undefined,
        isRemote: input.includes('online') || input.includes('remote')
      },
      hasEnoughInformation: input.length > 50
    };
  };

  const mockAnalysis = generateMockAnalysis(input);

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6 shadow-md">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-3">Describe Your Health Needs</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Tell us about your health concerns, goals, or what you're looking for help with
          </p>
          
          <div className="relative mb-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: I've been experiencing lower back pain for about 3 weeks and would like to find some relief..."
              className={cn(
                "min-h-[120px] resize-none transition-all",
                error ? "border-red-500 focus-visible:ring-red-500" : ""
              )}
              disabled={isLoading}
            />
            {error && (
              <div className="flex items-center gap-2 text-red-500 mt-2 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <Button 
              type="button"
              variant="ghost" 
              size="sm"
              onClick={() => setShowTips(!showTips)}
              className="text-gray-500 flex items-center gap-1"
            >
              <HelpCircle className="h-4 w-4" />
              <span>{showTips ? 'Hide tips' : 'Show tips'}</span>
            </Button>
            
            <Button 
              type="submit" 
              className="bg-health-purple hover:bg-health-purple-dark"
              disabled={isLoading}
            >
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  <span>Generate Health Plans</span>
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
        
        {showTips && <InputTips tipItems={healthTips} />}
        
        <div className="mt-6">
          <ExamplePrompts examples={exampleQueries} onExampleClick={handleUseExample} />
        </div>
        
        {input.length > 20 && !isLoading && mockAnalysis && (
          <InputAnalysisDisplay analysis={mockAnalysis} />
        )}
      </Card>
    </div>
  );
};

export default AIAssistantInput;
