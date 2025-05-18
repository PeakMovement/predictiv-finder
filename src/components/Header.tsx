
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserProfileMenu } from './auth/UserProfileMenu';
import { LoginModal } from './auth/LoginModal';

export const Header = () => {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-4 px-6 flex justify-between items-center bg-system-lightGray/80 backdrop-blur-sm dark:bg-system-darkGray/80 sticky top-0 z-50 shadow-sm"
    >
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="text-3xl mr-2"
          >
            🧠
          </motion.div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-system-blue to-system-purple bg-clip-text text-transparent">
            Predictiv. Health
          </h1>
        </Link>
      </div>
      
      <nav className="hidden md:flex items-center space-x-6">
        <Link to="/how-it-works" className="text-gray-600 hover:text-system-blue transition-colors dark:text-gray-300 dark:hover:text-system-teal">
          How It Works
        </Link>
        <Link to="/services" className="text-gray-600 hover:text-system-blue transition-colors dark:text-gray-300 dark:hover:text-system-teal">
          Services
        </Link>
        <Link to="/professionals" className="text-gray-600 hover:text-system-blue transition-colors dark:text-gray-300 dark:hover:text-system-teal">
          Professionals
        </Link>
      </nav>
      
      <div className="flex items-center space-x-2">
        <UserProfileMenu openLoginModal={openLoginModal} />
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </motion.header>
  );
};

export default Header;
