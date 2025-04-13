
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

interface AIAssistantInputProps {
  onSubmit: (input: string) => void;
  isLoading?: boolean;
}

export const AIAssistantInput = ({ 
  onSubmit, 
  isLoading = false 
}: AIAssistantInputProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md"
      >
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <span className="emoji-icon">🧠</span> AI Health Assistant
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Textarea
              placeholder="Describe your health or fitness situation in your own words, and we'll build you a custom plan."
              className="min-h-32 text-base"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-health-purple hover:bg-health-purple-dark text-white"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>Build My Health Plan</>
              )}
            </Button>
          </div>
        </form>
        
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2"><strong>Example:</strong> "I've injured my knee but want to start running again. I only have R1200 to spend."</p>
          <div className="text-xs opacity-75">Your data is used only to create your personalized plan and is never shared with third parties.</div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIAssistantInput;
