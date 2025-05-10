
import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ImportValidatorProps {
  imports: Array<{
    path: string;
    expectedExports: string[];
  }>;
  onValidationComplete?: (success: boolean) => void;
}

/**
 * Validates imports and exports at runtime to catch mismatches early
 */
export const ImportValidator: React.FC<ImportValidatorProps> = ({ 
  imports,
  onValidationComplete
}) => {
  const [validationResults, setValidationResults] = useState<Record<string, {
    success: boolean;
    missingExports: string[];
    error?: string;
  }>>({});
  
  const [isComplete, setIsComplete] = useState(false);
  const [overallSuccess, setOverallSuccess] = useState(true);
  
  useEffect(() => {
    const validateImports = async () => {
      const results: typeof validationResults = {};
      let allSuccessful = true;
      
      for (const importDef of imports) {
        try {
          // Dynamically import the module
          const module = await import(/* @vite-ignore */ importDef.path);
          
          // Check if all expected exports are present
          const missingExports = importDef.expectedExports.filter(
            exportName => !(exportName in module)
          );
          
          const success = missingExports.length === 0;
          if (!success) allSuccessful = false;
          
          results[importDef.path] = {
            success,
            missingExports,
          };
        } catch (error) {
          allSuccessful = false;
          results[importDef.path] = {
            success: false,
            missingExports: importDef.expectedExports,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
      
      setValidationResults(results);
      setIsComplete(true);
      setOverallSuccess(allSuccessful);
      
      if (onValidationComplete) {
        onValidationComplete(allSuccessful);
      }
    };
    
    validateImports();
  }, [imports, onValidationComplete]);
  
  if (!isComplete) {
    return null; // Don't render anything while validating
  }
  
  // Only show if validation failed
  if (overallSuccess) {
    return null;
  }
  
  return (
    <div className="p-4 mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
        <div>
          <h3 className="font-medium text-amber-800 dark:text-amber-300">
            Import Validation Warnings
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            The following imports have issues that may cause runtime errors:
          </p>
        </div>
      </div>
      
      <ul className="space-y-2 mt-3">
        {Object.entries(validationResults)
          .filter(([_, result]) => !result.success)
          .map(([path, result]) => (
            <li key={path} className="border-l-2 border-amber-300 dark:border-amber-700 pl-3 py-1">
              <div className="flex items-start gap-1.5">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{path}</p>
                  {result.error && (
                    <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                      Error: {result.error}
                    </p>
                  )}
                  {result.missingExports.length > 0 && (
                    <div className="mt-1">
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        Missing exports:
                      </p>
                      <ul className="list-disc ml-4 text-xs text-amber-700 dark:text-amber-400">
                        {result.missingExports.map(exportName => (
                          <li key={exportName}>{exportName}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default ImportValidator;
