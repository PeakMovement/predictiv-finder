
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface RotatingWordsProps {
  words: string[];
  className?: string;
}

const RotatingWords = ({ words, className = "" }: RotatingWordsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % words.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [words.length]);
  
  return (
    <div className={`relative inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute left-0 bg-gradient-to-r from-health-teal to-health-purple bg-clip-text text-transparent"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default RotatingWords;
