
import { motion } from 'framer-motion';
import { Brain, Heart, Dumbbell, Apple, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Service interface representing a health service offering
 * 
 * @interface Service
 * @property {React.ElementType} icon - Icon component to represent the service
 * @property {string} title - Name of the service
 * @property {string} description - Description of what the service offers
 * @property {string} price - Price information for the service
 */
interface Service {
  icon: React.ElementType;
  title: string;
  description: string;
  price: string;
}

/**
 * Services page component
 * Displays available health and wellness services
 */
const Services = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  /**
   * List of available services with their details
   */
  const services: Service[] = [
    {
      icon: Brain,
      title: "Mental Wellness",
      description: "Professional counseling and therapy services for mental health and emotional well-being.",
      price: "From R400/session"
    },
    {
      icon: Heart,
      title: "Physical Therapy",
      description: "Expert physiotherapy and rehabilitation services for injury recovery and pain management.",
      price: "From R350/session"
    },
    {
      icon: Dumbbell,
      title: "Fitness Training",
      description: "Personalized training programs with certified fitness professionals.",
      price: "From R300/session"
    },
    {
      icon: Apple,
      title: "Nutrition Guidance",
      description: "Customized nutrition plans and dietary consulting with registered dietitians.",
      price: "From R450/session"
    },
    {
      icon: Users,
      title: "Group Wellness",
      description: "Cost-effective group sessions combining various wellness activities.",
      price: "From R200/session"
    }
  ];

  return (
    <ScrollArea className="h-full">
      <div className="container max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4">Our Services</h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Comprehensive wellness solutions for every need and budget
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-health-purple/10 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <service.icon className="w-4 h-4 sm:w-5 sm:h-5 text-health-purple" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">{service.title}</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">{service.description}</p>
              <p className="text-health-purple font-medium text-sm sm:text-base">{service.price}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button 
            onClick={() => navigate('/')}
            className="bg-health-purple hover:bg-health-purple-dark w-full sm:w-auto"
            size={isMobile ? "default" : "lg"}
          >
            Find Your Service
          </Button>
        </motion.div>
      </div>
    </ScrollArea>
  );
};

export default Services;
