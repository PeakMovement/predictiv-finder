import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserProfileMenu } from './auth/UserProfileMenu';
import { LoginModal } from './auth/LoginModal';
import { useAuth } from '@/context/AuthContext';
import { PUBLIC_LAUNCH_MODE } from '@/config/launchMode';

export const Header = () => {
  const { isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-4 px-6 flex justify-between items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border"
    >
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <motion.div whileHover={{ rotate: 10 }} className="text-3xl mr-2">
            🧠
          </motion.div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Predictiv. Health
          </h1>
        </Link>
      </div>

      {!PUBLIC_LAUNCH_MODE && (
        <>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
              Services
            </Link>
            <Link to="/professionals" className="text-muted-foreground hover:text-primary transition-colors">
              Professionals
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-2">
            <Link to="/pro-login">
              <Button variant="outline" size="sm">
                Professional Login
              </Button>
            </Link>
            <UserProfileMenu openLoginModal={openLoginModal} />
          </div>

          <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
        </>
      )}
    </motion.header>
  );
};

export default Header;
