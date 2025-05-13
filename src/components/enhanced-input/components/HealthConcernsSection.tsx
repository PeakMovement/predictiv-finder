
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { HealthConcern } from '../types';

interface HealthConcernsSectionProps {
  commonHealthConcerns: HealthConcern[];
  selectedConcerns: string[];
  toggleConcern: (label: string) => void;
}

/**
 * Displays selectable health concern categories with additional help information
 */
const HealthConcernsSection: React.FC<HealthConcernsSectionProps> = ({ 
  commonHealthConcerns, 
  selectedConcerns, 
  toggleConcern 
}) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Common Health Concerns</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowHelp(!showHelp)}
          className="h-8 px-2 text-gray-500"
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          <span className="text-xs">Help</span>
        </Button>
      </div>
      
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 text-sm">
                <p className="text-blue-800">
                  Click on any health concern to add it to your query. This helps our AI understand your needs better.
                  For best results, include:
                </p>
                <ul className="list-disc list-inside mt-2 text-blue-700 text-xs">
                  <li>Your main health concern or goal</li>
                  <li>Any pain or discomfort you're experiencing</li>
                  <li>Your budget (e.g., "my budget is R2000")</li>
                  <li>Your timeframe (e.g., "looking for an 8-week program")</li>
                  <li>Any preferences (e.g., "prefer in-person sessions")</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex flex-wrap gap-2">
        {commonHealthConcerns.map((concern) => (
          <Badge
            key={concern.label}
            variant={selectedConcerns.includes(concern.label) ? "default" : "outline"}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => toggleConcern(concern.label)}
          >
            {concern.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default HealthConcernsSection;
