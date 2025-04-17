
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, MessageSquare, Sparkles, Clock, DollarSign, Target } from 'lucide-react';

interface AIAssistantInputProps {
  onSubmit: (input: string) => void;
  isLoading?: boolean;
}

const promptExamples = [
  {
    title: "I need help with my back pain",
    content: "I've been experiencing lower back pain for 3 weeks, especially when sitting. My budget is around R1000/month, and I'd prefer something close to Sandton.",
    icon: <MessageSquare className="w-4 h-4" />
  },
  {
    title: "Weight loss journey",
    content: "I want to lose 10kg in the next 3 months. I have R1500/month to spend and I'm looking for a combination of nutrition advice and exercise support.",
    icon: <Target className="w-4 h-4" />
  },
  {
    title: "Marathon training",
    content: "I'm training for my first marathon in 4 months and need help with conditioning, recovery, and injury prevention. My budget is R2000/month.",
    icon: <Clock className="w-4 h-4" />
  },
  {
    title: "Stress and anxiety management",
    content: "Looking for affordable ways to manage my stress and anxiety. I can spend about R800 monthly and would prefer online options.",
    icon: <DollarSign className="w-4 h-4" />
  }
];

const tipItems = [
  "Include your specific goal (e.g., weight loss, pain relief, performance)",
  "Mention any relevant health conditions or injuries",
  "Tell us your monthly budget for health services",
  "Let us know your location or if you prefer online options",
  "Share your timeline (how quickly you need results)"
];

export const AIAssistantInput = ({ 
  onSubmit, 
  isLoading = false 
}: AIAssistantInputProps) => {
  const [input, setInput] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (input.trim().length < 10) {
      toast({
        title: "Input too short",
        description: "Please provide more details about your needs",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(input);
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="w-6 h-6 text-health-purple" />
          <h2 className="text-xl font-semibold">Tell us what you're looking for</h2>
        </div>
        
        <div className="flex gap-6 mb-6 flex-col md:flex-row">
          <div className="md:w-2/3">
            <Textarea
              placeholder="Describe your health goals, challenges, or what you're looking to improve..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-64 mb-4"
            />
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="bg-health-purple hover:bg-health-purple-dark flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create My Plan
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/3">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-sm mb-2 text-health-purple">Tips for better results:</h3>
              <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300">
                {tipItems.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-health-teal mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-2">Try an example:</h3>
              <div className="space-y-2">
                {promptExamples.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => handleExampleClick(example.content)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-health-purple">{example.icon}</div>
                      <div className="truncate">{example.title}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAssistantInput;
