"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

type Category = { id: string; name: string };
type ProductMedia = {
  url: string;
  type: string;
  isPrimary?: boolean;
};

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    categoryId: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    stockStatus: "READY",
    indentDays: "",
    variants: [] as { name: string; price: string; stock: string; sku: string }[],
    wholesale: [] as { minQuantity: string; price: string }[],
    media: [] as ProductMedia[],
  });

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from('category')
        .select('id, name')
        .order('name');
      
      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    }
    loadCategories();
  }, []);

  useEffect(() => {
    const currentMedia = product.media[selectedMediaIndex];
    if (currentMedia?.type === 'VIDEO' && videoRef.current) {
        videoRef.current.play().catch(err => console.log("Autoplay blocked:", err));
    } else if (videoRef.current) {
        videoRef.current.pause();
    }
  }, [selectedMediaIndex, product.media]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('product-media')
          .upload(fileName, file);

        if (error) throw new Error("Gagal upload " + file.name + ": " + error.message);

        const { data: urlData } = supabase.storage
          .from('product-media')
          .getPublicUrl(fileName);

        return {
            url: urlData.publicUrl,
            type: file.type.startsWith('video') ? 'VIDEO' : 'IMAGE'
        };
    });

    try {
        const results = await Promise.all(uploadPromises);
        setProduct(prev => {
            const updatedMedia = [...prev.media];
            results.forEach(res => {
                const isFirst = updatedMedia.length === 0;
                updatedMedia.push({
                    url: res.url,
                    type: res.type,
                    isPrimary: isFirst && res.type === 'IMAGE'
                });
            });
            return { ...prev, media: updatedMedia };
        });
    } catch (err: any) {
        alert(err.message);
    } finally {
        setUploading(false);
        e.target.value = "";
    }
  }

  function moveMedia(index: number, direction: 'up' | 'down') {
    const newMedia = [...product.media];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newMedia.length) return;
    
    const temp = newMedia[index];
    newMedia[index] = newMedia[targetIndex];
    newMedia[targetIndex] = temp;
    setProduct({ ...product, media: newMedia });
  }

  function setPrimaryMedia(index: number) {
    const newMedia = product.media.map((m, i) => ({
        ...m,
        isPrimary: i === index
    }));
    setProduct({ ...product, media: newMedia });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const hasImage = product.media.some(m => m.type === 'IMAGE');
    if (!hasImage) {
        alert("Paling tidak harus ada 1 gambar produk.");
        setSaving(false);
        return;
    }

    let primaryImage = product.media.find(m => m.isPrimary && m.type === 'IMAGE')?.url;
    if (!primaryImage) {
        primaryImage = product.media.find(m => m.type === 'IMAGE')?.url;
    }

    const payload = {
        ...product,
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        imageUrl: primaryImage || "",
    };

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (res.ok) {
      router.push("/admin/produk");
      router.refresh();
    } else {
        const err = await res.json();
        alert("Gagal menyimpan: " + (err.error || "Terjadi kesalahan"));
    }
    setSaving(false);
  }

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/produk" className="text-blue-600 hover:underline text-sm mb-2 block">← Kembali ke Daftar Produk</Link>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Produk Baru</h1>
        </div>
        <button 
          form="product-form"
          type="submit" 
          disabled={saving} 
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-blue-300 shadow-lg transition-all"
        >
          {saving ? "Menyimpan..." : "Simpan Produk"}
        </button>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Card 1: Informasi Utama */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
            Informasi Produk
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Nama Produk *</label>
              <input 
                required 
                type="text"
                placeholder="Contoh: Sepatu Lari Pro X1" 
                value={product.name} 
                onChange={(e) => setProduct({ ...product, name: e.target.value })} 
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">SKU / Kode Produk</label>
              <input 
                type="text"
                placeholder="Contoh: SPR-001" 
                value={product.sku} 
                onChange={(e) => setProduct({ ...product, sku: e.target.value })} 
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Kategori *</label>
              <select 
                required 
                value={product.categoryId} 
                onChange={(e) => setProduct({ ...product, categoryId: e.target.value })} 
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none bg-no-repeat bg-[right_1rem_center]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='Length19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1.5em' }}
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Harga Jual (Rp) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Rp</span>
                <input 
                  required 
                  type="number"
                  placeholder="0" 
                  value={product.price} 
                  onChange={(e) => setProduct({ ...product, price: e.target.value })} 
                  className="w-full border border-gray-200 rounded-xl p-3 pl-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Stok Tersedia *</label>
              <input 
                required 
                type="number"
                placeholder="0" 
                value={product.stock} 
                onChange={(e) => setProduct({ ...product, stock: e.target.value })} 
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Card 2: Pengiriman & Dimensi */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-green-100 text-green-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
            Logistik & Dimensi
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Berat Produk (Gram)</label>
              <div className="relative">
                <input 
                  type="number"
                  placeholder="Contoh: 1000" 
                  value={product.weight} 
                  onChange={(e) => setProduct({ ...product, weight: e.target.value })} 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">gram</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">Gunakan berat setelah packing untuk akurasi ongkir.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 mb-1">
                <label className="block text-sm font-semibold text-gray-700">Dimensi Paket (cm)</label>
              </div>
              <div>
                <input 
                  type="number"
                  placeholder="P" 
                  value={product.length} 
                  onChange={(e) => setProduct({ ...product, length: e.target.value })} 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                />
              </div>
              <div>
                <input 
                  type="number"
                  placeholder="L" 
                  value={product.width} 
                  onChange={(e) => setProduct({ ...product, width: e.target.value })} 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                />
              </div>
              <div>
                <input 
                  type="number"
                  placeholder="T" 
                  value={product.height} 
                  onChange={(e) => setProduct({ ...product, height: e.target.value })} 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Deskripsi Lengkap */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
            Deskripsi Produk
          </h2>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Detail Produk *</label>
            <textarea 
              required 
              rows={12} 
              placeholder="Jelaskan fitur, keunggulan, bahan, dan cara penggunaan produk secara detail agar pembeli yakin..." 
              value={product.description} 
              onChange={(e) => setProduct({ ...product, description: e.target.value })} 
              className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all leading-relaxed" 
            />
          </div>
        </div>

        {/* Card 4: Media */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">4</span>
            Media (Gambar / Video)
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <label className="group cursor-pointer block">
                <div className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all ${uploading ? 'bg-gray-50 border-gray-300' : 'hover:bg-blue-50 hover:border-blue-300 border-gray-200'}`}>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {uploading ? "⏳" : "📂"}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm text-gray-700">{uploading ? "Mengunggah..." : "Tambah Media"}</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, atau MP4</p>
                  </div>
                  <input 
                      type="file" 
                      className="hidden" 
                      multiple
                      onChange={handleFileSelect}
                      disabled={uploading}
                  />
                </div>
              </label>
            </div>

            <div className="md:col-span-2">
              <div className="bg-gray-50 rounded-2xl p-4 min-h-[200px]">
                {product.media.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">
                    Belum ada media yang diunggah
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {product.media.map((m, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedMediaIndex(i)}
                        className={`relative group aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${i === selectedMediaIndex ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent hover:border-gray-300'}`}
                      >
                        {m.type === 'IMAGE' ? (
                          <img src={m.url} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <div className="w-full h-full bg-black flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">VIDEO</span>
                            <span className="absolute inset-0 flex items-center justify-center bg-black/20">▶️</span>
                          </div>
                        )}
                        
                        <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={(e) => { e.stopPropagation(); setProduct({...product, media: product.media.filter((_, idx) => idx !== i)}); if(selectedMediaIndex === i) setSelectedMediaIndex(0); }} className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600">×</button>
                        </div>

                        {m.isPrimary && (
                          <div className="absolute bottom-0 inset-x-0 bg-blue-600 text-white text-[10px] py-1 text-center font-bold">UTAMA</div>
                        )}
                        {!m.isPrimary && m.type === 'IMAGE' && (
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); setPrimaryMedia(i); }} 
                            className="absolute bottom-1 inset-x-1 bg-white/90 text-gray-700 text-[10px] py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                          >
                            Set Utama
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {product.media.length > 0 && (
                <div className="mt-4 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
                  <span className="text-blue-600">💡</span>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <b>Tips:</b> Media pertama atau yang ditandai "Utama" akan menjadi cover produk di halaman toko. Anda dapat mengunggah hingga 10 media sekaligus.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 5: Varian & Grosir */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">5</span>
            Varian & Harga Grosir
          </h2>
          
          <div className="space-y-8">
            {/* Varian */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800">Varian Produk</h3>
                  <p className="text-xs text-gray-500">Contoh: Warna, Ukuran, atau Model</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setProduct({...product, variants: [...product.variants, {name: '', price: '', stock: '', sku: ''}]})} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  + Tambah Varian
                </button>
              </div>

              {product.variants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-gray-400 text-[10px] uppercase tracking-wider">
                        <th className="px-4 py-2 font-medium">Nama Varian</th>
                        <th className="px-4 py-2 font-medium">Harga (Optional)</th>
                        <th className="px-4 py-2 font-medium">Stok</th>
                        <th className="px-4 py-2 font-medium">SKU</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((v, i) => (
                        <tr key={i} className="bg-gray-50 rounded-xl overflow-hidden">
                          <td className="px-4 py-3 first:rounded-l-xl">
                            <input placeholder="e.g. Merah" value={v.name} onChange={(e) => { const vrs = [...product.variants]; vrs[i].name = e.target.value; setProduct({...product, variants: vrs}); }} className="w-full bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none p-1 text-sm" />
                          </td>
                          <td className="px-4 py-3">
                            <input type="number" placeholder="Default" value={v.price} onChange={(e) => { const vrs = [...product.variants]; vrs[i].price = e.target.value; setProduct({...product, variants: vrs}); }} className="w-full bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none p-1 text-sm" />
                          </td>
                          <td className="px-4 py-3">
                            <input type="number" placeholder="0" value={v.stock} onChange={(e) => { const vrs = [...product.variants]; vrs[i].stock = e.target.value; setProduct({...product, variants: vrs}); }} className="w-full bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none p-1 text-sm" />
                          </td>
                          <td className="px-4 py-3">
                            <input placeholder="SKU-VAR" value={v.sku} onChange={(e) => { const vrs = [...product.variants]; vrs[i].sku = e.target.value; setProduct({...product, variants: vrs}); }} className="w-full bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none p-1 text-sm" />
                          </td>
                          <td className="px-4 py-3 last:rounded-r-xl text-right">
                            <button type="button" onClick={() => setProduct({...product, variants: product.variants.filter((_, idx) => idx !== i)})} className="text-red-400 hover:text-red-600 font-bold">🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200">
                  Produk ini tidak memiliki varian.
                </div>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Grosir */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800">Harga Grosir</h3>
                  <p className="text-xs text-gray-500">Berikan harga lebih murah untuk pembelian banyak</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setProduct({...product, wholesale: [...product.wholesale, {minQuantity: '', price: ''}]})} 
                  className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  + Tambah Tier Grosir
                </button>
              </div>

              {product.wholesale.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {product.wholesale.map((w, i) => (
                    <div key={i} className="flex gap-3 items-center bg-orange-50/50 p-4 rounded-xl border border-orange-100 relative group">
                      <div className="flex-1">
                        <label className="block text-[10px] text-orange-600 font-bold uppercase mb-1">Min. Beli</label>
                        <input type="number" placeholder="Qty" value={w.minQuantity} onChange={(e) => { const ws = [...product.wholesale]; ws[i].minQuantity = e.target.value; setProduct({...product, wholesale: ws}); }} className="w-full bg-transparent border-b border-orange-200 focus:border-orange-500 outline-none p-1 text-sm font-bold" />
                      </div>
                      <div className="flex-[2]">
                        <label className="block text-[10px] text-orange-600 font-bold uppercase mb-1">Harga Satuan (Rp)</label>
                        <input type="number" placeholder="Rp" value={w.price} onChange={(e) => { const ws = [...product.wholesale]; ws[i].price = e.target.value; setProduct({...product, wholesale: ws}); }} className="w-full bg-transparent border-b border-orange-200 focus:border-orange-500 outline-none p-1 text-sm font-bold" />
                      </div>
                      <button type="button" onClick={() => setProduct({...product, wholesale: product.wholesale.filter((_, idx) => idx !== i)})} className="text-orange-300 hover:text-red-500 transition-colors">🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 z-40 md:left-64">
           <div className="max-w-5xl mx-auto flex gap-4">
              <Link href="/admin/produk" className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 text-center transition-colors">
                Batal
              </Link>
              <button 
                type="submit" 
                disabled={saving} 
                className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-blue-300 shadow-lg shadow-blue-200 transition-all"
              >
                {saving ? "⏳ Sedang Menyimpan..." : "✅ Simpan & Publikasikan"}
              </button>
           </div>
        </div>
      </form>
    </div>
  );
}
