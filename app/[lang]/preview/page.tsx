"use client";

import { CVSidebar } from "@/components/cv/cv-sidebar";
import { CVMobileHeader } from "@/components/cv/cv-mobile-header";
import { CVHeader } from "@/components/cv/cv-header";
import { CVObjective } from "@/components/cv/cv-objective";
import { CVExperience } from "@/components/cv/cv-experience";
import { CVProjects } from "@/components/cv/cv-projects";
import { CVSkills } from "@/components/cv/cv-skills";
import { CVEducation } from "@/components/cv/cv-education";
import { CVBackToTop } from "@/components/cv/cv-back-to-top";
import { ThemeProvider } from "@/contexts/theme-context";
import { LanguageProvider } from "@/contexts/language-context";
import { use } from "react";

/**
 * Preview page — loaded inside the admin iframe.
 * Uses LanguageProvider with isPreview=true to:
 *   1. Fetch data from /api/cv/preview
 *   2. Listen for postMessage CV_PREVIEW_UPDATE events
 */
export default function PreviewPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);

  return (
    <ThemeProvider>
      <LanguageProvider initialLang={lang} isPreview={true}>
        <div className="min-h-screen bg-background">
          <CVMobileHeader />
          <div className="container max-w-6xl mx-auto px-4 lg:px-8">
            <div className="flex gap-16 lg:gap-24">
              <div className="hidden lg:block w-48 shrink-0">
                <CVSidebar />
              </div>
              <main className="flex-1 py-12 lg:py-24 max-w-3xl">
                <div className="space-y-16 lg:space-y-24">
                  <CVHeader />
                  <CVObjective />
                  <CVExperience />
                  <CVProjects />
                  <CVSkills />
                  <CVEducation />
                  <footer className="pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      &copy; {new Date().getFullYear()} Hoang Anh Tu. All rights reserved.
                    </p>
                  </footer>
                </div>
              </main>
            </div>
          </div>
          <CVBackToTop />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
