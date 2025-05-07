
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner"; 
import { LoadingIndicator, ProgressBar } from "@/components/ui/loading-indicator";
import { validateStringInput } from '@/utils/inputValidation';
import { useToast } from '@/hooks/use-toast';
import { FormError } from '@/components/ui/form-feedback';

interface AIAssistantInputProps {
  onSubmit: (input: string) => void;
  isLoading?: boolean;
}

/**
 * Input component for the AI Assistant feature
 * Allows users to describe their health needs for AI analysis
 */
const AIAssistantInput: React.FC<AIAssistantInputProps> = ({ onSubmit, isLoading = false }) => {
  const [inputText, setInputText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFormTouched, setIsFormTouched] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputText(value);
    
    // Mark form as touched once user starts typing
    if (!isFormTouched) {
      setIsFormTouched(true);
    }
    
    // Live validation after user has started typing
    if (isFormTouched) {
      const validation = validateStringInput(value, 20, 1000);
      setValidationError(validation.isValid ? null : validation.errorMessage);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormTouched(true);
    
    // Validate the input
    const validation = validateStringInput(inputText, 20, 1000);
    
    if (!validation.isValid) {
      setValidationError(validation.errorMessage);
      toast({
        title: "Input validation error",
        description: validation.errorMessage,
        variant: "destructive",
      });
      return;
    }
    
    // Clear any validation errors
    setValidationError(null);
    
    // Submit if valid
    onSubmit(inputText);
  };

  // Calculate input quality score based on length and detail
  const getInputQualityScore = (): number => {
    if (!inputText || inputText.length < 20) return 0;
    
    // Base score on length
    let score = Math.min(100, Math.max(0, (inputText.length / 200) * 100));
    
    // Bonus for including specific details
    if (inputText.includes("pain") || inputText.includes("symptom")) score += 5;
    if (inputText.includes("month") || inputText.includes("week") || inputText.includes("year")) score += 5;
    if (inputText.includes("budget") || inputText.includes("cost")) score += 5;
    if (inputText.includes("goal")) score += 5;
    if (inputText.includes("location") || inputText.includes("online")) score += 5;
    
    // Cap at 100
    return Math.min(100, score);
  };

  const inputQuality = getInputQualityScore();
  const showQualityIndicator = inputText.length > 10;
  
  // Determine quality label
  const getQualityLabel = (): string => {
    if (inputQuality < 30) return 'Basic';
    if (inputQuality < 70) return 'Good';
    return 'Detailed';
  };
  
  // Determine quality color
  const getQualityColor = (): string => {
    if (inputQuality < 30) return 'text-yellow-600'; 
    if (inputQuality < 70) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-4">Tell us what you need</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Describe your health needs, concerns, or goals in detail. Our AI will create personalized plans to help you.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="health-input" className="sr-only">Health needs input</label>
          <Textarea
            id="health-input"
            placeholder="For example: I need help with lower back pain that started 2 months ago. I work at a desk all day and I want to be able to play tennis again."
            value={inputText}
            onChange={handleChange}
            className={`min-h-32 ${validationError ? 'border-red-500 focus:ring-red-500' : ''}`}
            disabled={isLoading}
            aria-invalid={!!validationError}
            aria-describedby={validationError ? "input-error" : undefined}
          />
          
          <FormError 
            id="input-error"
            message={validationError || ""} 
          />
          
          {showQualityIndicator && (
            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Input quality</span>
                <span className={getQualityColor()}>{getQualityLabel()}</span>
              </div>
              <ProgressBar value={inputQuality} />
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg" 
            className="px-8"
            disabled={isLoading || !inputText.trim() || !!validationError}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner variant="dots" className="mr-2 h-4 w-4" />
                Generating plans...
              </>
            ) : (
              'Generate Health Plans'
            )}
          </Button>
        </div>
      </form>
      
      <div className="mt-8">
        <h4 className="font-medium mb-2">Tips for best results:</h4>
        <ul className="list-disc pl-6 text-sm text-gray-600 dark:text-gray-300">
          <li>Include any specific symptoms or conditions</li>
          <li>Mention your goals and timeline</li>
          <li>Share relevant limitations (e.g., budget constraints, location)</li>
          <li>Specify if you prefer remote/online services</li>
        </ul>
      </div>
    </div>
  );
};

export default AIAssistantInput;
