
import { useState } from 'react';
import { motion } from 'framer-motion';
import ServiceCategoryCard from './ServiceCategoryCard';
import { ServiceCategory } from '@/types';

interface ServiceCategorySelectorProps {
  onSelectCategory: (category: ServiceCategory) => void;
}

const categories = [
  {
    id: 'dietician',
    title: 'Dietician',
    icon: '🍎',
    description: 'Personalized nutrition plans and dietary advice for health goals and medical conditions.'
  },
  {
    id: 'personal-trainer',
    title: 'Personal Trainer',
    icon: '💪',
    description: 'Customized workout programs to help you reach your fitness goals with proper form and motivation.'
  },
  {
    id: 'biokineticist',
    title: 'Biokineticist',
    icon: '🧬',
    description: 'Exercise therapy for injury rehabilitation, chronic disease management, and performance enhancement.'
  },
  {
    id: 'physiotherapist',
    title: 'Physiotherapist',
    icon: '🩺',
    description: 'Assessment and treatment of injuries, pain management, and rehabilitation techniques.'
  },
  {
    id: 'coaching',
    title: 'Coaching',
    icon: '🏃‍♂️',
    description: 'Specialized coaching for running, diet adherence, strength training, and sport-specific skills.'
  }
];

export const ServiceCategorySelector = ({ onSelectCategory }: ServiceCategorySelectorProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <span className="emoji-icon">🔍</span> Choose a Service Category
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <ServiceCategoryCard 
            key={category.id}
            category={category.id as ServiceCategory}
            title={category.title}
            icon={category.icon}
            description={category.description}
            onSelect={onSelectCategory}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ServiceCategorySelector;
