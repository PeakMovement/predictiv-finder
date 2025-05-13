
import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import AIAssistantInput from './components/AIAssistantInput';
import { SafeAIPlansDisplay } from './components/AIPlansDisplay/SafeAIPlansDisplay';
import { HealthPlan } from './types';
import { generateHealthPlans } from './utils/aiPlanGenerator';
import { EnhancedErrorBoundary } from './components/enhanced-error-handling';

function App() {
  const [userInput, setUserInput] = useState<string>('');
  const [plans, setPlans] = useState<HealthPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState('initial');

  const handleUserInput = async (input: string) => {
    setUserInput(input);
    setIsLoading(true);
    setErrorKey(prev => `${prev}-${Date.now()}`); // Reset error boundary on new submission
    
    try {
      const generatedPlans = await generateHealthPlans(input);
      setPlans(generatedPlans);
    } catch (error) {
      console.error("Error generating health plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <AIAssistantInput
            onSubmit={handleUserInput}
            isLoading={isLoading}
          />
        </div>
        
        {userInput && (
          <div className="mt-8">
            <EnhancedErrorBoundary
              fallback={({ error, resetErrorBoundary }) => (
                <div className="p-4 border border-red-300 bg-red-50 rounded-md">
                  <h3 className="text-lg font-medium text-red-800">Error Loading Health Plans</h3>
                  <p className="text-red-700">{error.message}</p>
                  <button 
                    onClick={resetErrorBoundary}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              )}
              resetKeys={[errorKey]}
            >
              <SafeAIPlansDisplay plans={plans} isLoading={isLoading} userInput={userInput} />
            </EnhancedErrorBoundary>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
