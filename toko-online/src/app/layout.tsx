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
    <header className="w-full px-4 py-3 flex justify-between items-center border-b bg-white shadow-sm sticky top-0 z-50">
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <h1 className="font-bold text-lg">{t("welcome")}</h1>
      </Link>
      
      <div className="flex items-center gap-4">
        <Link 
          href="/keranjang" 
          className="relative p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
          title={t("cart")}
        >
          <span className="material-symbols-outlined text-[24px]">
            shopping_cart
          </span>
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 border-2 border-white">
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
            <footer className="w-full py-8 px-4 md:px-8 border-t bg-gray-50">
              <FooterContent />
            </footer>
            <ChatWidget />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}