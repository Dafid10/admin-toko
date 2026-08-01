"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function HeaderRight() {
  const { totalItems } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-4">
      <form onSubmit={handleSearch} className="relative hidden lg:block w-64 xl:w-80">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
          search
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface-low border border-outline-variant rounded-full text-body-sm text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          placeholder="Cari produk..."
          type="text"
        />
      </form>
      <div className="flex items-center gap-2">
        <Link
          href="/keranjang"
          aria-label="Keranjang"
          className="p-2 rounded-full hover:bg-surface-low transition-colors text-ink-muted hover:text-primary relative"
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          {totalItems > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-danger text-white text-[10px] rounded-full">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
