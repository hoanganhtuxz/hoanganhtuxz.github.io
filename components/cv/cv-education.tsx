"use client";

import { useLanguage } from "@/contexts/language-context";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function CVEducation() {
  const { cvData, translations, isTransitioning } = useLanguage();

  return (
    <section
      id="education"
      className={cn(
        "transition-all duration-500 ease-out delay-[250ms]",
        isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}
    >
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4 font-medium">
        {translations.sections.education}
      </h2>
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-secondary/50">
          <GraduationCap className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            {cvData?.education?.degree}
          </h3>
          <p className="text-muted-foreground">{cvData?.education?.school}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{cvData?.education?.year}</span>
            <span>•</span>
            <span>
              {translations.labels.grade}: {cvData?.education?.grade}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
