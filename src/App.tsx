
import { useState } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import HowItWorks from './pages/HowItWorks';
import Services from './pages/Services';
import Professionals from './pages/Professionals';
import { EnhancedErrorBoundary } from './components/enhanced-error-handling';

function App() {
  const [errorKey, setErrorKey] = useState('initial');

  const resetKeys = () => setErrorKey(`reset-${Date.now()}`);

  return (
    <div className="app min-h-screen bg-gray-50 dark:bg-gray-900">
      <EnhancedErrorBoundary key={errorKey} resetKeys={[resetKeys]}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/services" element={<Services />} />
          <Route path="/professionals" element={<Professionals />} />
        </Routes>
      </EnhancedErrorBoundary>
    </div>
  );
}

export default App;
