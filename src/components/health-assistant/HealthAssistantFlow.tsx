import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HealthQuery, PhysicianRecommendation } from '@/services/physician-recommendation-service';
import { savePhysicianPreference, saveSearchHistory } from '@/services/user-physician-service';
import HealthAssistantInput from './HealthAssistantInput';
import PhysicianRecommendationsView from '../physician-recommendations/PhysicianRecommendationsView';
import { useToast } from '@/hooks/use-toast';

type ViewState = 'input' | 'recommendations';

export const HealthAssistantFlow: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('input');
  const [currentQuery, setCurrentQuery] = useState<HealthQuery | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleQuerySubmit = async (query: HealthQuery) => {
    setIsLoading(true);
    setCurrentQuery(query);
    
    // Save search to history
    await saveSearchHistory(query.issue, query.budget, query.location);
    
    setCurrentView('recommendations');
    setIsLoading(false);
  };

  const handlePhysicianSelect = async (physician: PhysicianRecommendation) => {
    // Save physician preference
    await savePhysicianPreference(physician);
    
    toast({
      title: "Physician Selected",
      description: `You selected ${physician.Name} - ${physician.Title}. This preference has been saved for future recommendations.`,
    });
  };

  const handleBack = () => {
    setCurrentView('input');
    setCurrentQuery(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {currentView === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <HealthAssistantInput 
              onSubmit={handleQuerySubmit}
              isLoading={isLoading}
            />
          </motion.div>
        )}
        
        {currentView === 'recommendations' && currentQuery && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <PhysicianRecommendationsView
              healthQuery={currentQuery}
              onBack={handleBack}
              onSelectPhysician={handlePhysicianSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthAssistantFlow;