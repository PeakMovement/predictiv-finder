
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  className
}) => {
  return (
    <div className={cn("flex items-center justify-between mb-8", className)}>
      {steps.map((step, index) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className={cn(
              "text-xs mt-2 text-center max-w-[80px] leading-tight",
              index <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              "flex-1 h-0.5 mx-2 mt-[-20px]",
              index < currentStep ? "bg-primary" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  );
};
