
import React, { useState } from "react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const Professionals: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Mock professionals data - in a real app this would come from an API
  const professionals = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      title: "Physiotherapist",
      category: "physiotherapy",
      location: "Cape Town",
      specialties: ["Sports Injuries", "Rehabilitation", "Back Pain"],
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=900&q=60"
    },
    {
      id: 2,
      name: "Michael Ndlovu",
      title: "Personal Trainer",
      category: "fitness",
      location: "Johannesburg",
      specialties: ["Strength Training", "Weight Loss", "Athletic Performance"],
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=900&q=60"
    },
    {
      id: 3,
      name: "Dr. Priya Patel",
      title: "Dietician",
      category: "nutrition",
      location: "Durban",
      specialties: ["Sports Nutrition", "Weight Management", "Diabetes Care"],
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=900&q=60"
    },
    {
      id: 4,
      name: "Dr. James Williams",
      title: "Clinical Psychologist",
      category: "mental-health",
      location: "Cape Town",
      specialties: ["Anxiety", "Depression", "Stress Management"],
      image: "https://images.unsplash.com/photo-1565316200579-c16fbbe3bf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=900&q=60"
    },
    {
      id: 5,
      name: "David van der Merwe",
      title: "Biokineticist",
      category: "rehabilitation",
      location: "Pretoria",
      specialties: ["Post-Surgery Rehab", "Chronic Disease Management", "Injury Prevention"],
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=900&q=60"
    },
    {
      id: 6,
      name: "Thandi Mbeki",
      title: "Wellness Coach",
      category: "coaching",
      location: "Johannesburg",
      specialties: ["Life Balance", "Corporate Wellness", "Holistic Health"],
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=900&q=60"
    }
  ];
  
  // Filter professionals based on search query and selected category
  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = 
      professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.specialties.some(specialty => 
        specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesCategory = 
      selectedCategory === "all" || professional.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
            Our Health Professionals
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Meet our network of qualified health professionals ready to support your wellness journey.
          </p>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search by name, specialty or profession..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="physiotherapy">Physiotherapy</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="mental-health">Mental Health</SelectItem>
                    <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                    <SelectItem value="coaching">Coaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredProfessionals.map(professional => (
              <div 
                key={professional.id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={professional.image} 
                    alt={professional.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-1">{professional.name}</h3>
                  <p className="text-health-purple font-medium mb-2">{professional.title}</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">📍 {professional.location}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {professional.specialties.map((specialty, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button className="w-full" variant="outline">View Profile</Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-health-blue/10 dark:bg-gray-800/50 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Not sure which professional is right for you?</h2>
            <p className="mb-6">Let our AI match you with the ideal health professionals based on your specific needs.</p>
            <Link to="/">
              <Button className="bg-health-purple hover:bg-health-purple-dark">
                Get Matched with Professionals
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Professionals;
