
import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface HomeHeroProps {
  onSelectCategoryFlow: () => void;
  onSelectAIFlow: () => void;
}

const HomeHero: React.FC<HomeHeroProps> = ({ onSelectCategoryFlow, onSelectAIFlow }) => {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center py-16"
    >
      <motion.h1 
        className="text-4xl md:text-5xl font-bold mb-6"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Your Path to Wellness,&nbsp;
        <span className="bg-gradient-to-r from-health-teal to-health-purple bg-clip-text text-transparent">
          Personalized
        </span>
      </motion.h1>
      
      <motion.p 
        className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Let's build your complete health, fitness, and wellness journey — tailored to your goals and budget.
      </motion.p>
      
      <motion.div 
        className="flex flex-col md:flex-row gap-4 justify-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button 
          onClick={onSelectCategoryFlow}
          className="text-lg py-6 px-8 bg-health-teal hover:bg-health-teal-dark flex items-center"
          size="lg"
        >
          <span className="emoji-icon">🔍</span>
          I Know What I Need
        </Button>
        <Button 
          onClick={onSelectAIFlow}
          className="text-lg py-6 px-8 bg-health-purple hover:bg-health-purple-dark flex items-center"
          size="lg"
        >
          <span className="emoji-icon">🧠</span>
          Explain My Goal
        </Button>
      </motion.div>
      
      <motion.div 
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <div className="w-16 h-16 mx-auto bg-health-teal/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🤝</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Expert Matching</h3>
          <p className="text-gray-600 dark:text-gray-300">Connect with qualified professionals that match your exact needs.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <div className="w-16 h-16 mx-auto bg-health-purple/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">💰</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Budget Friendly</h3>
          <p className="text-gray-600 dark:text-gray-300">Find services that fit your financial plan without compromising quality.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <div className="w-16 h-16 mx-auto bg-health-orange/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🧠</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">AI Planning</h3>
          <p className="text-gray-600 dark:text-gray-300">Get personalized health plans based on your unique situation.</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HomeHero;
