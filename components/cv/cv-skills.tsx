"use client";

import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

export function CVSkills() {
  const { cvData, translations, isTransitioning } = useLanguage();

  return (
    <section
      id="skills"
      className={cn(
        "transition-all duration-500 ease-out delay-200",
        isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}
    >
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-6 font-medium">
        {translations.nav.skills}
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">
            {translations.sections.technicalSkills}
          </h3>
          <ul className="space-y-2">
            {cvData?.skills?.technical?.map((skill, i) => (
              <li key={i} className="text-foreground/80 flex gap-2">
                <span className="text-accent-foreground mt-1 shrink-0">•</span>
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">
            {translations.sections.softSkills}
          </h3>
          <ul className="space-y-2">
            {cvData?.skills?.soft?.map((skill, i) => (
              <li key={i} className="text-foreground/80 flex gap-2">
                <span className="text-accent-foreground mt-1 shrink-0">•</span>
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
