"use client";

import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

export function CVExperience() {
  const { cvData, translations, isTransitioning } = useLanguage();

  return (
    <section
      id="experience"
      className={cn(
        "transition-all duration-500 ease-out delay-100",
        isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}
    >
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-6 font-medium">
        {translations.sections.experience}
      </h2>
      <div className="space-y-8">
        {cvData?.experience?.map((exp, index) => (
          <div
            key={index}
            className="group relative"
          >
            <div className="mb-3">
              <span className="text-sm text-muted-foreground font-mono block mb-1">
                {exp.period}
              </span>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-accent-foreground transition-colors">
                {exp.title}
              </h3>
              <p className="text-muted-foreground">{exp.company}</p>
            </div>
            <ul className="space-y-2 ml-0">
              {exp.descriptions.map((desc, i) => (
                <li key={i} className="text-foreground/80 flex gap-2">
                  <span className="text-accent-foreground mt-1.5 shrink-0">•</span>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
