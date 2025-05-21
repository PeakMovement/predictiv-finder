import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import HealthInputWithValidation from './HealthInputWithValidation';
import ExtractionComparison from './components/ExtractionComparison';
import { extractHealthData } from '@/utils/healthDataExtraction';

interface AIInputWithExtractionProps {
  onSubmit: (input: string, extractionMethod: 'openai' | 'local-model' | 'hybrid') => void;
  isLoading?: boolean;
}

const AIInputWithExtraction: React.FC<AIInputWithExtractionProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [saveAPIKey, setSaveAPIKey] = useState(false);
  const [extractionMethod, setExtractionMethod] = useState<'openai' | 'local-model' | 'hybrid'>('local-model');
  const { toast } = useToast();
  
  // Load saved API key if it exists
  useState(() => {
    try {
      const savedKey = localStorage.getItem('openai_api_key');
      if (savedKey) {
        setApiKey(savedKey);
        setSaveAPIKey(true);
      }
    } catch (error) {
      console.error("Failed to load saved API key:", error);
    }
  });
  
  const handleInputSubmit = (validatedInput: string) => {
    setInput(validatedInput);
    
    // Save API key if requested
    if (saveAPIKey && apiKey) {
      try {
        localStorage.setItem('openai_api_key', apiKey);
      } catch (error) {
        console.error("Failed to save API key:", error);
      }
    }
    
    // If comparison is shown, let the user select the extraction method
    if (showComparison) {
      setShowComparison(true);
    } else {
      // Otherwise, use the currently selected method
      handleSubmit(extractionMethod);
    }
  };
  
  const handleSubmit = (method: 'openai' | 'local-model' | 'hybrid') => {
    if (!input) {
      toast({
        title: "Input Required",
        description: "Please describe your health needs first",
        variant: "destructive"
      });
      return;
    }
    
    // For OpenAI method, ensure we have an API key
    if (method === 'openai' && !apiKey) {
      toast({
        title: "API Key Required",
        description: "Please provide an OpenAI API key to use this extraction method",
        variant: "destructive"
      });
      return;
    }
    
    // Save the selected extraction method
    setExtractionMethod(method);
    
    // Submit with the chosen extraction method
    onSubmit(input, method);
  };
  
  return (
    <div className="space-y-6">
      <HealthInputWithValidation
        onSubmit={handleInputSubmit}
        isLoading={isLoading}
        placeholder="Describe your health needs in detail. For example: I have been experiencing lower back pain for the past 3 weeks, especially after sitting for long periods. I want to improve my mobility and reduce pain. My budget is around R1500 per month."
      />
      
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">OpenAI Integration</h3>
            <Switch 
              checked={showComparison} 
              onCheckedChange={setShowComparison}
              id="show-comparison"
            />
            <Label htmlFor="show-comparison" className="text-sm text-gray-500">
              Compare extraction methods
            </Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="api-key">OpenAI API Key (optional)</Label>
            <Input 
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="font-mono"
            />
            <div className="flex items-center space-x-2">
              <Switch 
                checked={saveAPIKey} 
                onCheckedChange={setSaveAPIKey}
                id="save-key"
              />
              <Label htmlFor="save-key" className="text-sm text-gray-500">
                Save API key in browser (localStorage)
              </Label>
            </div>
          </div>
          
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit('local-model')}
              disabled={isLoading}
            >
              Use Local Model
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSubmit('hybrid')}
              disabled={isLoading || (!apiKey && showComparison)}
            >
              Use Hybrid Approach
            </Button>
            
            <Button
              onClick={() => handleSubmit('openai')}
              disabled={isLoading || !apiKey}
            >
              Use OpenAI Extraction
            </Button>
          </div>
        </div>
      </Card>
      
      {showComparison && input.length > 10 && (
        <ExtractionComparison
          userInput={input}
          openAIKey={apiKey}
          onSelectExtraction={handleSubmit}
        />
      )}
    </div>
  );
};

export default AIInputWithExtraction;
