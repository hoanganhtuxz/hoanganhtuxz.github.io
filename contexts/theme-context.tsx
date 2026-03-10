"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";
type ThemeMode = "auto" | "manual";

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  mounted: boolean;
}

const defaultContext: ThemeContextType = {
  theme: "light",
  mode: "auto",
  toggleTheme: () => {},
  setMode: () => {},
  mounted: false,
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

const STORAGE_KEY_THEME = "cv-theme";
const STORAGE_KEY_MODE = "cv-theme-mode";

function getThemeByTime(): Theme {
  const hour = new Date().getHours();
  // Dark: 19h-06h, Light: 07h-18h
  if (hour >= 19 || hour < 7) {
    return "dark";
  }
  return "light";
}

function ThemeScript() {
  const scriptContent = `
    (function() {
      try {
        var mode = localStorage.getItem('${STORAGE_KEY_MODE}');
        var theme = localStorage.getItem('${STORAGE_KEY_THEME}');
        var hour = new Date().getHours();
        var autoTheme = (hour >= 19 || hour < 7) ? 'dark' : 'light';
        var finalTheme = (mode === 'manual' && theme) ? theme : autoTheme;
        if (finalTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: scriptContent }} />;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mode, setModeState] = useState<ThemeMode>("auto");
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
    setTheme(newTheme);
  }, []);

  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as Theme | null;

    if (savedMode === "manual" && savedTheme) {
      setModeState("manual");
      applyTheme(savedTheme);
    } else {
      setModeState("auto");
      applyTheme(getThemeByTime());
    }
    setMounted(true);
  }, [applyTheme]);

  useEffect(() => {
    if (!mounted || mode !== "auto") return;

    const checkTime = () => {
      applyTheme(getThemeByTime());
    };

    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [mounted, mode, applyTheme]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setModeState("manual");
    localStorage.setItem(STORAGE_KEY_MODE, "manual");
    localStorage.setItem(STORAGE_KEY_THEME, newTheme);
    applyTheme(newTheme);
  }, [theme, applyTheme]);

  const setMode = useCallback(
    (newMode: ThemeMode) => {
      setModeState(newMode);
      localStorage.setItem(STORAGE_KEY_MODE, newMode);

      if (newMode === "auto") {
        const autoTheme = getThemeByTime();
        localStorage.removeItem(STORAGE_KEY_THEME);
        applyTheme(autoTheme);
      }
    },
    [applyTheme]
  );

  return (
    <ThemeContext.Provider
      value={{ theme, mode, toggleTheme, setMode, mounted }}
    >
      <ThemeScript />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
