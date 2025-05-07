
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { validateStringInput } from '@/utils/inputValidation';
import { useToast } from '@/hooks/use-toast';

interface AIAssistantInputProps {
  onSubmit: (input: string) => void;
  isLoading?: boolean;
}

const AIAssistantInput: React.FC<AIAssistantInputProps> = ({ onSubmit, isLoading = false }) => {
  const [inputText, setInputText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    // Submit if valid
    onSubmit(inputText);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-4">Tell us what you need</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Describe your health needs, concerns, or goals in detail. Our AI will create personalized plans to help you.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            placeholder="For example: I need help with lower back pain that started 2 months ago. I work at a desk all day and I want to be able to play tennis again."
            value={inputText}
            onChange={handleChange}
            className={`min-h-32 ${validationError ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {validationError && (
            <p className="text-red-500 text-sm mt-1">{validationError}</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg" 
            className="px-8"
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
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
