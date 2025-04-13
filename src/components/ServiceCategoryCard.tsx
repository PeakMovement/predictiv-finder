
import { motion } from "framer-motion";
import { ServiceCategory } from "@/types";

interface ServiceCategoryCardProps {
  category: ServiceCategory;
  title: string;
  icon: string;
  description: string;
  onSelect: (category: ServiceCategory) => void;
}

const getGradientColors = (category: ServiceCategory) => {
  switch (category) {
    case 'dietician':
      return 'from-green-400 to-green-500';
    case 'personal-trainer':
      return 'from-blue-400 to-blue-500';
    case 'biokineticist':
      return 'from-purple-400 to-purple-500';
    case 'physiotherapist':
      return 'from-health-teal to-cyan-500';
    case 'coaching':
      return 'from-health-orange to-orange-400';
    default:
      return 'from-health-teal to-health-purple';
  }
};

export const ServiceCategoryCard = ({ 
  category, 
  title, 
  icon, 
  description, 
  onSelect 
}: ServiceCategoryCardProps) => {
  const gradientColors = getGradientColors(category);

  return (
    <motion.div
      className="rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden"
      whileHover={{ y: -5 }}
      onClick={() => onSelect(category)}
    >
      <div className={`p-6 h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl`}>
        <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${gradientColors} flex items-center justify-center mb-4`}>
          <span className="text-2xl text-white">{icon}</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
      </div>
    </motion.div>
  );
};

export default ServiceCategoryCard;
