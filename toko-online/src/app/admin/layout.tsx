"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Pesanan", href: "/admin" },
    { label: "Produk", href: "/admin/produk" },
    { label: "Pengiriman", href: "/admin/shipping" },
    { label: "Laporan Laba", href: "/admin/laporan" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center justify-between p-4 bg-white shadow-sm rounded-xl border border-outline-variant">
        <div className="flex items-center gap-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-label-md px-3 py-1 rounded-lg transition-colors ${
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
      <section>{children}</section>
    </div>
  );
}
