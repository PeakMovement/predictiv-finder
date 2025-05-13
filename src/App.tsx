
import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import AIAssistantInput from './components/AIAssistantInput';
import SafeAIPlansDisplay from './components/AIPlansDisplay/SafeAIPlansDisplay';
import { AIHealthPlan } from './types';
import { generateCustomAIPlans } from './utils/aiPlanGenerator';
import { EnhancedErrorBoundary } from './components/enhanced-error-handling';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';

function App() {
  const [userInput, setUserInput] = useState<string>('');
  const [plans, setPlans] = useState<AIHealthPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState('initial');

  const handleUserInput = async (input: string) => {
    setUserInput(input);
    setIsLoading(true);
    setErrorKey(prev => `${prev}-${Date.now()}`); // Reset error boundary on new submission
    
    try {
      const generatedPlans = await generateCustomAIPlans(input);
      setPlans(generatedPlans);
    } catch (error) {
      console.error("Error generating health plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app min-h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/how-it-works" element={<div>How It Works Page</div>} />
        <Route path="/services" element={<div>Services Page</div>} />
        <Route path="/professionals" element={<div>Professionals Page</div>} />
      </Routes>
    </div>
  );
}

export default App;
