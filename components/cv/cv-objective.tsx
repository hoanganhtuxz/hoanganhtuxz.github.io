"use client";

import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

export function CVObjective() {
  const { cvData, translations, isTransitioning } = useLanguage();

  return (
    <section
      id="about"
      className={cn(
        "transition-all duration-500 ease-out delay-75",
        isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}
    >
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4 font-medium">
        {translations.sections.objective}
      </h2>
      <p className="text-foreground/90 leading-relaxed text-lg">
        {cvData.objective}
      </p>
    </section>
  );
}
