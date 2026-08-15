"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import idDict from "@/locales/id.json";
import enDict from "@/locales/en.json";

type Locale = "id" | "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries: Record<Locale, Record<string, string>> = {
  id: idDict,
  en: enDict,
};

/**
 * Fungsi deteksi bahasa otomatis.
 * Urutan prioritas:
 *   1. localStorage (pilihan yang pernah dipilih pengguna)
 *   2. navigator.language (bahasa browser)
 *   3. fallback ke "id"
 */
function detectLanguage(): Locale {
  // 1. Cek pilihan yang tersimpan di localStorage
  if (typeof window !== "undefined") {
    const savedLocale = localStorage.getItem("locale");
    if (savedLocale === "id" || savedLocale === "en") {
      return savedLocale;
    }

    // 2. Cek bahasa browser
    const browserLang = navigator.language?.split("-")[0];
    if (browserLang === "en") {
      return "en";
    }
  }

  // 3. Fallback ke bahasa Indonesia
  return "id";
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>("id");

  // Deteksi bahasa sekali saat mount (client-side only)
  useEffect(() => {
    const detected = detectLanguage();
    setLocale(detected);
    document.documentElement.lang = detected;
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
    document.documentElement.lang = newLocale;
  };

  // Robust translation lookup with a multi-level fallback so toggling
  // languages can never crash even if a dictionary or key is missing:
  //   1. active locale dictionary
  //   2. Indonesian dictionary (default language)
  //   3. the raw key itself
  const t = (key: string) => {
    const active = dictionaries[locale] ?? dictionaries.id ?? {};
    const fallback = dictionaries.id ?? {};
    return active[key] ?? fallback[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
