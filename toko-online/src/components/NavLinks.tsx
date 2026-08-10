"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function NavLinks() {
  const { t } = useLanguage();

  return (
    <nav className="hidden md:flex gap-6 ml-8">
      <Link
        href="/"
        className="text-label-md text-primary border-b-2 border-primary pb-1"
      >
        {t("nav.catalog")}
      </Link>
      <Link
        href="/admin"
        className="text-label-md text-ink-muted hover:text-primary transition-colors"
      >
        {t("nav.merchant_center")}
      </Link>
    </nav>
  );
}
