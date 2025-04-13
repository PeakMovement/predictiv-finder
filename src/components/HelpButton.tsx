
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

export const HelpButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
    >
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className="rounded-full w-14 h-14 flex items-center justify-center bg-health-purple hover:bg-health-purple-dark shadow-lg"
            size="lg"
          >
            <span className="text-xl">❓</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl">
              <span className="mr-2">🤔</span> Need Help?
            </DialogTitle>
            <DialogDescription>
              How can we assist you with finding the right health professionals?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Common Questions</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-health-teal mr-2">•</span>
                  <span>"How do I choose between the AI plans?"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-health-teal mr-2">•</span>
                  <span>"What information do I need to provide?"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-health-teal mr-2">•</span>
                  <span>"How are professionals vetted?"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-health-teal mr-2">•</span>
                  <span>"Can I modify my plan later?"</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-health-purple/10 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <span className="mr-2">🧠</span> AI Assistant Tip
              </h4>
              <p className="text-sm">
                For best results with the AI assistant, be specific about your goals, any injuries or conditions, budget constraints, and timeline when describing your situation.
              </p>
            </div>
            
            <Button 
              className="w-full bg-health-teal hover:bg-health-teal-dark mt-4"
              onClick={() => setIsOpen(false)}
            >
              Got it, thanks!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default HelpButton;
