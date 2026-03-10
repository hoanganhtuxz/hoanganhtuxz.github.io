"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { ExternalLink, Folder, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function CVProjects() {
  const { cvData, translations, isTransitioning } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleProject = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section
      id="projects"
      className={cn(
        "transition-all duration-500 ease-out delay-150",
        isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}
    >
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-6 font-medium">
        {translations.sections.projects}
      </h2>
      <div className="grid gap-4">
        {cvData.projects.map((project, index) => {
          const isExpanded = expandedIndex === index;
          const hasDetails = project.details && project.details.length > 0;

          return (
            <div
              key={index}
              className={cn(
                "group p-4 rounded-lg border border-border bg-card/50 transition-all duration-300",
                hasDetails ? "cursor-pointer hover:bg-card hover:border-accent/50" : ""
              )}
              onClick={() => hasDetails && toggleProject(index)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-accent/10 text-accent-foreground shrink-0 mt-1">
                  <Folder className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground group-hover:text-accent-foreground transition-colors">
                        {project.name}
                      </h3>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-accent-foreground transition-colors shrink-0"
                          title={translations.labels.viewProject}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    {hasDetails && (
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform duration-300 shrink-0",
                          isExpanded && "rotate-180"
                        )}
                      />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono block mb-2">
                    {project.period}
                  </span>
                  {project.description && (
                    <p className="text-foreground/70 text-sm leading-relaxed mb-1">
                      {project.description}
                    </p>
                  )}
                  
                  {/* Expanded Details */}
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      {project.details && project.details.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80 pl-1 marker:text-accent">
                          {project.details.map((detail, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
