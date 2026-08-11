import type { Metadata } from "next";
import "./globals.css";
import FooterContent from "@/components/FooterContent";
import LanguageProvider from "@/components/LanguageProvider"; 
import CartProvider from "@/components/CartProvider";

export const metadata: Metadata = {
  title: "Toko Online",
  description: "Website Toko Online",
};

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
            <main>
              {children}
            </main>
            <footer className="w-full py-8 px-4 md:px-8">
              <FooterContent />
            </footer>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}