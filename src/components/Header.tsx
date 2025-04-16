
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();
  
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-4 px-6 flex justify-between items-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50"
    >
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="text-3xl mr-2"
          >
            🧠
          </motion.div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-health-teal to-health-purple bg-clip-text text-transparent">
            Predictiv. Health
          </h1>
        </Link>
      </div>
      
      <nav className="hidden md:flex items-center space-x-6">
        <Link to="/how-it-works" className="text-gray-600 hover:text-health-purple transition-colors">
          How It Works
        </Link>
        <Link to="/services" className="text-gray-600 hover:text-health-purple transition-colors">
          Services
        </Link>
        <Link to="/professionals" className="text-gray-600 hover:text-health-purple transition-colors">
          Professionals
        </Link>
      </nav>
      
      <div className="flex items-center space-x-2">
        <Button variant="outline" className="hidden md:inline-flex border-health-teal text-health-teal hover:bg-health-teal/10">
          Sign In
        </Button>
        <Button 
          onClick={() => navigate('/')} 
          className="bg-health-purple hover:bg-health-purple-dark"
        >
          Get Started
        </Button>
      </div>
    </motion.header>
  );
};

export default Header;
