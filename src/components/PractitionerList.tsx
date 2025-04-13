
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Practitioner, UserCriteria } from '@/types';
import PractitionerCard from './PractitionerCard';

interface PractitionerListProps {
  practitioners: Practitioner[];
  criteria: UserCriteria;
  onSelectPractitioner: (practitioner: Practitioner) => void;
  onBack: () => void;
  onAIAssistant: () => void;
}

export const PractitionerList = ({ 
  practitioners, 
  criteria, 
  onSelectPractitioner,
  onBack,
  onAIAssistant
}: PractitionerListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredPractitioners = practitioners.filter(p => {
    // Basic search filtering
    const searchLower = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchLower) ||
      p.serviceTags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      p.location.toLowerCase().includes(searchLower)
    );
  });

  const categoryName = criteria.category 
    ? criteria.category.charAt(0).toUpperCase() + criteria.category.slice(1).replace('-', ' ')
    : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack} 
              className="mr-2"
            >
              ←
            </Button>
            <h2 className="text-2xl font-semibold">Available {categoryName} Professionals</h2>
          </div>
          
          <Button 
            variant="outline" 
            onClick={onAIAssistant}
            className="flex items-center gap-2 border-health-purple text-health-purple hover:bg-health-purple/10"
          >
            <span className="text-lg">🧠</span>
            <span>Build AI Plan</span>
          </Button>
        </div>
        
        <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {criteria.goal && (
              <div className="bg-health-teal/20 text-health-teal-dark px-3 py-1 rounded-full text-sm">
                Goal: {criteria.goal}
              </div>
            )}
            {criteria.budget && (
              <div className="bg-health-purple/20 text-health-purple-dark px-3 py-1 rounded-full text-sm">
                Budget: R{criteria.budget}
              </div>
            )}
            {criteria.location && (
              <div className="bg-health-orange/20 text-health-orange-dark px-3 py-1 rounded-full text-sm">
                Location: {criteria.location}
              </div>
            )}
          </div>
          
          <div className="w-full md:w-auto">
            <Input
              placeholder="Search by name, specialty, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
        </div>
        
        {filteredPractitioners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPractitioners.map(practitioner => (
              <PractitionerCard 
                key={practitioner.id} 
                practitioner={practitioner} 
                onSelect={onSelectPractitioner}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-lg mb-4">No professionals match your criteria</p>
            <Button 
              variant="outline" 
              onClick={onAIAssistant}
              className="bg-health-purple text-white hover:bg-health-purple-dark"
            >
              Try AI Assistant Instead
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PractitionerList;
