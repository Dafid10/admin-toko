"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function FooterContent() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <>
      <div className="flex flex-col gap-2 items-center md:items-start">
        <span className="text-headline-sm font-bold text-ink">PasarDigital</span>
        <span className="text-body-sm text-ink-muted">
          {t("footer.copyright").replace("{year}", year.toString())}
        </span>
      </div>
      <nav className="flex flex-wrap justify-center gap-6">
        <a className="text-label-sm text-ink-muted hover:underline" href="#">
          {t("footer.about")}
        </a>
        <a className="text-label-sm text-ink-muted hover:underline" href="#">
          {t("footer.terms")}
        </a>
        <a className="text-label-sm text-ink-muted hover:underline" href="#">
          {t("footer.privacy")}
        </a>
        <a className="text-label-sm text-ink-muted hover:underline" href="#">
          {t("footer.help")}
        </a>
      </nav>
    </>
  );
}
