
import React, { useState } from 'react';
import ConversationUI from './ConversationUI';
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ConversationalAIProps {
  onSubmit: (input: string) => void;
  isLoading?: boolean;
}

const ConversationalAI: React.FC<ConversationalAIProps> = ({ onSubmit, isLoading = false }) => {
  const [userQuery, setUserQuery] = useState<string>("");
  const { toast } = useToast();
  
  // Handle completion of the conversation
  const handleConversationComplete = (fullQuery: string, conversationData: any) => {
    console.log("Conversation data collected:", conversationData);
    setUserQuery(fullQuery);
    onSubmit(fullQuery);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <ConversationUI 
          onComplete={handleConversationComplete}
          isGenerating={isLoading}
        />
      </div>
    </motion.div>
  );
};

export default ConversationalAI;
