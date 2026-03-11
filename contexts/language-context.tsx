"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  cvDataVI,
  cvDataEN,
  cvDataCN,
  getTranslations,
  type CVData,
  type Translations,
} from "@/data/cv-data";

export interface LanguageConfig {
  code: string;
  label: string;
  fullName: string;
}

export const defaultLanguages: LanguageConfig[] = [
  { code: "vi", label: "VI", fullName: "Tiếng Việt" },
  { code: "en", label: "EN", fullName: "English" },
  { code: "cn", label: "中", fullName: "中文" },
];

export type Language = string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: LanguageConfig[];
  addLanguage: (config: LanguageConfig) => void;
  removeLanguage: (code: string) => void;
  cvData: CVData;
  translations: Translations;
  isTransitioning: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const DEFAULT_ALL_DATA: Record<string, CVData> = {
  vi: cvDataVI,
  en: cvDataEN,
  cn: cvDataCN,
};

export function LanguageProvider({
  children,
  initialLang = "vi",
  isPreview = false,
}: {
  children: ReactNode;
  initialLang?: string;
  isPreview?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [languages, setLanguages] = useState<LanguageConfig[]>(defaultLanguages);
  const [language, setLanguageState] = useState<Language>(initialLang);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cvData, setCvData] = useState<CVData>(
    DEFAULT_ALL_DATA[initialLang] ?? cvDataVI
  );
  const [translations, setTranslations] = useState<Translations>(
    getTranslations(initialLang)
  );
  const [allData, setAllData] = useState<Record<string, CVData>>(DEFAULT_ALL_DATA);

  // Fetch live or preview data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const endpoint = isPreview ? "/api/cv/preview" : "/api/cv";
        const res = await fetch(endpoint, { cache: "no-store" });
        if (res.ok) {
          const dbConfig = await res.json();
          const storedLanguages: LanguageConfig[] = dbConfig.languages || defaultLanguages;
          setLanguages(storedLanguages);

          const dbAllData: Record<string, CVData> = dbConfig.allCVData || DEFAULT_ALL_DATA;
          setAllData(dbAllData);

          const isValid = storedLanguages.some((l) => l.code === initialLang);
          const resolvedLang = isValid ? initialLang : "vi";

          setLanguageState(resolvedLang);
          setCvData(dbAllData[resolvedLang] ?? cvDataVI);
          setTranslations(getTranslations(resolvedLang));

          if (!isValid && initialLang !== "vi") {
            router.replace("/vi");
          }
        }
      } catch (e) {
        console.error("Failed to load CV database", e);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── postMessage receiver (preview mode only) ──────────────────────────────
  const handlePreviewMessage = useCallback(
    (event: MessageEvent) => {
      // Only accept messages from same origin
      if (event.origin !== window.location.origin) return;

      const { type, lang, allCVData, languages: newLanguages } = event.data || {};
      if (type !== "CV_PREVIEW_UPDATE") return;

      if (allCVData) {
        setAllData(allCVData);
        const targetLang = lang || language;
        if (allCVData[targetLang]) {
          setCvData(allCVData[targetLang]);
        }
      }
      if (newLanguages?.length) {
        setLanguages(newLanguages);
      }
    },
    [language]
  );

  useEffect(() => {
    if (!isPreview) return;
    window.addEventListener("message", handlePreviewMessage);
    // Signal to parent that iframe is ready to receive messages
    window.parent.postMessage({ type: "CV_PREVIEW_READY" }, "*");
    return () => window.removeEventListener("message", handlePreviewMessage);
  }, [isPreview, handlePreviewMessage]);
  // ─────────────────────────────────────────────────────────────────────────

  const setLanguage = (lang: Language) => {
    if (lang === language) return;

    setIsTransitioning(true);

    const segments = pathname.split("/");
    segments[1] = lang;
    const newPath = segments.join("/") || `/${lang}`;

    setTimeout(() => {
      setLanguageState(lang);
      setCvData(allData[lang] ?? cvDataVI);
      setTranslations(getTranslations(lang));
      router.push(newPath);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 300);
  };

  const addLanguage = (config: LanguageConfig) => {
    setLanguages((prev) => [...prev, config]);
  };

  const removeLanguage = (code: string) => {
    if (["vi", "en", "cn"].includes(code)) return;
    setLanguages((prev) => prev.filter((l) => l.code !== code));
    if (language === code) setLanguage("vi");
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languages,
        addLanguage,
        removeLanguage,
        cvData,
        translations,
        isTransitioning,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
