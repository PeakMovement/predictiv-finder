import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeProviderState>({
  theme: "dark",
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "ui-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Listen for theme sync from parent app (Predictiv Final)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const root = window.document.documentElement;
      
      // Sync theme from parent
      if (event.data?.theme) {
        const newTheme = event.data.theme as Theme;
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
        setTheme(newTheme);
        localStorage.setItem(storageKey, newTheme);
      }
      
      // Sync primary color from color wheel
      if (event.data?.primaryColor) {
        document.documentElement.style.setProperty("--primary", event.data.primaryColor);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [storageKey]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
