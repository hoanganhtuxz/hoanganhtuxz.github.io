"use client";

import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { language, setLanguage, isTransitioning, languages } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full bg-secondary/50 p-1 backdrop-blur-sm">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          disabled={isTransitioning}
          className={cn(
            "relative px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ease-out",
            "hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            language === lang.code
              ? "bg-foreground text-background shadow-md"
              : "text-muted-foreground hover:bg-secondary"
          )}
          title={lang.fullName}
        >
          <span
            className={cn(
              "relative z-10 transition-transform duration-200",
              language === lang.code && "scale-105"
            )}
          >
            {lang.label}
          </span>
        </button>
      ))}
    </div>
  );
}
