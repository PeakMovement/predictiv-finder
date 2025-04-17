
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Clock, HeartPulse, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      title: "Step 1: Tell Us What You Need",
      description: "Share your health goals, challenges, or just chat with our AI to get personalized recommendations.",
      icon: HeartPulse,
      tooltip: "No pressure! You can be as specific or general as you like. We'll guide you through it."
    },
    {
      title: "Step 2: Explore Your Options",
      description: "Browse matching professionals or review your custom wellness plans that fit your budget and goals.",
      icon: CheckCircle,
      tooltip: "All recommendations are tailored to what matters most to you - whether that's budget, location, or specific health needs."
    },
    {
      title: "Step 3: Book & Begin Your Journey",
      description: "Connect with your chosen professionals and kick off your personalized wellness path.",
      icon: Clock,
      tooltip: "We'll help you every step of the way, with regular check-ins and plan adjustments as needed."
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
        <p className="text-xl text-gray-600 dark:text-gray-300">Your journey to feeling better starts here - it's easier than you think!</p>
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
            <div className="flex items-center justify-center mb-2">
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 ml-2 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{step.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
        <div className="bg-health-purple/10 p-6 rounded-xl max-w-3xl mx-auto mb-8">
          <h3 className="text-xl font-semibold mb-4">Why people love our approach</h3>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="flex flex-col">
              <span className="text-2xl mb-2">🔍</span>
              <h4 className="font-medium mb-1">Personalized Care</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">No one-size-fits-all solutions here, just what works for you.</p>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl mb-2">💰</span>
              <h4 className="font-medium mb-1">Budget-Friendly</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Plans that respect your wallet while delivering results.</p>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl mb-2">🤝</span>
              <h4 className="font-medium mb-1">Expert Support</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Real professionals who genuinely care about your progress.</p>
            </div>
          </div>
        </div>
        
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
