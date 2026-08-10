"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Locale = "id" | "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries: Record<Locale, Record<string, string>> = {
  id: {
    "nav.catalog": "Katalog",
    "nav.merchant_center": "Merchant Center",
    "footer.copyright": "© {year} PasarDigital Marketplace. Pembayaran aman via QRIS.",
    "footer.about": "Tentang Kami",
    "footer.terms": "Syarat & Ketentuan",
    "footer.privacy": "Kebijakan Privasi",
    "footer.help": "Bantuan Merchant",
    "cart.title": "Keranjang Belanja",
    "cart.empty": "Keranjang Anda kosong",
    "product.description": "Deskripsi Produk",
    "product.add_to_cart": "Tambah ke Keranjang",
    "product.buy_now": "Beli Sekarang",
    "product.stock": "Stok",
    "common.back": "Kembali",
    "common.save": "Simpan",
    "common.cancel": "Batal",
    "search.placeholder": "Cari produk...",
  },
  en: {
    "nav.catalog": "Catalog",
    "nav.merchant_center": "Merchant Center",
    "footer.copyright": "© {year} PasarDigital Marketplace. Secure payment via QRIS.",
    "footer.about": "About Us",
    "footer.terms": "Terms & Conditions",
    "footer.privacy": "Privacy Policy",
    "footer.help": "Merchant Help",
    "cart.title": "Shopping Cart",
    "cart.empty": "Your cart is empty",
    "product.description": "Product Description",
    "product.add_to_cart": "Add to Cart",
    "product.buy_now": "Buy Now",
    "product.stock": "Stock",
    "common.back": "Back",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "search.placeholder": "Search products...",
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>("id");

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale;
    if (savedLocale && (savedLocale === "id" || savedLocale === "en")) {
      setLocale(savedLocale);
    } else {
        const browserLang = navigator.language.split("-")[0];
        if (browserLang === "en") {
            setLocale("en");
        }
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: string) => {
    const translation = dictionaries[locale][key] || key;
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
