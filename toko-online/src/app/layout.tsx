"use client";

import "./globals.css";
import FooterContent from "@/components/FooterContent";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ChatWidget from "@/components/ChatWidget";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext"; 
import { CartProvider, useCart } from "@/context/CartContext";
import Link from "next/link";

function HeaderContent() {
  const { t } = useLanguage();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-cyan-500/20 bg-slate-950/80 px-4 py-3 shadow-[0_4px_30px_rgba(34,211,238,0.08)] backdrop-blur-xl">
      <Link href="/" className="group flex items-center gap-2 transition-opacity hover:opacity-90">
        <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-cyan-400 to-emerald-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
        <h1 className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-lg font-bold text-transparent">
          {t("welcome")}
        </h1>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href="/keranjang"
          className="relative flex items-center justify-center rounded-full border border-cyan-500/20 bg-slate-900/60 p-2 text-slate-300 backdrop-blur-md transition-colors hover:border-cyan-400/50 hover:text-cyan-300"
          title={t("cart")}
        >
          <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-slate-950 bg-emerald-500 px-1 text-[10px] font-bold text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.6)]">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </Link>
        <LanguageSwitcher />
      </div>
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
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
        />
      </head>
      <body>
        <LanguageProvider>
          <CartProvider>
            <HeaderContent />
            <main className="min-h-screen">
              {children}
            </main>
            <footer className="w-full border-t border-cyan-500/20 bg-slate-950 px-4 py-8 text-slate-400 md:px-8">
              <FooterContent />
            </footer>
            <ChatWidget />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
