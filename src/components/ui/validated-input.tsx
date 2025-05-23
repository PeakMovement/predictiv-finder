
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ValidationFeedback } from '@/components/ui/validation-feedback';
import { cn } from '@/lib/utils';
import { useInputValidation } from '@/hooks/use-input-validation';

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  description?: string;
  error?: string;
  onChange?: (value: string) => void;
  onValidation?: (isValid: boolean) => void;
  minLength?: number;
  validateOnMount?: boolean;
  className?: string;
  multiline?: boolean;
  rows?: number;
  showValidationFeedback?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  description,
  error,
  defaultValue = '',
  onChange,
  onValidation,
  minLength = 0,
  validateOnMount = false,
  className,
  multiline = false,
  rows = 3,
  showValidationFeedback = true,
  ...props
}) => {
  const {
    input,
    setInput,
    validation,
    isValidating
  } = useInputValidation(defaultValue as string, minLength, validateOnMount);
  
  // Notify parent about validation state changes
  React.useEffect(() => {
    if (onValidation) {
      onValidation(validation.isValid);
    }
  }, [validation.isValid, onValidation]);
  
  // Notify parent about input changes
  React.useEffect(() => {
    if (onChange) {
      onChange(input);
    }
  }, [input, onChange]);
  
  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
  };

  // Show externally provided error or validation message
  const showError = error || (validation.severity === 'error' && validation.message);
  
  // Show validation feedback below the input
  const showFeedback = showValidationFeedback && 
    ((validation.message && input.length > 0) || showError);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={props.id}>
          {label}
        </Label>
      )}
      
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      {multiline ? (
        <Textarea
          {...props as any}
          value={input}
          onChange={handleChange}
          rows={rows}
          className={cn(
            showError ? "border-red-300 focus-visible:ring-red-300" : "",
            (props as any).className || ""
          )}
        />
      ) : (
        <Input
          {...props}
          value={input}
          onChange={handleChange}
          className={cn(
            showError ? "border-red-300 focus-visible:ring-red-300" : "",
            (props as any).className || ""
          )}
        />
      )}
      
      {showFeedback && (
        <ValidationFeedback
          variant={showError ? "error" : validation.severity}
          message={showError || validation.message || ''}
          suggestions={validation.suggestions}
        />
      )}
    </div>
  );
};

export default ValidatedInput;
