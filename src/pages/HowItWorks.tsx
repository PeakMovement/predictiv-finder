
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Clock, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      title: "Tell Us Your Goals",
      description: "Share your health and wellness objectives, or let our AI guide you through personalized recommendations.",
      icon: HeartPulse
    },
    {
      title: "Get Matched",
      description: "Our system analyzes your needs and matches you with the perfect health professionals and services.",
      icon: CheckCircle
    },
    {
      title: "Start Your Journey",
      description: "Begin your personalized wellness journey with structured plans and ongoing support.",
      icon: Clock
    }
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">How It Works</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">Your journey to holistic wellness starts here</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md relative"
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-health-purple/10 rounded-full flex items-center justify-center">
                <step.icon className="w-6 h-6 text-health-purple" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                <ArrowRight className="w-6 h-6 text-health-purple" />
              </div>
            )}
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
          Start Your Journey
        </Button>
      </motion.div>
    </div>
  );
};

export default HowItWorks;
