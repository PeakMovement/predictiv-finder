
import { useState, useEffect } from 'react';
import { validateHealthQueryInput } from '@/utils/inputValidation/enhancedInputValidator';

export interface ValidationState {
  isValid: boolean;
  message?: string;
  suggestions?: string[];
  severity: 'error' | 'warning' | 'info' | 'success';
  qualityScore?: number;
}

/**
 * A hook for validating input with real-time feedback
 * 
 * @param initialValue The initial input value
 * @param minLength Minimum length required for input
 * @param validateOnMount Whether to validate immediately on mount
 * @param debounceMs Debounce time in milliseconds
 */
export function useInputValidation(
  initialValue = '', 
  minLength = 10,
  validateOnMount = false,
  debounceMs = 500
) {
  const [input, setInput] = useState(initialValue);
  const [validation, setValidation] = useState<ValidationState>({
    isValid: false,
    severity: 'info'
  });
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Skip validation for empty input unless validateOnMount is true
    if (!input && !validateOnMount) {
      setValidation({
        isValid: false,
        severity: 'info'
      });
      return;
    }

    setIsValidating(true);
    const timer = setTimeout(() => {
      if (input.trim().length < minLength) {
        setValidation({
          isValid: false,
          message: `Please provide at least ${minLength} characters`,
          severity: 'warning'
        });
      } else {
        // Use our existing enhanced validator
        const result = validateHealthQueryInput(input);
        
        setValidation({
          isValid: result.isValid,
          message: result.isValid ? 'Input is valid' : result.errorMessage,
          suggestions: result.suggestions,
          severity: result.isValid ? 
            (result.qualityScore && result.qualityScore > 80 ? 'success' : 'info') : 
            'error',
          qualityScore: result.qualityScore
        });
      }
      setIsValidating(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [input, minLength, validateOnMount, debounceMs]);

  return {
    input,
    setInput,
    validation,
    isValidating
  };
}

export default useInputValidation;
