"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Pesanan", href: "/admin" },
    { label: "Statistik", href: "/admin/stats" },
    { label: "Produk", href: "/admin/produk" },
    { label: "Tambah Produk", href: "/admin/products/new" },
    { label: "AI Assistant", href: "/admin/ai" },
    { label: "Pengiriman", href: "/admin/shipping" },
    { label: "Laporan Laba", href: "/admin/laporan" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      {/* Navbar Atas */}
      <nav className="flex items-center justify-between p-4 bg-white shadow-sm rounded-xl border border-outline-variant flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "font-bold text-primary bg-primary-container"
                    : "font-medium text-ink-muted hover:text-primary hover:bg-primary-container"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <LogoutButton />
      </nav>

      {/* Konten Utama Halaman Admin */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
        {children}
      </section>
    </div>
  );
}