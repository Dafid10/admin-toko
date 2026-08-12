"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("Product")
        .select("*, ProductMedia(*), category:Category(name)");

      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const name = p.name || p.nama_produk || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Kotak Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Katalog Toko Online</h1>
            <p className="text-gray-500 text-sm mt-1">Temukan berbagai produk industri dan kebutuhan Anda di sini.</p>
          </div>
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Daftar Produk (Grid) */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Memuat produk...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-200 shadow-sm">
            Produk tidak ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const mediaList = product.ProductMedia || [];
              const fallbackImage = product.image || product.image_url || "";
              const primaryMedia = mediaList.find((m: any) => m.is_primary) || mediaList[0];
              const imageUrl = primaryMedia ? (primaryMedia.url || primaryMedia.image || primaryMedia.file_url || primaryMedia.path || "") : fallbackImage;
              const isVideo = imageUrl.endsWith(".mp4") || imageUrl.includes("video") || primaryMedia?.type === "video";

              // Logika Stok & Pre-Order
              const stockValue = Number(product.stock !== undefined ? product.stock : (product.stok !== undefined ? product.stok : 0));
              const isPreorder = Boolean(product.isPreorder || product.preorder);
              const habis = !isPreorder && stockValue <= 0;
              const stokMenipis = !habis && !isPreorder && stockValue <= 5;

              return (
                <Link
                  key={product.id}
                  href={`/produk/${product.id}`}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group relative"
                >
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                      isVideo ? (
                        <div className={`w-full h-full bg-black flex items-center justify-center text-white text-xs font-bold ${habis ? "grayscale opacity-70" : ""}`}>▶ Video Preview</div>
                      ) : (
                        <img src={imageUrl} alt={product.name || product.nama_produk} className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${habis ? "grayscale opacity-70" : ""}`} />
                      )
                    ) : (
                      <span className="text-gray-400 text-xs">Tanpa Gambar</span>
                    )}

                    {/* Badge / Label Status di Pojok Kiri Atas */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                      {habis && (
                        <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-md shadow-sm">
                          Stok Habis
                        </span>
                      )}
                      {isPreorder && (
                        <span className="px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-md shadow-sm">
                          Pre-Order
                        </span>
                      )}
                      {stokMenipis && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-md shadow-sm">
                          Sisa {stockValue}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                        {product.name || product.nama_produk}
                      </h2>
                      <p className="text-blue-600 font-bold text-sm">
                        Rp {Number(product.price || product.harga || 0).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <span className="mt-4 text-xs text-gray-500 group-hover:text-blue-600 font-medium">
                      Lihat Detail →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}