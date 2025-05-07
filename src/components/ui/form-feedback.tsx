
import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

export type FeedbackVariant = 'error' | 'warning' | 'success' | 'info';

/**
 * Props for the FormFeedback component
 */
interface FormFeedbackProps {
  /** The message to display */
  message: string;
  /** The type of feedback */
  variant: FeedbackVariant;
  /** Additional CSS classes */
  className?: string;
  /** ID for accessibility/testing */
  id?: string;
  /** Whether to animate the feedback */
  animate?: boolean;
}

/**
 * Component for displaying form feedback messages
 * Provides visual cues based on feedback type (error, warning, success, info)
 * 
 * @example
 * ```tsx
 * <FormFeedback 
 *   message="Please enter a valid email" 
 *   variant="error" 
 * />
 * ```
 */
export const FormFeedback: React.FC<FormFeedbackProps> = ({
  message,
  variant = "info",
  className,
  id,
  animate = true,
}) => {
  // Early return if no message
  if (!message) return null;

  // Configure styles based on variant
  const variantStyles = {
    error: {
      container: "bg-red-50 border-red-300 text-red-800",
      icon: <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />,
      role: "alert"
    },
    warning: {
      container: "bg-yellow-50 border-yellow-300 text-yellow-800",
      icon: <AlertTriangle className="h-4 w-4 text-yellow-500" aria-hidden="true" />,
      role: "status"
    },
    success: {
      container: "bg-green-50 border-green-300 text-green-800",
      icon: <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />,
      role: "status"
    },
    info: {
      container: "bg-blue-50 border-blue-300 text-blue-800",
      icon: <Info className="h-4 w-4 text-blue-500" aria-hidden="true" />,
      role: "status"
    }
  };

  const { container, icon, role } = variantStyles[variant];

  return (
    <div
      id={id}
      role={role}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm border mt-1",
        container,
        animate && "animate-fade-in",
        className
      )}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
};

/**
 * Component for displaying form field error
 * Simplified wrapper around FormFeedback for error messages
 * 
 * @example
 * ```tsx
 * <FormError message={errors.email?.message} />
 * ```
 */
export const FormError: React.FC<{ message?: string; className?: string; id?: string }> = ({ 
  message, 
  className,
  id 
}) => {
  if (!message) return null;
  return (
    <FormFeedback
      message={message}
      variant="error"
      className={className}
      id={id}
    />
  );
};

/**
 * Component for displaying form field success message
 * Simplified wrapper around FormFeedback for success messages
 * 
 * @example
 * ```tsx
 * <FormSuccess message="Changes saved successfully" />
 * ```
 */
export const FormSuccess: React.FC<{ message?: string; className?: string; id?: string }> = ({ 
  message, 
  className,
  id 
}) => {
  if (!message) return null;
  return (
    <FormFeedback
      message={message}
      variant="success"
      className={className}
      id={id}
    />
  );
};
