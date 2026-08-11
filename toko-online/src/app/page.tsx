"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Mengambil data produk beserta relasi ke tabel ProductMedia
      const { data, error } = await supabase
        .from("Product")
        .select("*, ProductMedia(*)");

      if (error) {
        console.error("Error:", error.message);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white shadow-sm rounded-xl p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Katalog Produk</h2>
          <Link href="/keranjang" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
            🛒 Keranjang
          </Link>
        </div>

        {/* List Produk */}
        {loading ? (
          <p className="text-center py-12 text-gray-500">Memuat produk...</p>
        ) : products.length === 0 ? (
          <p className="text-center py-12 text-gray-500 bg-white rounded-xl border">Belum ada produk.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((p) => {
              // Mengambil gambar dari tabel relasi ProductMedia atau kolom langsung
              const mediaItem = p.ProductMedia?.[0] || p.product_media?.[0];
              const imageUrl = 
                p.image || 
                p.image_url || 
                p.imageUrl || 
                p.foto || 
                p.img || 
                mediaItem?.url || 
                mediaItem?.image || 
                mediaItem?.file_url || 
                mediaItem?.path || "";

              return (
                <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <Link href={`/produk/${p.id}`}>
                    <div className="h-44 w-full bg-gray-100 rounded-xl mb-4 overflow-hidden border flex items-center justify-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt={p.name || p.nama_produk} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-xs">Tidak Ada Foto</span>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 text-base mb-1">{p.name || p.nama_produk}</h4>
                    <p className="font-bold text-blue-600 text-base mt-2">
                      Rp {Number(p.price || p.harga || 0).toLocaleString("id-ID")}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}