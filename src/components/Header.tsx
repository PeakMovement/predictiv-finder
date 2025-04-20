
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const Header = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-4 px-4 md:px-6 flex justify-between items-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50 safe-area-pt"
    >
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="text-2xl md:text-3xl mr-2"
          >
            🧠
          </motion.div>
          <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-health-teal to-health-purple bg-clip-text text-transparent">
            Predictiv. Health
          </h1>
        </Link>
      </div>
      
      {isMobile ? (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg py-4 px-6"
            >
              <nav className="flex flex-col space-y-4">
                <Link 
                  to="/how-it-works" 
                  className="text-gray-600 hover:text-health-purple transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link 
                  to="/services" 
                  className="text-gray-600 hover:text-health-purple transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Services
                </Link>
                <Link 
                  to="/professionals" 
                  className="text-gray-600 hover:text-health-purple transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Professionals
                </Link>
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full mb-2 border-health-teal text-health-teal hover:bg-health-teal/10"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => {
                      navigate('/');
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-health-purple hover:bg-health-purple-dark"
                  >
                    Get Started
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </div>
      ) : (
        <>
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
          
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="outline" className="border-health-teal text-health-teal hover:bg-health-teal/10">
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              className="bg-health-purple hover:bg-health-purple-dark"
            >
              Get Started
            </Button>
          </div>
        </>
      )}
    </motion.header>
  );
};

export default Header;
