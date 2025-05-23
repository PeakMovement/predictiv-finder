
import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const feedbackVariants = cva(
  "flex items-start gap-2 text-sm rounded-md p-2.5",
  {
    variants: {
      variant: {
        error: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/30",
        warning: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/30",
        success: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/30",
        info: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30",
      },
      size: {
        default: "text-sm",
        sm: "text-xs py-1.5",
        lg: "text-base py-3",
      },
    },
    defaultVariants: {
      variant: "info",
      size: "default",
    },
  }
);

export interface ValidationFeedbackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof feedbackVariants> {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  suggestions?: string[];
}

/**
 * Consistent validation feedback component that can be used for form validation,
 * input guidance, and error messages throughout the app
 */
export function ValidationFeedback({
  title,
  message,
  variant = "info",
  size,
  className,
  icon,
  suggestions,
  ...props
}: ValidationFeedbackProps) {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />;
      default:
        return <Info className="h-4 w-4 text-blue-500 mt-0.5" />;
    }
  };

  return (
    <div className={cn(feedbackVariants({ variant, size, className }))} {...props}>
      {getIcon()}
      <div className="flex-1">
        {title && (
          <h5 className="font-medium mb-1">
            {title}
          </h5>
        )}
        <p>{message}</p>
        
        {suggestions && suggestions.length > 0 && (
          <ul className="list-disc list-inside mt-1.5 text-sm space-y-0.5 opacity-90">
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ValidationFeedback;
