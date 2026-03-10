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
  type CVData,
} from "@/data/cv-data";

interface EditableCVContextType {
  allCVData: Record<string, CVData>;
  updateCVData: (lang: string, data: CVData) => void;
  removeCVData: (lang: string) => void;
  resetToDefault: () => void;
}

const EditableCVContext = createContext<EditableCVContextType | undefined>(
  undefined
);

// Removed STORAGE_KEY since we sync via API in Admin Dashboard

export function EditableCVProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Record<string, CVData>>({
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
          if (dbConfig.allCVData) {
            setData((prev) => ({
              ...prev,
              ...dbConfig.allCVData,
              // Guarantee core defaults if missing
              vi: dbConfig.allCVData.vi || cvDataVI,
              en: dbConfig.allCVData.en || cvDataEN,
              cn: dbConfig.allCVData.cn || cvDataCN,
            }));
          }
        }
      } catch (e) {
        console.error("Failed to load CV database", e);
      }
    }
    loadData();
  }, []);

  const updateCVData = (lang: string, newData: CVData) => {
    setData((prev) => {
      const updated = { ...prev, [lang]: newData };
      return updated;
    });
  };

  const removeCVData = (lang: string) => {
    setData((prev) => {
      const updated = { ...prev };
      delete updated[lang];
      return updated;
    });
  };

  const resetToDefault = () => {
    const defaultData = {
      vi: cvDataVI,
      en: cvDataEN,
      cn: cvDataCN,
    };
    setData(defaultData);
  };

  return (
    <EditableCVContext.Provider
      value={{
        allCVData: data,
        updateCVData,
        removeCVData,
        resetToDefault,
      }}
    >
      {children}
    </EditableCVContext.Provider>
  );
}

export function useEditableCV() {
  const context = useContext(EditableCVContext);
  if (context === undefined) {
    throw new Error("useEditableCV must be used within an EditableCVProvider");
  }
  return context;
}
