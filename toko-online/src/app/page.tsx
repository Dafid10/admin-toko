"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useLanguage } from "@/context/LanguageContext";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Guard: createClient throws "supabaseUrl is required" when env vars are
// missing (e.g. in preview), which would crash the whole page. Only build the
// client when both values exist so the catalog degrades gracefully instead.
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Home() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      if (!supabase) {
        console.warn("[v0] Supabase env vars are not set; skipping product fetch.");
        setProducts([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("Product")
        .select("*, ProductMedia(*)");

      if (error) {
        console.error("[v0] Error fetching products:", error.message);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const name = (p.name || p.nama_produk || "").toLowerCase();
    const code = (p.sku || p.code || p.kode || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || code.includes(q);
  });

  return (
    <main className="relative min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Ambient neon glow backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-40 right-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-8">
        {/* Header: title, subtitle, live counter + search */}
        <header className="rounded-2xl border border-cyan-500/30 bg-slate-900/50 p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="bg-gradient-to-r from-cyan-300 via-cyan-200 to-emerald-300 bg-clip-text text-2xl font-bold text-transparent text-balance">
                  {t("catalog.title")}
                </h1>
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                  {filteredProducts.length} {t("catalog.counter")}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{t("catalog.subtitle")}</p>
            </div>

            <div className="w-full md:w-96">
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-cyan-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-cyan-500/30 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 shadow-[inset_0_0_12px_rgba(34,211,238,0.06)] transition-all focus:border-cyan-400/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Product grid */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-cyan-400">
              progress_activity
            </span>
            {t("catalog.loading")}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/50 py-16 text-center text-slate-400 backdrop-blur-xl">
            {t("catalog.not_found")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const mediaList = product.ProductMedia || [];
              const fallbackImage = product.imageUrl || product.image || product.image_url || "";
              const primaryMedia =
                mediaList.find((m: any) => m.is_primary || m.order === 0) || mediaList[0];
              const imageUrl = primaryMedia
                ? primaryMedia.url || primaryMedia.image || primaryMedia.file_url || primaryMedia.path || ""
                : fallbackImage;
              const isVideo =
                imageUrl.endsWith(".mp4") ||
                imageUrl.includes("video") ||
                primaryMedia?.type === "VIDEO" ||
                primaryMedia?.type === "video";

              const code = product.sku || product.code || product.kode || "—";
              const stockValue = Number(
                product.stock !== undefined ? product.stock : product.stok !== undefined ? product.stok : 0
              );
              const isPreorder =
                product.stockStatus === "INDENT" ||
                Boolean(product.isPreorder || product.preorder);
              const habis = !isPreorder && stockValue <= 0;
              const stokMenipis = !habis && !isPreorder && stockValue <= 5;

              // Determine stock indicator styling + label
              const stock = isPreorder
                ? { label: t("product.preorder"), cls: "border-amber-400/40 bg-amber-500/10 text-amber-300", dot: "bg-amber-400" }
                : habis
                ? { label: t("product.out_of_stock"), cls: "border-rose-400/40 bg-rose-500/10 text-rose-300", dot: "bg-rose-400" }
                : stokMenipis
                ? { label: t("product.low_stock"), cls: "border-orange-400/40 bg-orange-500/10 text-orange-300", dot: "bg-orange-400" }
                : { label: t("product.in_stock"), cls: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300", dot: "bg-emerald-400" };

              return (
                <div
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/50 shadow-[0_0_25px_rgba(2,6,23,0.6)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                >
                  {/* Image box */}
                  <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-slate-950/70">
                    {/* Code badge */}
                    <span className="absolute left-3 top-3 z-10 rounded-md border border-cyan-500/30 bg-slate-950/80 px-2 py-1 font-mono text-[10px] font-bold text-cyan-300 backdrop-blur-md">
                      {t("product.code")}: {code}
                    </span>
                    {/* Stock indicator */}
                    <span
                      className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold backdrop-blur-md ${stock.cls}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${stock.dot}`} />
                      {stock.label}
                    </span>

                    {imageUrl ? (
                      isVideo ? (
                        <div
                          className={`flex h-full w-full items-center justify-center bg-black text-xs font-bold text-cyan-300 ${
                            habis ? "opacity-50 grayscale" : ""
                          }`}
                        >
                          ▶ Video Preview
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={product.name || product.nama_produk || "Product image"}
                          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                            habis ? "opacity-50 grayscale" : ""
                          }`}
                        />
                      )
                    ) : (
                      <span className="text-xs text-slate-600">No image</span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                    <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-100">
                      {product.name || product.nama_produk}
                    </h2>
                    <div className="mt-auto space-y-3">
                      <p className="text-lg font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]">
                        {formatRupiah(Number(product.price || product.harga || 0))}
                      </p>
                      <Link
                        href={`/produk/${product.id}`}
                        aria-disabled={habis}
                        className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                          habis
                            ? "pointer-events-none cursor-not-allowed border border-slate-700 bg-slate-800/60 text-slate-500"
                            : "border border-cyan-400/50 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25 hover:shadow-[0_0_18px_rgba(34,211,238,0.4)]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {habis ? "notifications" : "shopping_cart_checkout"}
                        </span>
                        {habis ? t("product.out_of_stock") : t("product.buy")}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
