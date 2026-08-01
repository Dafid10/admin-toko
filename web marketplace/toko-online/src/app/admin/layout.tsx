import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex flex-col h-screen py-6 gap-stack-md border-r border-outline-variant bg-surface-low w-64 fixed left-0 top-0">
        <div className="px-margin-mobile mb-4">
          <h2 className="text-headline-sm font-bold text-primary">Merchant Center</h2>
          <p className="text-body-sm text-ink-muted">PasarDigital Partner</p>
        </div>
        <nav className="flex-1 px-2 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 bg-secondary-container text-on-secondary-container rounded-xl mx-2 px-4 py-3 text-label-md transition-all group"
          >
            <span className="material-symbols-outlined filled">dashboard</span>
            Dashboard
          </Link>
          <Link
            href="/admin/produk"
            className="flex items-center gap-3 text-ink-muted px-4 py-3 mx-2 rounded-xl hover:bg-surface-highest transition-all text-label-md group"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            Produk &amp; Stok
          </Link>
          <Link
            href="/admin/laporan"
            className="flex items-center gap-3 text-ink-muted px-4 py-3 mx-2 rounded-xl hover:bg-surface-highest transition-all text-label-md group"
          >
            <span className="material-symbols-outlined">monitoring</span>
            Laporan
          </Link>
        </nav>
        <div className="px-4">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 md:ml-64">{children}</main>
    </div>
  );
}
