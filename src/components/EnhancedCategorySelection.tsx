
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ServiceCategory } from '@/types';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface CategoryOption {
  id: ServiceCategory;
  icon: string;
  title: string;
  description: string;
}

const categories: CategoryOption[] = [
  {
    id: 'personal-trainer',
    icon: '🏋️',
    title: 'Fitness & Training',
    description: 'Personal training, strength coaching, and athletic performance'
  },
  {
    id: 'dietician',
    icon: '🥗',
    title: 'Nutrition & Diet',
    description: 'Dietary guidance, meal planning, and nutritional counseling'
  },
  {
    id: 'physiotherapist',
    icon: '🏥',
    title: 'Health & Medical',
    description: 'Physical therapy, rehabilitation, and injury recovery'
  },
  {
    id: 'biokineticist',
    icon: '💆',
    title: 'Recovery & Lifestyle',
    description: 'Movement correction, posture, and holistic wellness'
  }
];

interface EnhancedCategorySelectionProps {
  selectedCategories: ServiceCategory[];
  onCategoryToggle: (category: ServiceCategory) => void;
  onContinue: () => void;
}

export const EnhancedCategorySelection = ({
  selectedCategories,
  onCategoryToggle,
  onContinue
}: EnhancedCategorySelectionProps) => {
  const isMobile = useIsMobile();

  console.log('EnhancedCategorySelection rendered with:', { selectedCategories, isMobile }); // Debug log

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className={`text-center ${isMobile ? 'mb-6' : 'mb-8'}`}>
        <h2 className={`font-bold ${isMobile ? 'text-2xl mb-3' : 'text-3xl mb-4'} text-gray-800 dark:text-white`}>
          What areas are you seeking support in?
        </h2>
        <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm px-4' : 'text-base'}`}>
          Select one or more categories that align with your goals
        </p>
      </div>

      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1 px-4' : 'grid-cols-1 md:grid-cols-2 gap-6'} ${isMobile ? 'mb-6' : 'mb-8'}`}>
        {categories.map((category) => (
          <motion.div
            key={category.id}
            className={`relative ${isMobile ? 'p-4' : 'p-6'} rounded-xl border-2 cursor-pointer transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md ${
              selectedCategories.includes(category.id)
                ? 'border-health-purple bg-health-purple/10 shadow-lg'
                : 'border-gray-200 hover:border-health-purple/50 hover:bg-white/90'
            }`}
            onClick={() => {
              console.log('Category clicked:', category.id); // Debug log
              onCategoryToggle(category.id);
            }}
            whileHover={{ scale: isMobile ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {selectedCategories.includes(category.id) && (
              <div className={`absolute ${isMobile ? 'top-3 right-3' : 'top-4 right-4'}`}>
                <div className="bg-health-purple rounded-full p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
            <div className={`flex items-start ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
              <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} flex-shrink-0`}>{category.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold ${isMobile ? 'text-lg mb-1' : 'text-xl mb-2'} text-gray-800 dark:text-white`}>
                  {category.title}
                </h3>
                <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm leading-relaxed' : 'text-sm'}`}>
                  {category.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className={`flex justify-center ${isMobile ? 'px-4' : ''}`}>
        <Button
          onClick={() => {
            console.log('Continue clicked with categories:', selectedCategories); // Debug log
            onContinue();
          }}
          disabled={selectedCategories.length === 0}
          className={`bg-health-purple hover:bg-health-purple-dark text-white font-medium transition-all duration-200 ${
            isMobile 
              ? 'w-full py-3 text-base' 
              : 'px-8 py-2'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          size={isMobile ? "lg" : "default"}
        >
          {selectedCategories.length === 0 
            ? 'Select at least one category'
            : `Continue with ${selectedCategories.length} ${selectedCategories.length === 1 ? 'Category' : 'Categories'}`
          }
        </Button>
      </div>
    </motion.div>
  );
};

export default EnhancedCategorySelection;
