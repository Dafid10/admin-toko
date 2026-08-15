"use client";

import { useLanguage } from "@/context/LanguageContext";

const OPTIONS = [
  { code: "id" as const, flag: "🇮🇩", label: "ID" },
  { code: "en" as const, flag: "🇬🇧", label: "EN" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-cyan-500/30 bg-slate-900/60 p-1 backdrop-blur-md"
      role="group"
      aria-label="Language switcher"
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.code;
        return (
          <button
            key={opt.code}
            onClick={() => setLocale(opt.code)}
            aria-pressed={active}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
              active
                ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.35)] ring-1 ring-cyan-400/50"
                : "text-slate-400 hover:text-cyan-200"
            }`}
          >
            <span aria-hidden="true">{opt.flag}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
