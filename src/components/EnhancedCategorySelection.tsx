
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ServiceCategory } from '@/types';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';

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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">What areas are you seeking support in?</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Select one or more categories that align with your goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            className={`relative p-6 rounded-xl border-2 cursor-pointer ${
              selectedCategories.includes(category.id)
                ? 'border-health-purple bg-health-purple/5'
                : 'border-gray-200 hover:border-health-purple/50'
            }`}
            onClick={() => onCategoryToggle(category.id)}
            whileHover={{ scale: 1.02 }}
          >
            {selectedCategories.includes(category.id) && (
              <div className="absolute top-4 right-4">
                <Check className="h-5 w-5 text-health-purple" />
              </div>
            )}
            <div className="flex items-start space-x-4">
              <span className="text-3xl">{category.icon}</span>
              <div>
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {category.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onContinue}
          disabled={selectedCategories.length === 0}
          className="bg-health-purple hover:bg-health-purple-dark px-8"
          size="lg"
        >
          Continue with Selected Categories
        </Button>
      </div>
    </motion.div>
  );
};

export default EnhancedCategorySelection;
