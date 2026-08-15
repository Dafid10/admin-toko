"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useCart } from "@/context/CartContext";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
// Guard: avoid "supabaseUrl is required" crash when env vars are missing.
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function DetailProduk() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!id) return;

    async function fetchDetail() {
      setLoading(true);
      if (!supabase) {
        console.warn("[v0] Supabase env vars are not set; skipping product fetch.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("Product")
        .select("*, ProductMedia(*)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error:", error.message);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat detail produk...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-600 font-medium">Produk tidak ditemukan.</p>
        <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const mediaList = product.ProductMedia || [];
  const fallbackImage = product.image || product.image_url || "";
  
  const hasMedia = mediaList.length > 0;
  const currentMedia = hasMedia ? mediaList[currentIndex] : null;
  const currentUrl = currentMedia ? (currentMedia.url || currentMedia.image || currentMedia.file_url || currentMedia.path || "") : fallbackImage;
  const isVideo = currentUrl.endsWith(".mp4") || currentUrl.includes("video") || currentMedia?.type === "video";

  // Hitung status stok
  const stockValue = Number(product.stock !== undefined ? product.stock : (product.stok !== undefined ? product.stok : 0));
  const isOutOfStock = stockValue <= 0;

  const handlePrev = () => {
    if (mediaList.length > 0) {
      setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
    }
  };

  const handleNext = () => {
    if (mediaList.length > 0) {
      setCurrentIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
    }
  };

  // Fungsi saat tombol "Tambah ke Keranjang" diklik
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      name: product.name || product.nama_produk,
      price: Number(product.price || product.harga || 0),
      imageUrl: currentUrl,
      stock: stockValue,
    });
    alert("Produk berhasil ditambahkan ke keranjang!");
  };

  // Fungsi saat tombol "Beli Sekarang" diklik
  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      name: product.name || product.nama_produk,
      price: Number(product.price || product.harga || 0),
      imageUrl: currentUrl,
      stock: stockValue,
    }, 1);
    router.push("/keranjang");
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline text-sm">
            ← Kembali ke Katalog
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Kolom Galeri Utama dengan Navigasi & Thumbnail */}
          <div className="space-y-4">
            <div className="relative h-80 w-full bg-gray-100 rounded-xl overflow-hidden border flex items-center justify-center shadow-sm group">
              {currentUrl ? (
                isVideo ? (
                  <video 
                    key={currentUrl} 
                    src={currentUrl} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <img src={currentUrl} alt={product.name || product.nama_produk} className="w-full h-full object-cover" />
                )
              ) : (
                <span className="text-gray-400 text-sm">Tidak Ada Foto / Video</span>
              )}

              {/* Tombol Navigasi Kiri & Kanan */}
              {mediaList.length > 1 && (
                <>
                  <button 
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/70 transition opacity-80 group-hover:opacity-100 text-lg font-bold"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <button 
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/70 transition opacity-80 group-hover:opacity-100 text-lg font-bold"
                    aria-label="Next"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Pilihan di Bawah */}
            {mediaList.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {mediaList.map((media: any, idx: number) => {
                  const thumbUrl = media.url || media.image || media.file_url || media.path || "";
                  const isThumbVideo = thumbUrl.endsWith(".mp4") || thumbUrl.includes("video") || media.type === "video";
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${currentIndex === idx ? 'border-blue-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      {isThumbVideo ? (
                        <div className="w-full h-full bg-black flex items-center justify-center text-white text-xs font-bold">▶ Video</div>
                      ) : (
                        <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Informasi Produk */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {product.name || product.nama_produk}
                </h1>
                {isOutOfStock && (
                  <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0">
                    Stok Habis
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs mb-4">
                Kategori: {product.category || product.kategori || "Container & Box Penyimpanan"}
              </p>
              <p className="text-2xl font-bold text-blue-600 mb-4">
                Rp {Number(product.price || product.harga || 0).toLocaleString("id-ID")}
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {product.description || product.deskripsi || "Belum ada deskripsi untuk produk ini."}
              </p>
              <p className="text-gray-500 text-xs">
                Stok Tersedia: <strong className={isOutOfStock ? "text-red-600" : "text-gray-800"}>{stockValue}</strong>
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 rounded-xl font-medium transition text-sm ${
                  isOutOfStock 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isOutOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`flex-1 py-3 rounded-xl font-medium transition text-sm ${
                  isOutOfStock 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
