import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { lightTheme } from "./lightTheme";
import { darkTheme } from "./darkTheme";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem("app-theme") as ThemeMode) || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    let activeTheme: "light" | "dark";
    if (theme === "system") {
      activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      activeTheme = theme;
    }

    if (activeTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const themeVars = activeTheme === "dark" ? darkTheme : lightTheme;
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme: (newTheme: ThemeMode) => {
      localStorage.setItem("app-theme", newTheme);
      setTheme(newTheme);
    },
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};