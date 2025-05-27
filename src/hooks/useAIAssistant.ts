
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIResponse {
  message: string;
  recommendations: string[];
  timestamp: string;
  userId: string;
}

export const useAIAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (message: string, context?: any): Promise<AIResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use the AI assistant.",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase.functions.invoke('ai-health-assistant', {
        body: { message, context }
      });

      if (error) throw error;

      return data as AIResponse;
    } catch (error: any) {
      toast({
        title: "AI Assistant Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading
  };
};
