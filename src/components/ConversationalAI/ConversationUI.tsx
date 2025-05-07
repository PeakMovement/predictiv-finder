
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeUserInput } from "@/utils/planGenerator/inputAnalyzer";

type MessageType = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  isTyping?: boolean;
};

type ConversationStage = 
  | "greeting" 
  | "primary_goal"
  | "symptoms" 
  | "timeline" 
  | "budget"
  | "location"
  | "preferences"
  | "confirmation"
  | "generating";

type ConversationData = {
  primaryGoal?: string;
  symptoms?: string[];
  timeline?: string;
  budget?: number | string;
  location?: string;
  preferOnline?: boolean;
  additionalInfo?: string;
};

interface ConversationUIProps {
  onComplete: (userQuery: string, conversationData: ConversationData) => void;
  isGenerating?: boolean;
}

const ConversationUI: React.FC<ConversationUIProps> = ({ onComplete, isGenerating = false }) => {
  // Message state
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [stage, setStage] = useState<ConversationStage>("greeting");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  
  // Collected conversation data
  const [conversationData, setConversationData] = useState<ConversationData>({});
  
  // Auto-scrolling message container
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Function to send a new message
  const sendMessage = (content: string, sender: "user" | "assistant", typing = false) => {
    if (!content.trim() && sender === "user") return;
    
    const newMessage: MessageType = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
      isTyping: typing
    };
    
    setMessages(prev => [...prev, newMessage]);
  };
  
  // Function to simulate assistant typing
  const simulateAssistantTyping = async (message: string, delay = 500) => {
    setIsAssistantTyping(true);
    
    // Add typing indicator
    const typingId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: typingId,
      content: "",
      sender: "assistant",
      timestamp: new Date(),
      isTyping: true
    }]);
    
    // Wait for delay to simulate typing
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Remove typing indicator and add actual message
    setMessages(prev => prev.filter(m => m.id !== typingId));
    sendMessage(message, "assistant");
    setIsAssistantTyping(false);
  };
  
  // Handle user input submission
  const handleSendMessage = () => {
    if (currentInput.trim() === "") return;
    
    sendMessage(currentInput, "user");
    
    // Process the user's input based on conversation stage
    processUserInput(currentInput);
    
    setCurrentInput("");
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Process user input based on current stage
  const processUserInput = (input: string) => {
    switch (stage) {
      case "greeting":
        setStage("primary_goal");
        setTimeout(() => {
          simulateAssistantTyping("What's your primary health goal or concern? For example, are you looking to manage a specific condition, improve fitness, or something else?");
        }, 800);
        break;
        
      case "primary_goal":
        setConversationData(prev => ({ ...prev, primaryGoal: input }));
        setStage("symptoms");
        setTimeout(() => {
          simulateAssistantTyping("Are you experiencing any specific symptoms or health issues that I should know about? If not, just say 'none'.");
        }, 800);
        break;
        
      case "symptoms":
        setConversationData(prev => ({ ...prev, symptoms: input.split(',').map(s => s.trim()) }));
        setStage("timeline");
        setTimeout(() => {
          simulateAssistantTyping("What's your timeframe for achieving results? (For example: '1 month', '3 months', 'by end of year')");
        }, 800);
        break;
        
      case "timeline":
        setConversationData(prev => ({ ...prev, timeline: input }));
        setStage("budget");
        setTimeout(() => {
          simulateAssistantTyping("What's your monthly budget for health services? (Approximate amount is fine)");
        }, 800);
        break;
        
      case "budget":
        setConversationData(prev => ({ ...prev, budget: input }));
        setStage("location");
        setTimeout(() => {
          simulateAssistantTyping("Where are you located? This helps us suggest nearby services. Or type 'skip' if you prefer not to share.");
        }, 800);
        break;
        
      case "location":
        if (input.toLowerCase() !== "skip") {
          setConversationData(prev => ({ ...prev, location: input }));
        }
        setStage("preferences");
        setTimeout(() => {
          simulateAssistantTyping("Do you prefer in-person services, or are you open to online/virtual options?");
        }, 800);
        break;
        
      case "preferences":
        const preferOnline = input.toLowerCase().includes("online") || input.toLowerCase().includes("virtual");
        setConversationData(prev => ({ ...prev, preferOnline }));
        setStage("confirmation");
        
        setTimeout(() => {
          const summaryMessage = createSummaryMessage();
          simulateAssistantTyping(summaryMessage);
          
          // After summary, add a follow-up asking for confirmation
          setTimeout(() => {
            simulateAssistantTyping("Does this look right? If yes, I'll generate your personalized health plan. If not, please provide any corrections or additional information.");
          }, 1500);
        }, 800);
        break;
        
      case "confirmation":
        if (input.toLowerCase().includes("yes") || input.toLowerCase().includes("good") || 
            input.toLowerCase().includes("correct") || input.toLowerCase().includes("right")) {
          // User confirmed information is correct
          setConversationData(prev => ({ ...prev, additionalInfo: input }));
          setStage("generating");
          
          // Create a comprehensive query from all collected data
          const fullQuery = createComprehensiveQuery();
          
          simulateAssistantTyping("Great! I'm generating your personalized health plan now...");
          
          // Call the onComplete callback with the full query
          setTimeout(() => {
            onComplete(fullQuery, conversationData);
          }, 1500);
        } else {
          // User provided additional information
          setConversationData(prev => ({ 
            ...prev, 
            additionalInfo: prev.additionalInfo ? `${prev.additionalInfo}. ${input}` : input 
          }));
          
          simulateAssistantTyping("Thanks for the additional information! Let me update your profile and generate your personalized health plan...");
          
          setStage("generating");
          
          // Create a comprehensive query including the additional info
          const fullQuery = createComprehensiveQuery();
          
          // Call the onComplete callback with the updated full query
          setTimeout(() => {
            onComplete(fullQuery, conversationData);
          }, 1500);
        }
        break;
        
      default:
        break;
    }
  };
  
  // Create a comprehensive user query from all collected data
  const createComprehensiveQuery = (): string => {
    const { primaryGoal, symptoms, timeline, budget, location, preferOnline, additionalInfo } = conversationData;
    
    let query = `My goal is ${primaryGoal}.`;
    
    if (symptoms && symptoms.length > 0 && symptoms[0] !== "none") {
      query += ` I'm experiencing ${symptoms.join(", ")}.`;
    }
    
    if (timeline) {
      query += ` I'm looking to achieve results within ${timeline}.`;
    }
    
    if (budget) {
      query += ` My monthly budget is approximately ${budget}.`;
    }
    
    if (location && location.toLowerCase() !== "skip") {
      query += ` I'm located in ${location}.`;
    }
    
    if (preferOnline !== undefined) {
      query += preferOnline 
        ? " I prefer online/virtual services."
        : " I prefer in-person services.";
    }
    
    if (additionalInfo) {
      query += ` Additional information: ${additionalInfo}`;
    }
    
    return query;
  };
  
  // Create a summary message for confirmation
  const createSummaryMessage = (): string => {
    const { primaryGoal, symptoms, timeline, budget, location, preferOnline } = conversationData;
    
    let summary = "Here's what I understand about your health needs:\n\n";
    
    summary += `📌 Primary goal: ${primaryGoal}\n`;
    
    if (symptoms && symptoms.length > 0 && symptoms[0].toLowerCase() !== "none") {
      summary += `🩺 Symptoms: ${symptoms.join(", ")}\n`;
    }
    
    if (timeline) {
      summary += `⏱️ Timeline: ${timeline}\n`;
    }
    
    if (budget) {
      summary += `💰 Budget: ${budget}/month\n`;
    }
    
    if (location && location.toLowerCase() !== "skip") {
      summary += `📍 Location: ${location}\n`;
    }
    
    if (preferOnline !== undefined) {
      summary += `🖥️ Preference: ${preferOnline ? "Online/virtual services" : "In-person services"}\n`;
    }
    
    return summary;
  };
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Start the conversation with a greeting when component mounts
  useEffect(() => {
    setTimeout(() => {
      simulateAssistantTyping("Hello! I'm your personal health assistant. I'll help create a personalized health plan for you. Let's start with a few questions to understand your needs better.");
    }, 500);
  }, []);

  return (
    <div className="flex flex-col rounded-xl bg-white dark:bg-gray-800 shadow-lg h-[600px] max-h-[80vh]">
      <div className="p-4 border-b dark:border-gray-700 flex items-center space-x-2">
        <Bot className="h-5 w-5 text-health-purple" />
        <h2 className="text-lg font-medium">Health Assistant</h2>
        <Badge variant="outline" className="ml-auto">
          {stage !== "greeting" && stage !== "generating" ? 
            `Step ${["greeting", "primary_goal", "symptoms", "timeline", "budget", "location", "preferences", "confirmation"].indexOf(stage)}/7` : 
            stage === "generating" ? "Generating plan..." : "Getting started"}
        </Badge>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-start gap-3 ${message.sender === "assistant" ? "" : "flex-row-reverse"}`}
              >
                <div className={`flex-shrink-0 ${message.sender === "assistant" ? "bg-health-purple" : "bg-gray-200 dark:bg-gray-700"} rounded-full p-1`}>
                  {message.sender === "assistant" ? (
                    <Bot className="h-5 w-5 text-white" />
                  ) : (
                    <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  )}
                </div>
                
                <div 
                  className={`
                    rounded-lg px-4 py-2 max-w-[80%]
                    ${message.sender === "assistant" ? 
                      "bg-gray-100 dark:bg-gray-800 border dark:border-gray-700" : 
                      "bg-health-purple text-white"
                    }
                  `}
                >
                  {message.isTyping ? (
                    <div className="flex space-x-1 items-center">
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "400ms" }} />
                    </div>
                  ) : (
                    <div className="whitespace-pre-line">{message.content}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t dark:border-gray-700">
        {stage !== "generating" ? (
          <div className="flex items-end gap-2">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your response..."
              className="resize-none"
              disabled={isAssistantTyping || isGenerating}
              rows={2}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!currentInput.trim() || isAssistantTyping || isGenerating}
              className="flex-shrink-0"
              size="icon"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-3 space-x-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Spinner className="h-5 w-5 text-health-purple" />
            <span>Generating your personalized health plan...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationUI;
