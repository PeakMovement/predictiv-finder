
import React from "react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HowItWorks: React.FC = () => {
  return (
    <div className="min-h-screen bg-health-blue-light dark:bg-gray-900">
      <Header />
      
      <main className="container max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            How Predictiv Works
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Your personalized health plan is just a few steps away. Here's how our AI-powered system helps you optimize your health journey.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 my-12">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-health-purple/20 rounded-full p-3 mr-4">
                    <span className="text-2xl font-bold text-health-purple">1</span>
                  </div>
                  <h3 className="text-xl font-semibold">Share Your Health Needs</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Tell us about your health goals, challenges, and preferences. The more details you provide, the more tailored your plan will be.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-health-purple/20 rounded-full p-3 mr-4">
                    <span className="text-2xl font-bold text-health-purple">2</span>
                  </div>
                  <h3 className="text-xl font-semibold">AI Analysis</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Our advanced AI analyzes your information to understand your unique situation and identify the most beneficial combination of health services.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-health-purple/20 rounded-full p-3 mr-4">
                    <span className="text-2xl font-bold text-health-purple">3</span>
                  </div>
                  <h3 className="text-xl font-semibold">Multiple Plan Options</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Review several personalized health plans created specifically for your needs, with different approaches and budget considerations.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-health-purple/20 rounded-full p-3 mr-4">
                    <span className="text-2xl font-bold text-health-purple">4</span>
                  </div>
                  <h3 className="text-xl font-semibold">Implementation & Support</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Choose your preferred plan and get connected with the right health professionals to start your journey, with ongoing tracking and support.
                </p>
              </div>
            </div>
            
            <div className="my-12 bg-health-blue-light/30 dark:bg-gray-800 p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
              <p className="mb-6">Create your personalized health plan now and take the first step toward your health goals.</p>
              <Link to="/">
                <Button className="bg-health-purple hover:bg-health-purple-dark text-lg px-6 py-3">
                  Create Your Health Plan
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default HowItWorks;
