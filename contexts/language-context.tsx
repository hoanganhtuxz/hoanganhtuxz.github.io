"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
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

const STORAGE_KEY = "editable-cv-data";
const LANGUAGES_KEY = "cv-languages";

// No longer relying on synchronous localStorage for initial load, data will be fetched inside useEffect.

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [languages, setLanguages] = useState<LanguageConfig[]>(defaultLanguages);
  const [language, setLanguageState] = useState<Language>("vi");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cvData, setCvData] = useState<CVData>(cvDataVI);
  const [translations, setTranslations] = useState<Translations>(
    getTranslations("vi")
  );

  // Data shared from API fetch
  const [allData, setAllData] = useState<Record<string, CVData>>({
    vi: cvDataVI,
    en: cvDataEN,
    cn: cvDataCN,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cv');
        if (res.ok) {
          const dbConfig = await res.json();
          const storedLanguages = dbConfig.languages || defaultLanguages;
          setLanguages(storedLanguages);
          
          const dbAllData = dbConfig.allCVData || { vi: cvDataVI, en: cvDataEN, cn: cvDataCN };
          setAllData(dbAllData);
          
          const savedLang = (localStorage.getItem("cv-language") as Language) || "vi";
          // Check if the saved lang exists in our config
          const isValid = storedLanguages.some((l: LanguageConfig) => l.code === savedLang);
          const initialLang = isValid ? savedLang : "vi";
          
          setLanguageState(initialLang);
          setCvData(dbAllData[initialLang] || cvDataVI);
          setTranslations(getTranslations(initialLang));
        }
      } catch (e) {
        console.error("Failed to load CV database", e);
      }
    }
    loadData();
  }, []);

  // Listen for storage changes (for language preference syncing between tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cv-language" && e.newValue) {
        setLanguageState(e.newValue);
        setCvData(allData[e.newValue] || cvDataVI);
        setTranslations(getTranslations(e.newValue));
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [allData]);

  const setLanguage = (lang: Language) => {
    setIsTransitioning(true);
    localStorage.setItem("cv-language", lang);

    setTimeout(() => {
      setLanguageState(lang);
      setCvData(allData[lang] || cvDataVI);
      setTranslations(getTranslations(lang));

      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
  };

  const addLanguage = (config: LanguageConfig) => {
    const newLanguages = [...languages, config];
    setLanguages(newLanguages);
  };

  const removeLanguage = (code: string) => {
    if (["vi", "en", "cn"].includes(code)) return; // Prevent deleting core languages
    
    const newLanguages = languages.filter(l => l.code !== code);
    setLanguages(newLanguages);
    
    if (language === code) {
      setLanguage("vi");
    }
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
