
import { motion } from 'framer-motion';
import { Brain, Heart, Dumbbell, Apple, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const navigate = useNavigate();
  
  const services = [
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
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Our Services</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">Comprehensive wellness solutions for every need and budget</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-health-purple/10 rounded-full flex items-center justify-center mr-4">
                <service.icon className="w-5 h-5 text-health-purple" />
              </div>
              <h3 className="text-xl font-semibold">{service.title}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
            <p className="text-health-purple font-medium">{service.price}</p>
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
          className="bg-health-purple hover:bg-health-purple-dark"
          size="lg"
        >
          Find Your Service
        </Button>
      </motion.div>
    </div>
  );
};

export default Services;
