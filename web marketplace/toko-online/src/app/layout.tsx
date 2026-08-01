import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Link from "next/link";
import { Suspense } from "react";
import HeaderRight from "@/components/HeaderRight";

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
        <CartProvider>
          <header className="sticky top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 bg-surface-lowest shadow-sm">
            <div className="flex items-center gap-gutter">
              <Link href="/" className="text-headline-md font-black text-primary">
                PasarDigital
              </Link>
              <nav className="hidden md:flex gap-6 ml-8">
                <Link href="/" className="text-label-md text-primary border-b-2 border-primary pb-1">
                  Katalog
                </Link>
                <Link href="/admin" className="text-label-md text-ink-muted hover:text-primary transition-colors">
                  Merchant Center
                </Link>
              </nav>
            </div>
            <Suspense fallback={<div className="w-10" />}>
              <HeaderRight />
            </Suspense>
          </header>
          <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg min-h-[70vh]">
            {children}
          </main>
          <footer className="w-full py-stack-lg px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-gutter bg-surface-highest border-t border-outline-variant mt-auto">
            <div className="flex flex-col gap-2 items-center md:items-start">
              <span className="text-headline-sm font-bold text-ink">PasarDigital</span>
              <span className="text-body-sm text-ink-muted">
                © {new Date().getFullYear()} PasarDigital Marketplace. Pembayaran aman via QRIS.
              </span>
            </div>
            <nav className="flex flex-wrap justify-center gap-6">
              <a className="text-label-sm text-ink-muted hover:underline" href="#">Tentang Kami</a>
              <a className="text-label-sm text-ink-muted hover:underline" href="#">Syarat &amp; Ketentuan</a>
              <a className="text-label-sm text-ink-muted hover:underline" href="#">Kebijakan Privasi</a>
              <a className="text-label-sm text-ink-muted hover:underline" href="#">Bantuan Merchant</a>
            </nav>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
