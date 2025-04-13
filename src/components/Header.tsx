
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const Header = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-4 px-6 flex justify-between items-center"
    >
      <div className="flex items-center">
        <motion.div
          whileHover={{ rotate: 10 }}
          className="text-3xl mr-2"
        >
          🧠
        </motion.div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-health-teal to-health-purple bg-clip-text text-transparent">
          HealthFlow AI
        </h1>
      </div>
      
      <nav className="hidden md:flex items-center space-x-6">
        <a href="#" className="text-gray-600 hover:text-health-purple transition-colors">How It Works</a>
        <a href="#" className="text-gray-600 hover:text-health-purple transition-colors">Services</a>
        <a href="#" className="text-gray-600 hover:text-health-purple transition-colors">Professionals</a>
        <a href="#" className="text-gray-600 hover:text-health-purple transition-colors">About</a>
      </nav>
      
      <div className="flex items-center space-x-2">
        <Button variant="outline" className="hidden md:inline-flex border-health-teal text-health-teal hover:bg-health-teal/10">
          Sign In
        </Button>
        <Button className="bg-health-purple hover:bg-health-purple-dark">
          Get Started
        </Button>
      </div>
    </motion.header>
  );
};

export default Header;
