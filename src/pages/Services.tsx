
import React from "react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Services: React.FC = () => {
  const serviceCategories = [
    {
      id: "physical",
      name: "Physical Health",
      services: [
        { name: "Physiotherapy", description: "Expert treatment for injuries, pain management and rehabilitation" },
        { name: "Personal Training", description: "Personalized exercise programs to meet your fitness goals" },
        { name: "Biokinetics", description: "Improving physical functioning through exercise-based rehabilitation" },
        { name: "Sports Medicine", description: "Specialized care for athletes and sports-related injuries" }
      ]
    },
    {
      id: "mental",
      name: "Mental Health",
      services: [
        { name: "Psychology", description: "Professional support for mental health challenges and personal growth" },
        { name: "Stress Management", description: "Techniques and strategies to reduce and manage stress" },
        { name: "Life Coaching", description: "Guidance to help you reach your personal and professional goals" },
        { name: "Mindfulness Training", description: "Practices to improve focus, awareness and emotional balance" }
      ]
    },
    {
      id: "nutrition",
      name: "Nutrition",
      services: [
        { name: "Dietetics", description: "Expert nutritional advice tailored to your health needs" },
        { name: "Meal Planning", description: "Structured eating plans to support your health goals" },
        { name: "Nutritional Coaching", description: "Ongoing support to build sustainable eating habits" },
        { name: "Specialized Diets", description: "Guidance for specific dietary needs and restrictions" }
      ]
    },
    {
      id: "holistic",
      name: "Holistic Care",
      services: [
        { name: "Integrative Medicine", description: "Combining conventional and complementary approaches to health" },
        { name: "Wellness Coaching", description: "Comprehensive support for overall wellbeing and health" },
        { name: "Preventative Health", description: "Strategies to maintain health and prevent disease" },
        { name: "Lifestyle Medicine", description: "Using lifestyle interventions to treat and prevent chronic conditions" }
      ]
    }
  ];

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
            Our Health Services
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Predictiv connects you with a comprehensive range of health services tailored to your unique needs.
          </p>
          
          <Tabs defaultValue="physical" className="mb-12">
            <TabsList className="mb-8">
              {serviceCategories.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="text-lg px-6">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {serviceCategories.map(category => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid md:grid-cols-2 gap-6">
                  {category.services.map((service, index) => (
                    <div 
                      key={index} 
                      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md"
                    >
                      <h3 className="text-xl font-semibold mb-3">{service.name}</h3>
                      <p className="text-gray-700 dark:text-gray-300">{service.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md my-12">
            <h2 className="text-2xl font-bold mb-4">Not sure which services you need?</h2>
            <p className="mb-6">Our AI system can analyze your health goals and challenges to recommend the optimal combination of services for your needs.</p>
            <Link to="/">
              <Button className="bg-health-purple hover:bg-health-purple-dark text-lg px-6 py-3">
                Get Personalized Recommendations
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Services;
