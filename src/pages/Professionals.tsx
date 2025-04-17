
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Video, Award, Linkedin, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Professionals = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const professionals = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      title: "Clinical Psychologist",
      category: "psychology",
      rating: 4.9,
      location: "Cape Town",
      online: true,
      specialties: ["Anxiety", "Depression", "Stress Management"],
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
      qualifications: ["Ph.D. in Clinical Psychology", "Masters in Behavioral Psychology"],
      bio: "I'm passionate about helping people navigate life's challenges and find their inner strength. With over 10 years of experience, I specialize in anxiety, depression, and stress management. My approach combines cognitive-behavioral techniques with mindfulness to create personalized treatment plans. I believe everyone deserves a safe space to explore their thoughts and feelings, and I'm committed to providing that environment for my clients.",
      linkedin: "https://linkedin.com/in/sarahjohnson"
    },
    {
      id: "2",
      name: "Michael Thompson",
      title: "Physiotherapist",
      category: "physiotherapy",
      rating: 4.8,
      location: "Johannesburg",
      online: true,
      specialties: ["Sports Injuries", "Rehabilitation", "Back Pain"],
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop",
      qualifications: ["BSc Physiotherapy", "Sports Rehabilitation Specialist"],
      bio: "My journey in physiotherapy began after recovering from my own sports injury. I know firsthand how debilitating pain can be, which is why I'm dedicated to helping my patients return to optimal physical function. I use evidence-based techniques and personalized rehabilitation programs to address specific needs. Whether you're an athlete looking to get back in the game or someone dealing with chronic pain, I'm here to help you move better and feel better.",
      linkedin: "https://linkedin.com/in/michaelthompson"
    },
    {
      id: "3",
      name: "Lisa van der Merwe",
      title: "Registered Dietitian",
      category: "dietician",
      rating: 4.9,
      location: "Pretoria",
      online: true,
      specialties: ["Weight Management", "Sports Nutrition", "Dietary Planning"],
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
      qualifications: ["BSc Dietetics", "Certified Sports Nutritionist"],
      bio: "Food is more than just fuel - it's a relationship we nurture throughout our lives. I'm passionate about helping people develop healthy, sustainable eating habits that support their goals. I don't believe in restrictive diets or one-size-fits-all approaches. Instead, I work with each client to create personalized nutrition plans that fit their lifestyle, preferences, and health needs. My goal is to empower you with the knowledge and tools to make informed food choices that nourish your body and mind.",
      linkedin: "https://linkedin.com/in/lisavandermerwe"
    },
    {
      id: "4",
      name: "James Mokoena",
      title: "Biokineticist",
      category: "biokineticist",
      rating: 4.7,
      location: "Durban",
      online: false,
      specialties: ["Orthopedic Rehabilitation", "Chronic Disease Management", "Performance Enhancement"],
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
      qualifications: ["BSc Biokinetics", "Exercise Physiology Certification"],
      bio: "I've dedicated my career to understanding how movement affects health and wellbeing. As a biokineticist, I use exercise as medicine to treat various conditions and improve quality of life. My approach combines scientific principles with practical applications tailored to each individual's needs. I'm particularly passionate about helping people with chronic conditions learn how to manage their health effectively through targeted exercise interventions. I believe movement is a powerful tool for healing and transformation.",
      linkedin: "https://linkedin.com/in/jamesmokoena"
    },
    {
      id: "5",
      name: "Anita Patel",
      title: "Sports Massage Therapist",
      category: "massage",
      rating: 4.9,
      location: "Cape Town",
      online: false,
      specialties: ["Deep Tissue Massage", "Recovery Techniques", "Injury Prevention"],
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop",
      qualifications: ["Diploma in Sports Massage Therapy", "Advanced Myofascial Release Certification"],
      bio: "I believe in the power of touch to heal, rejuvenate, and optimize physical performance. Through years of working with athletes and everyday individuals, I've developed techniques that effectively address muscle tension, improve circulation, and accelerate recovery. Each session with me is tailored to your specific needs, whether you're managing pain, recovering from intense training, or simply seeking relaxation. My goal is to help you feel better in your body so you can perform at your best, both in sport and in life.",
      linkedin: "https://linkedin.com/in/anitapatel"
    },
    {
      id: "6",
      name: "David Nkosi",
      title: "Personal Trainer",
      category: "personal-trainer",
      rating: 4.8,
      location: "Johannesburg",
      online: true,
      specialties: ["Strength Training", "Weight Loss", "Functional Fitness"],
      image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=400&fit=crop",
      qualifications: ["Certified Personal Trainer", "Strength and Conditioning Specialist"],
      bio: "Fitness changed my life, and I'm passionate about helping others experience the same transformation. My training philosophy focuses on building strength, improving function, and developing sustainable habits. I don't just count reps - I make every repetition count by emphasizing proper form and mindful movement. Whether you're new to exercise or looking to break through a plateau, I'll create a program that challenges you appropriately and keeps you progressing toward your goals. Together, we'll build not just a stronger body, but a more confident you.",
      linkedin: "https://linkedin.com/in/davidnkosi"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Professionals' },
    { id: 'psychology', name: 'Psychology' },
    { id: 'physiotherapy', name: 'Physiotherapy' },
    { id: 'dietician', name: 'Dietetics' },
    { id: 'biokineticist', name: 'Biokinetics' },
    { id: 'massage', name: 'Massage Therapy' },
    { id: 'personal-trainer', name: 'Personal Training' }
  ];

  const filteredProfessionals = professionals.filter(prof => {
    const matchesSearch = 
      prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || prof.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-4">Our Health Professionals</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Connect with skilled practitioners who are passionate about helping you achieve your health and wellness goals
        </p>
      </motion.div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-auto">
            <Input
              placeholder="Search by name, specialty, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
          <div className="w-full sm:w-auto overflow-x-auto pb-2">
            <Tabs 
              defaultValue="all" 
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="w-full"
            >
              <TabsList className="h-auto p-1 flex-wrap">
                {categories.map(category => (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm py-1.5">
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredProfessionals.map((prof, index) => (
          <motion.div
            key={prof.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
          >
            <div className="h-48 overflow-hidden">
              <img src={prof.image} alt={prof.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold">{prof.name}</h3>
                  <p className="text-health-purple">{prof.title}</p>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm">{prof.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                {prof.location}
                {prof.online && (
                  <div className="ml-4 flex items-center text-health-teal">
                    <Video className="w-4 h-4 mr-1" />
                    Online
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {prof.specialties.slice(0, 3).map(specialty => (
                  <Badge
                    key={specialty}
                    variant="outline"
                    className="bg-health-purple/10 text-health-purple border-health-purple/20"
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">View Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                      <span>{prof.name}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm">{prof.rating}</span>
                      </div>
                    </DialogTitle>
                    <DialogDescription>{prof.title}</DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1">
                      <div className="rounded-lg overflow-hidden mb-4">
                        <img src={prof.image} alt={prof.name} className="w-full object-cover aspect-square" />
                      </div>
                      
                      <div className="flex items-center text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{prof.location}</span>
                      </div>
                      
                      {prof.online && (
                        <div className="flex items-center text-sm mb-4 text-health-teal">
                          <Video className="w-4 h-4 mr-2" />
                          <span>Available for online consultations</span>
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center gap-2 mb-2"
                        onClick={() => window.open(prof.linkedin, '_blank')}
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn Profile
                      </Button>
                      
                      <Button className="w-full bg-health-purple hover:bg-health-purple-dark">
                        Book a Consultation
                      </Button>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="mb-4">
                        <h4 className="font-medium text-lg mb-2 flex items-center">
                          <Award className="w-4 h-4 mr-2 text-health-purple" />
                          Qualifications
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                          {prof.qualifications.map((qual, idx) => (
                            <li key={idx}>{qual}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-lg mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {prof.specialties.map(specialty => (
                            <Badge
                              key={specialty}
                              variant="outline"
                              className="bg-health-purple/10 text-health-purple border-health-purple/20"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-lg mb-2">About Me</h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {prof.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProfessionals.length === 0 && (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-lg mb-4">No professionals match your search criteria</p>
          <Button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="bg-health-purple hover:bg-health-purple-dark"
          >
            Reset Filters
          </Button>
        </div>
      )}

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
          Find Your Health Professional
        </Button>
      </motion.div>
    </div>
  );
};

export default Professionals;
