
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, MessageSquare, Sparkles, Clock, DollarSign, Target } from 'lucide-react';
import { analyzeUserInput } from '@/utils/planGenerator/inputAnalyzer';

// Import our new modular components
import InputAnalysisDisplay from './components/InputAnalysisDisplay';
import InputTips from './components/InputTips';
import ExamplePrompts from './components/ExamplePrompts';

interface AIAssistantInputProps {
  onSubmit: (input: string) => void;
  isLoading?: boolean;
}

// Common tips for better results
const tipItems = [
  "Include your specific goal (e.g., weight loss, pain relief, performance)",
  "Mention any relevant health conditions or injuries",
  "Tell us your monthly budget for health services",
  "Let us know your location or if you prefer online options",
  "Share your timeline (how quickly you need results)"
];

// Example prompts for user reference
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

/**
 * Enhanced AI Assistant Input component with real-time analysis
 * and improved UI for better user experience
 */
export const AIAssistantInput = ({ 
  onSubmit, 
  isLoading = false 
}: AIAssistantInputProps) => {
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeUserInput> | null>(null);
  const { toast } = useToast();

  // Handle input changes with real-time analysis
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (e.target.value.length > 20) {
      const quickAnalysis = analyzeUserInput(e.target.value);
      setAnalysis(quickAnalysis);
    } else {
      setAnalysis(null);
    }
  };

  // Handle form submission with validation
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

  // Handle clicking on an example prompt
  const handleExampleClick = (example: string) => {
    setInput(example);
    const quickAnalysis = analyzeUserInput(example);
    setAnalysis(quickAnalysis);
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
              onChange={handleInputChange}
              className="h-64 mb-4"
            />
            
            {analysis && input.length > 20 && (
              <InputAnalysisDisplay analysis={analysis} />
            )}
            
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
            <InputTips tipItems={tipItems} />
            
            <ExamplePrompts 
              examples={promptExamples} 
              onExampleClick={handleExampleClick}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAssistantInput;
