"use client";

import type { Metadata } from "next";
import "./globals.css";
import FooterContent from "@/components/FooterContent";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext"; 
import { CartProvider } from "@/context/CartContext";

function HeaderContent() {
  const { t } = useLanguage();

  return (
    <header className="w-full px-4 py-3 flex justify-between items-center border-b bg-white shadow-sm">
      <h1 className="font-bold text-lg">{t("welcome")}</h1>
      <LanguageSwitcher />
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <LanguageProvider>
          <CartProvider>
            <HeaderContent />
            <main className="min-h-screen">
              {children}
            </main>
            <footer className="w-full py-8 px-4 md:px-8 border-t bg-gray-50">
              <FooterContent />
            </footer>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}