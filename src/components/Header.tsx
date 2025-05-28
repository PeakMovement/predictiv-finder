
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserProfileMenu } from './auth/UserProfileMenu';
import { LoginModal } from './auth/LoginModal';
import { useAuth } from '@/context/AuthContext';

export const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-4 px-6 flex justify-between items-center bg-white/95 backdrop-blur-sm dark:bg-modern-charcoal-900/95 sticky top-0 z-50 border-b border-modern-silver-200 dark:border-modern-charcoal-700"
    >
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="text-3xl mr-2"
          >
            🧠
          </motion.div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-modern-charcoal-700 to-modern-charcoal-900 bg-clip-text text-transparent dark:from-modern-silver-200 dark:to-modern-silver-100">
            Predictiv. Health
          </h1>
        </Link>
      </div>
      
      <nav className="hidden md:flex items-center space-x-6">
        <Link to="/how-it-works" className="text-modern-charcoal-600 hover:text-modern-charcoal-900 transition-colors dark:text-modern-silver-300 dark:hover:text-modern-silver-100">
          How It Works
        </Link>
        <Link to="/services" className="text-modern-charcoal-600 hover:text-modern-charcoal-900 transition-colors dark:text-modern-silver-300 dark:hover:text-modern-silver-100">
          Services
        </Link>
        <Link to="/professionals" className="text-modern-charcoal-600 hover:text-modern-charcoal-900 transition-colors dark:text-modern-silver-300 dark:hover:text-modern-silver-100">
          Professionals
        </Link>
        {isAuthenticated && (
          <Link to="/dashboard" className="text-modern-charcoal-600 hover:text-modern-charcoal-900 transition-colors dark:text-modern-silver-300 dark:hover:text-modern-silver-100">
            Dashboard
          </Link>
        )}
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
