"use client";

import { useLanguage } from "@/contexts/language-context";
import { Github, Mail, MapPin, Phone, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function CVHeader() {
  const { cvData, translations, isTransitioning } = useLanguage();

  return (
    <header
      className={cn(
        "transition-all duration-500 ease-out",
        isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}
    >
      <div className="mb-6 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4 sm:gap-6">
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-border shadow-lg">
            <Image
              src="/images/avatar.jpg"
              alt={cvData?.personal?.name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-background" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-1 sm:mb-2 tracking-tight text-balance">
            {cvData?.personal?.name}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-accent-foreground font-medium">
            {cvData?.personal?.title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base text-muted-foreground">
        <a
          href={`tel:${cvData?.personal?.phone}`}
          className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 hover:text-foreground transition-colors group"
        >
          <Phone className="w-4 h-4 text-accent-foreground group-hover:scale-110 transition-transform shrink-0" />
          <span className="truncate">{cvData?.personal?.phone}</span>
        </a>
        <a
          href={`mailto:${cvData?.personal?.email}`}
          className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 hover:text-foreground transition-colors group"
        >
          <Mail className="w-4 h-4 text-accent-foreground group-hover:scale-110 transition-transform shrink-0" />
          <span className="truncate">{cvData?.personal?.email}</span>
        </a>
        <a
          href={cvData?.personal?.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 hover:text-foreground transition-colors group"
        >
          <Github className="w-4 h-4 text-accent-foreground group-hover:scale-110 transition-transform shrink-0" />
          <span>GitHub</span>
        </a>
        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
          <MapPin className="w-4 h-4 text-accent-foreground shrink-0" />
          <span className="truncate">{cvData?.personal?.location}</span>
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
          <Calendar className="w-4 h-4 text-accent-foreground shrink-0" />
          <span>{cvData?.personal?.birthday}</span>
        </div>
      </div>
    </header>
  );
}
