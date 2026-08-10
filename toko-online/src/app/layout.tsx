import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Link from "next/link";
import { Suspense } from "react";
import HeaderRight from "@/components/HeaderRight";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NavLinks from "@/components/NavLinks";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "PasarDigital",
  description: "Belanja kebutuhan rumah tangga & dapur, bayar instan pakai QRIS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <LanguageProvider>
        <CartProvider>
          <header className="sticky top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 bg-surface-lowest shadow-sm">
          <div className="flex items-center gap-gutter">
            <Link href="/" className="text-headline-md font-black text-primary">
              PasarDigital
            </Link>
            <NavLinks />
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <HeaderRight />
          </div>
          </header>
          <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg min-h-[70vh]">
            {children}
          </main>
          <footer className="w-full py-stack-lg px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-gutter bg-surface-highest border-t border-outline-variant mt-auto">
            <FooterContent />
          </footer>
        </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
