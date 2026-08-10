"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLocale("id")}
        className={`px-2 py-1 text-xs font-bold rounded border ${
          locale === "id"
            ? "bg-primary text-white border-primary"
            : "bg-surface text-ink-muted border-outline hover:bg-surface-high"
        }`}
      >
        ID
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`px-2 py-1 text-xs font-bold rounded border ${
          locale === "en"
            ? "bg-primary text-white border-primary"
            : "bg-surface text-ink-muted border-outline hover:bg-surface-high"
        }`}
      >
        EN
      </button>
    </div>
  );
}
