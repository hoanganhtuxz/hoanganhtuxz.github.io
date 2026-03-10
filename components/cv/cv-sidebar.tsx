"use client";

import { useLanguage } from "@/contexts/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navItems = [
  { id: "about", key: "about" },
  { id: "experience", key: "experience" },
  { id: "projects", key: "projects" },
  { id: "skills", key: "skills" },
  { id: "education", key: "education" },
] as const;

export function CVSidebar() {
  const { translations, isTransitioning } = useLanguage();
  const [activeSection, setActiveSection] = useState("about");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    navItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col sticky top-0 h-screen py-12 transition-all duration-500",
        isTransitioning ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="mb-8 flex flex-col gap-4">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map(({ id, key }) => (
            <li key={id}>
              <button
                onClick={() => scrollToSection(id)}
                className={cn(
                  "group flex items-center gap-3 py-2 text-sm font-medium transition-all duration-200",
                  activeSection === id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-px transition-all duration-300",
                    activeSection === id
                      ? "w-12 bg-foreground"
                      : "w-6 bg-muted-foreground/50 group-hover:w-10 group-hover:bg-muted-foreground"
                  )}
                />
                <span className="uppercase tracking-wider">
                  {translations.nav[key as keyof typeof translations.nav]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
