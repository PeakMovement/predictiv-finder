
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AIHealthPlan } from "@/types";

interface HealthPlanCardProps {
  plan: AIHealthPlan;
  onSelect: (plan: AIHealthPlan) => void;
  featured?: boolean;
}

const getPlanTypeStyles = (planType: AIHealthPlan['planType']) => {
  switch (planType) {
    case 'best-fit':
      return {
        bgGradient: 'from-health-teal to-emerald-500',
        icon: '✅'
      };
    case 'high-impact':
      return {
        bgGradient: 'from-health-purple to-violet-500',
        icon: '⚡'
      };
    case 'progressive':
      return {
        bgGradient: 'from-health-orange to-amber-500',
        icon: '🔄'
      };
    default:
      return {
        bgGradient: 'from-health-teal to-health-purple',
        icon: '✅'
      };
  }
};

const planTypeLabels = {
  'best-fit': 'Best Fit Plan',
  'high-impact': 'High Impact Plan',
  'progressive': 'Progressive Plan'
};

export const HealthPlanCard = ({ plan, onSelect, featured = false }: HealthPlanCardProps) => {
  const { bgGradient, icon } = getPlanTypeStyles(plan.planType);
  const planTypeLabel = planTypeLabels[plan.planType];

  return (
    <motion.div
      className={`rounded-xl overflow-hidden ${featured ? 'ring-4 ring-health-purple/30' : ''}`}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white dark:bg-gray-800 shadow-md h-full flex flex-col">
        <div className={`p-4 bg-gradient-to-r ${bgGradient} text-white`}>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center">
              <span className="mr-2">{icon}</span> {planTypeLabel}
            </h3>
            {featured && (
              <span className="bg-white text-health-purple px-2 py-1 rounded-full text-xs font-semibold">Recommended</span>
            )}
          </div>
          <p className="mt-1 text-white/90 text-sm">Timeframe: {plan.timeFrame}</p>
        </div>

        <div className="p-6 flex-grow flex flex-col">
          <h4 className="text-lg font-semibold mb-2">{plan.name}</h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{plan.description}</p>
          
          <div className="mb-4 flex-grow">
            <h5 className="font-medium text-sm mb-2">Included Services:</h5>
            <ul className="space-y-3">
              {plan.services.map((service, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-health-teal mr-2">•</span>
                  <div>
                    <p className="font-medium capitalize text-sm">{service.sessions}x {service.type.replace('-', ' ')}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{service.description}</p>
                    <p className="text-health-purple font-medium text-sm">R{service.price} per session</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Cost:</span>
              <span className="text-xl font-bold">R{plan.totalCost}</span>
            </div>
            <Button 
              onClick={() => onSelect(plan)} 
              className="w-full bg-health-purple hover:bg-health-purple-dark"
            >
              Select This Plan
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthPlanCard;
