"use client";

import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { Sun, Moon, Clock } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, mode, toggleTheme, setMode, mounted } = useTheme();

  // Show placeholder while mounting to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-full bg-secondary/50 w-9 h-9" />
        <div className="p-2 rounded-full bg-secondary/50 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={cn(
          "relative p-2 rounded-full transition-all duration-300 ease-out",
          "hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "bg-secondary/50 backdrop-blur-sm"
        )}
        title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      >
        <div className="relative w-5 h-5">
          <Sun
            className={cn(
              "absolute inset-0 w-5 h-5 transition-all duration-300",
              theme === "light"
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 rotate-90 scale-0"
            )}
          />
          <Moon
            className={cn(
              "absolute inset-0 w-5 h-5 transition-all duration-300",
              theme === "dark"
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-90 scale-0"
            )}
          />
        </div>
      </button>

      {/* Auto Mode Toggle */}
      <button
        onClick={() => setMode(mode === "auto" ? "manual" : "auto")}
        className={cn(
          "relative p-2 rounded-full transition-all duration-300 ease-out",
          "hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          mode === "auto"
            ? "bg-accent/20 text-accent-foreground"
            : "bg-secondary/50 text-muted-foreground backdrop-blur-sm"
        )}
        title={mode === "auto" ? "Auto Mode (Time-based)" : "Manual Mode"}
      >
        <Clock
          className={cn(
            "w-4 h-4 transition-all duration-300",
            mode === "auto" && "animate-pulse"
          )}
        />
      </button>
    </div>
  );
}
