
import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, XCircle, RefreshCw, Info, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical' | 'success';

interface EnhancedErrorDisplayProps {
  title: string;
  message: string;
  severity?: ErrorSeverity;
  suggestions?: string[];
  details?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  onHelp?: () => void;
  className?: string;
  id?: string;
}

/**
 * Enhanced error display component with severity levels,
 * suggestions, and actionable buttons
 */
export const EnhancedErrorDisplay: React.FC<EnhancedErrorDisplayProps> = ({
  title,
  message,
  severity = 'error',
  suggestions,
  details,
  onRetry,
  onDismiss,
  onHelp,
  className,
  id,
}) => {
  // Define styles based on severity
  const severityConfig = {
    info: {
      icon: <Info className="h-5 w-5 text-blue-500" />,
      containerClass: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/30",
      titleClass: "text-blue-800 dark:text-blue-300",
      messageClass: "text-blue-700 dark:text-blue-300",
      buttonClass: "bg-blue-600 hover:bg-blue-700",
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      containerClass: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/30",
      titleClass: "text-amber-800 dark:text-amber-300",
      messageClass: "text-amber-700 dark:text-amber-300",
      buttonClass: "bg-amber-600 hover:bg-amber-700",
    },
    error: {
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      containerClass: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700/30",
      titleClass: "text-red-800 dark:text-red-300",
      messageClass: "text-red-700 dark:text-red-300",
      buttonClass: "bg-red-600 hover:bg-red-700",
    },
    critical: {
      icon: <XCircle className="h-5 w-5 text-rose-500" />,
      containerClass: "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/30",
      titleClass: "text-rose-800 dark:text-rose-300",
      messageClass: "text-rose-700 dark:text-rose-300",
      buttonClass: "bg-rose-600 hover:bg-rose-700",
    },
    success: {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      containerClass: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/30",
      titleClass: "text-green-800 dark:text-green-300",
      messageClass: "text-green-700 dark:text-green-300",
      buttonClass: "bg-green-600 hover:bg-green-700",
    },
  };
  
  const { icon, containerClass, titleClass, messageClass, buttonClass } = severityConfig[severity];
  
  return (
    <Card
      className={cn(
        "border rounded-lg shadow-sm animate-in fade-in duration-300", 
        containerClass,
        className
      )}
      id={id}
    >
      <CardHeader className="pb-2">
        <CardTitle className={cn("text-lg font-medium flex items-center gap-2", titleClass)}>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className={cn("text-sm", messageClass)}>
          {message}
        </p>
        
        {suggestions && suggestions.length > 0 && (
          <div className="mt-3 bg-white/70 dark:bg-gray-800/70 rounded-md p-3">
            <h4 className={cn("text-sm font-medium mb-1", titleClass)}>Suggestions:</h4>
            <ul className="list-disc list-inside space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-xs text-gray-700 dark:text-gray-300">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {details && (
          <details className="mt-3">
            <summary className={cn("text-xs cursor-pointer", titleClass)}>
              View details
            </summary>
            <pre className="mt-2 p-2 text-xs bg-white/70 dark:bg-gray-800/70 border border-current/10 rounded overflow-auto max-h-40">
              {details}
            </pre>
          </details>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2">
        {onRetry && (
          <Button
            size="sm"
            variant="default"
            className={cn("text-white", buttonClass)}
            onClick={onRetry}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Retry
          </Button>
        )}
        
        {onHelp && (
          <Button
            size="sm"
            variant="outline"
            onClick={onHelp}
          >
            <HelpCircle className="h-3.5 w-3.5 mr-1" />
            Help
          </Button>
        )}
        
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EnhancedErrorDisplay;
