
import { motion } from 'framer-motion';
import { Star, MapPin, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Professionals = () => {
  const navigate = useNavigate();

  const professionals = [
    {
      name: "Dr. Sarah Johnson",
      title: "Clinical Psychologist",
      rating: 4.9,
      location: "Cape Town",
      online: true,
      specialties: ["Anxiety", "Depression", "Stress Management"],
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop"
    },
    {
      name: "Michael Thompson",
      title: "Physiotherapist",
      rating: 4.8,
      location: "Johannesburg",
      online: true,
      specialties: ["Sports Injuries", "Rehabilitation", "Back Pain"],
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop"
    },
    {
      name: "Lisa van der Merwe",
      title: "Registered Dietitian",
      rating: 4.9,
      location: "Pretoria",
      online: true,
      specialties: ["Weight Management", "Sports Nutrition", "Dietary Planning"],
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop"
    }
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Our Health Professionals</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">Expert practitioners dedicated to your wellness journey</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {professionals.map((prof, index) => (
          <motion.div
            key={prof.name}
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
                {prof.specialties.map(specialty => (
                  <span
                    key={specialty}
                    className="px-2 py-1 bg-health-purple/10 text-health-purple rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
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
          Find Your Health Professional
        </Button>
      </motion.div>
    </div>
  );
};

export default Professionals;
