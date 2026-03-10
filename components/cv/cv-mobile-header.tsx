"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

export function CVMobileHeader() {
  const { cvData, isTransitioning } = useLanguage();

  return (
    <header
      className={cn(
        "lg:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border py-4",
        "transition-all duration-300",
        isTransitioning ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="container px-4 sm:px-6 flex items-center justify-between gap-4">
        <span className="font-semibold text-foreground truncate">
          {cvData.personal.name}
        </span>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
