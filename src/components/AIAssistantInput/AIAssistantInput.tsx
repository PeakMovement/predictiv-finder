
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
        
        {showTips && <InputTips />}
        
        <div className="mt-6">
          <ExamplePrompts onSelect={handleUseExample} />
        </div>
        
        {input.length > 20 && !isLoading && (
          <InputAnalysisDisplay input={input} />
        )}
      </Card>
    </div>
  );
};

export default AIAssistantInput;
