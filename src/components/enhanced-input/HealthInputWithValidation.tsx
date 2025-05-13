
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { validateHealthQueryInput } from '@/utils/inputValidation/enhancedInputValidator';
import { EnhancedErrorDisplay } from '@/components/enhanced-error-handling/EnhancedErrorDisplay';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HealthInputWithValidationProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  minLength?: number;
  maxLength?: number;
  showQualityIndicator?: boolean;
}

/**
 * Enhanced health input component with real-time validation
 * and detailed user feedback
 */
export const HealthInputWithValidation: React.FC<HealthInputWithValidationProps> = ({
  onSubmit,
  isLoading = false,
  placeholder = "Describe your health needs in detail...",
  className,
  minLength = 10,
  maxLength = 3000,
  showQualityIndicator = true,
}) => {
  const [input, setInput] = useState('');
  const [validation, setValidation] = useState<ReturnType<typeof validateHealthQueryInput> | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  
  // Validate input on change after debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) {
        const result = validateHealthQueryInput(input);
        setValidation(result);
      } else {
        setValidation(null);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [input]);
  
  // Quality indicator color based on score
  const getQualityColor = (score?: number) => {
    if (!score) return 'bg-gray-200 dark:bg-gray-700';
    if (score < 40) return 'bg-red-500';
    if (score < 70) return 'bg-amber-500';
    return 'bg-green-500';
  };
  
  // Handle submission with validation
  const handleSubmit = () => {
    const result = validateHealthQueryInput(input);
    setValidation(result);
    
    if (result.isValid) {
      onSubmit(result.validatedValue || input);
    }
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Describe Your Health Needs</CardTitle>
          
          <div className="flex items-center gap-2">
            {showQualityIndicator && validation?.qualityScore !== undefined && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">
                        Quality:
                      </span>
                      <div className="w-8 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-300", 
                            getQualityColor(validation.qualityScore)
                          )}
                          style={{ width: `${validation.qualityScore}%` }}
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Input quality score: {validation.qualityScore}/100</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="h-4 w-4" />
              <span className="sr-only">Help</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showHelp && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-md p-3 text-sm text-blue-800 dark:text-blue-300">
            <h4 className="font-medium mb-1">For better health recommendations, include:</h4>
            <ul className="list-disc list-inside text-xs space-y-1 text-blue-700 dark:text-blue-300">
              <li>Specific symptoms or health concerns</li>
              <li>How long you've experienced these issues</li>
              <li>The severity of your symptoms</li>
              <li>Your health goals or what you want to achieve</li>
              <li>Your budget or financial constraints</li>
              <li>Any previous treatments or approaches you've tried</li>
            </ul>
          </div>
        )}
        
        <div>
          <Textarea
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            className="resize-none"
            maxLength={maxLength}
          />
          
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
              {input.length}/{maxLength} characters
            </span>
          </div>
        </div>
        
        {/* Improvement badges */}
        {validation?.improvementAreas && validation.improvementAreas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {validation.improvementAreas.map((area, index) => (
              <Badge 
                key={index}
                variant="outline"
                className={cn(
                  "text-xs border",
                  area.severity === 'high' ? "border-red-300 text-red-700 dark:border-red-700 dark:text-red-300" :
                  area.severity === 'medium' ? "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300" :
                  "border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300"
                )}
              >
                {area.area === 'length' ? 'Input length' : 
                 area.area === 'descriptiveness' ? 'More details needed' :
                 area.area === 'specificity' ? 'Be more specific' :
                 area.area === 'health-context' ? 'Health context' :
                 area.area === 'timeframe' ? 'Timeframe' :
                 area.area === 'severity' ? 'Symptom severity' :
                 area.area === 'budget' ? 'Budget info' :
                 area.area === 'goals' ? 'Health goals' :
                 area.area}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Validation feedback */}
        {validation && !validation.isValid && (
          <EnhancedErrorDisplay
            title="Invalid Input"
            message={validation.errorMessage || "Please check your input and try again."}
            severity="error"
            suggestions={validation.suggestions}
          />
        )}
        
        {validation && validation.isValid && validation.suggestions && validation.suggestions.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Your input could be improved
                </h4>
                <ul className="mt-1 list-disc list-inside text-xs space-y-1 text-amber-700 dark:text-amber-300">
                  {validation.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {validation && validation.isValid && (!validation.suggestions || validation.suggestions.length === 0) && (
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Great input! We have all the information we need.</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button
          className="w-full"
          disabled={isLoading || !validation?.isValid}
          onClick={handleSubmit}
        >
          {isLoading ? "Processing..." : "Generate Health Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HealthInputWithValidation;
