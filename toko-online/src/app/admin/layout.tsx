// src/app/admin/layout.tsx
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r p-6">
        <h2 className="text-xl font-bold mb-8 text-blue-900">Admin Hanata</h2>
        <nav className="space-y-4">
          <Link href="/admin" className="block text-gray-600 hover:text-blue-600">🏠 Pesanan</Link>
          <Link href="/admin/produk" className="block text-gray-600 hover:text-blue-600">📦 Produk & Stok</Link>
          <Link href="/admin/stats" className="block text-gray-600 hover:text-blue-600">📊 Statistik</Link>
          <Link href="/admin/laporan" className="block text-gray-600 hover:text-blue-600">📋 Laporan</Link>
          <Link href="/admin/shipping" className="block text-gray-600 hover:text-blue-600">🚚 Pengiriman</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}