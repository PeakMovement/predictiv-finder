
import { ToastProvider as ShadcnToastProvider } from "@/components/ui/toast";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { useTheme } from "next-themes";

interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * Unified toast provider that supports both shadcn/ui toast and sonner
 * Use this at the root of your app to ensure consistent toast notifications
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const { theme } = useTheme();
  
  return (
    <>
      <ShadcnToastProvider>
        {children}
      </ShadcnToastProvider>
      <SonnerToaster theme={theme as any} />
    </>
  );
}

export default ToastProvider;
