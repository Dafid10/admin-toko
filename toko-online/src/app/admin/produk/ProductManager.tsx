"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

type Category = { id: string; name: string };
type ProductMedia = {
  url: string;
  type: string;
};

type Product = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  stockStatus: string;
  indentDays?: number | null;
  isActive: boolean;
  imageUrl: string | null;
  category: { id: string; name: string };
  variants?: { id?: string; name: string; price?: number | null; stock: number; sku?: string | null }[];
  wholesale?: { id?: string; minQuantity: number; price: number }[];
  media?: ProductMedia[];
};

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "", sku: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "",
    weight: "", length: "", width: "", height: "",
    stockStatus: "READY", indentDays: "",
    variants: [] as { name: string; price: string; stock: string; sku: string }[],
    wholesale: [] as { minQuantity: string; price: string }[],
    media: [] as { url: string; type: string; isPrimary?: boolean }[],
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const [bulkInput, setBulkInput] = useState("");
  const [isBulk, setIsBulk] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const supabase = createClient();

  async function load() {
    const res = await fetch("/api/admin/products", { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
      setCategories(data.categories);
    }
    setLoading(false);
  }

  useEffect(() => {
    // Autoplay video when selected in preview
    const currentMedia = newProduct.media[selectedMediaIndex];
    if (currentMedia?.type === 'VIDEO' && videoRef.current) {
        videoRef.current.play().catch(err => console.log("Autoplay blocked:", err));
    } else if (videoRef.current) {
        videoRef.current.pause();
    }
  }, [selectedMediaIndex, newProduct.media, showForm]);

  useEffect(() => {
    load();
    // Ambil kategori langsung dari Supabase untuk memastikan sinkronisasi
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('category')
        .select('id, name')
        .order('name');
      
      if (!error && data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('product-media')
          .upload(fileName, file);

        if (error) {
          throw new Error("Gagal upload " + file.name + ": " + error.message);
        }

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
        
        setNewProduct(prev => {
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

  async function addCategory() {
    if (!newCategoryName.trim()) return;
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
      credentials: 'include'
    });
    setNewCategoryName("");
    load();
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    
    setSaving(true);

    if (isBulk) {
        try {
            const lines = bulkInput.split("\n").filter(l => l.trim());
            const productsToSave = lines.map(line => {
                const parts = line.split("\t");
                const [name, price, stock, categoryId, sku, description, imageUrl] = parts;
                if (!name || !price || !categoryId) throw new Error("Format salah. Pastikan Nama, Harga, dan Kategori ID terisi.");
                return {
                    name: name.trim(),
                    price: Number(price.trim()),
                    stock: Number(stock?.trim() || 0),
                    categoryId: categoryId.trim(),
                    sku: sku?.trim() || null,
                    description: description?.trim() || "",
                    imageUrl: imageUrl?.trim() || null,
                    media: imageUrl ? [{ url: imageUrl.trim(), type: 'IMAGE', order: 0 }] : []
                };
            });

            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isBulk: true, products: productsToSave }),
                credentials: 'include'
            });

            if (res.ok) {
                setBulkInput("");
                setIsBulk(false);
                setShowForm(false);
                load();
            } else {
                const err = await res.json();
                alert("Gagal simpan massal: " + (err.error || "Cek format data"));
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
        return;
    }

    const hasImage = newProduct.media.some(m => m.type === 'IMAGE');
    if (!hasImage) {
        alert("Paling tidak harus ada 1 gambar produk.");
        setSaving(false);
        return;
    }

    let primaryImage = newProduct.media.find(m => m.isPrimary && m.type === 'IMAGE')?.url;
    if (!primaryImage) {
        primaryImage = newProduct.media.find(m => m.type === 'IMAGE')?.url;
    }

    const payload = {
        ...newProduct,
        id: editingProduct?.id,
        price: Number(newProduct.price) || 0,
        stock: Number(newProduct.stock) || 0,
        imageUrl: primaryImage || "",
    };

    const method = editingProduct ? "PATCH" : "POST";
    const res = await fetch("/api/admin/products", {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (res.ok) {
      setNewProduct({ name: "", sku: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "", weight: "", length: "", width: "", height: "", stockStatus: "READY", indentDays: "", variants: [], wholesale: [], media: [] });
      setShowForm(false);
      setEditingProduct(null);
      load();
    } else {
        const err = await res.json();
        alert("Gagal menyimpan: " + (err.error || "Terjadi kesalahan"));
    }
    setSaving(false);
  }

  function moveMedia(index: number, direction: 'up' | 'down') {
    const newMedia = [...newProduct.media];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newMedia.length) return;
    
    const temp = newMedia[index];
    newMedia[index] = newMedia[targetIndex];
    newMedia[targetIndex] = temp;
    
    setNewProduct({ ...newProduct, media: newMedia });
  }

  function setPrimaryMedia(index: number) {
    const newMedia = newProduct.media.map((m, i) => ({
        ...m,
        isPrimary: i === index
    }));
    setNewProduct({ ...newProduct, media: newMedia });
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    // Langsung set data awal dari baris tabel (minimal)
    setNewProduct({
      name: product.name || "",
      sku: product.sku || "",
      description: "", // Sementara kosong, akan diupdate dari fetch
      price: String(product.price ?? "0"),
      stock: String(product.stock ?? "0"),
      weight: String(product.weight ?? ""),
      length: String(product.length ?? ""),
      width: String(product.width ?? ""),
      height: String(product.height ?? ""),
      stockStatus: product.stockStatus || "READY",
      indentDays: String(product.indentDays ?? ""),
      imageUrl: product.imageUrl || "",
      categoryId: product.category?.id || "",
      variants: product.variants?.map(v => ({
        name: v.name,
        price: String(v.price ?? ""),
        stock: String(v.stock),
        sku: v.sku || ""
      })) || [],
      wholesale: product.wholesale?.map(w => ({
        minQuantity: String(w.minQuantity),
        price: String(w.price)
      })) || [],
      media: product.media?.map((m: any) => ({ 
        ...m, 
        isPrimary: m.url === product.imageUrl 
      })) || []
    });
    setShowForm(true);

    // Fetch detail lengkap (termasuk deskripsi dan media yang urut)
    fetch(`/api/admin/products/${product.id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setNewProduct({
          name: data.name || "",
          sku: data.sku || "",
          description: data.description || "",
          price: String(data.price ?? "0"),
          stock: String(data.stock ?? "0"),
          weight: String(data.weight ?? ""),
          length: String(data.length ?? ""),
          width: String(data.width ?? ""),
          height: String(data.height ?? ""),
          stockStatus: data.stockStatus || "READY",
          indentDays: String(data.indentDays ?? ""),
          imageUrl: data.imageUrl || "",
          categoryId: data.categoryId || "",
          variants: data.variants?.map((v: any) => ({
            name: v.name,
            price: String(v.price ?? ""),
            stock: String(v.stock),
            sku: v.sku || ""
          })) || [],
          wholesale: data.wholesale?.map((w: any) => ({
            minQuantity: String(w.minQuantity),
            price: String(w.price)
          })) || [],
          media: data.media?.map((m: any) => ({
            ...m,
            isPrimary: m.url === data.imageUrl
          })) || []
        });
      })
      .catch(err => {
        console.error("Gagal mengambil detail produk:", err);
      });
  }

  async function updateField(id: string, field: string, value: string | number | boolean) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
      credentials: 'include'
    });
  }

  async function deactivate(id: string) {
    if (!confirm("Nonaktifkan produk?")) return;
    await fetch("/api/admin/products", { 
      method: "DELETE", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ id }),
      credentials: 'include'
    });
    load();
  }

  async function activate(id: string) { await updateField(id, "isActive", true); load(); }

  async function deletePermanently(id: string) {
    if (!confirm("Hapus produk permanen? Tindakan ini tidak dapat dibatalkan.")) return;
    const res = await fetch("/api/admin/products/delete-permanent", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        credentials: 'include'
    });
    if (res.ok) load();
    else alert("Gagal menghapus produk.");
  }

  async function syncStock() { setSyncing(true); try { const res = await fetch("/api/admin/sync-stock", { method: "POST", credentials: 'include' }); const data = await res.json(); if (!res.ok) throw new Error(data.error); setSyncMessage(`✓ Berhasil: ${data.diperbarui} produk.`); load(); } catch(e:any) { setSyncMessage(`✗ Gagal: ${e.message}`); } finally { setSyncing(false); } }
  async function importFromSheet() { setImporting(true); try { const res = await fetch("/api/admin/import-from-sheet", { method: "POST", credentials: 'include' }); const data = await res.json(); if (!res.ok) throw new Error(data.error); setSyncMessage(data.message); load(); } catch(e:any) { setSyncMessage(`✗ Gagal: ${e.message}`); } finally { setImporting(false); } }

  if (loading) return <p>Memuat...</p>;

  return (
    <div>
      <div className="card p-5 mb-stack-lg">
         <h2 className="text-label-md text-ink mb-1">Sinkronisasi Google Sheet</h2>
         <div className="flex gap-2">
            <button onClick={syncStock} disabled={syncing} className="btn-primary flex items-center gap-2">
                {syncing ? "Sinkronisasi..." : "Sinkron Stok Sekarang"}
            </button>
            <button onClick={importFromSheet} disabled={importing} className="btn-secondary">
                {importing ? "Mengimpor..." : "Impor Produk dari Sheet"}
            </button>
         </div>
         {syncMessage && <p className="mt-4 text-body-sm">{syncMessage}</p>}
      </div>

      <div className="flex items-center justify-between mb-stack-lg">
        <h2 className="text-headline-sm">Daftar Produk</h2>
        <div className="flex gap-2">
            {!editingProduct && (
                <button 
                    type="button" 
                    onClick={() => setIsBulk(!isBulk)} 
                    className="text-sm text-primary font-medium underline"
                >
                    {isBulk ? "Mode Satuan" : "Mode Massal (Excel/TSV)"}
                </button>
            )}
            <Link href="/admin/products/new" className="btn-primary">+ Tambah Produk</Link>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="card w-full max-w-2xl p-6 bg-white shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</h3>
                    <div className="flex gap-4 items-center">
                        <button onClick={() => { setShowForm(false); setEditingProduct(null); setIsBulk(false); }} className="text-ink-muted hover:text-ink">Tutup</button>
                    </div>
                </div>

                <form onSubmit={addProduct} className="grid md:grid-cols-2 gap-4">
                    {isBulk ? (
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-label-sm block">Data Massal (Copy-Paste dari Excel/Sheet)</label>
                            <p className="text-[10px] text-ink-muted">Format kolom: Nama [TAB] Harga [TAB] Stok [TAB] CategoryID [TAB] SKU [TAB] Deskripsi [TAB] ImageURL</p>
                            <textarea 
                                className="w-full border rounded-lg px-3 py-2 font-mono text-xs" 
                                rows={10} 
                                placeholder="Produk A	10000	50	cuid-kategori-1	SKU-A	Deskripsi A	https://image.com/a.jpg"
                                value={bulkInput}
                                onChange={(e) => setBulkInput(e.target.value)}
                                required
                            />
                        </div>
                    ) : (
                        <div className="md:col-span-2 p-8 text-center bg-gray-50 rounded-xl border border-dashed">
                             <p className="text-ink-muted mb-4">Untuk menambah produk satuan, silakan gunakan halaman penuh agar lebih nyaman.</p>
                             <Link href="/admin/products/new" className="btn-primary inline-block">Buka Halaman Tambah Produk</Link>
                        </div>
                    )}

                    <div className="md:col-span-2 pt-4 flex gap-3">
                        <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); setIsBulk(false); }} className="btn-secondary flex-1 py-3">
                            Batal
                        </button>
                        {isBulk && (
                            <button type="submit" disabled={saving} className="btn-primary flex-[2] py-3 shadow-lg">
                                {saving ? "Menyimpan..." : "Upload Massal"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 text-label-sm">Produk</th>
              <th className="p-3 text-label-sm">Kategori</th>
              <th className="p-3 text-label-sm">Harga</th>
              <th className="p-3 text-label-sm">Stok</th>
              <th className="p-3 text-label-sm">Status</th>
              <th className="p-3 text-label-sm">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={p.imageUrl || "/placeholder.png"} className="w-10 h-10 object-cover rounded border" />
                    <div>
                      <div className="font-bold text-ink">{p.name}</div>
                      <div className="text-[10px] text-ink-muted">SKU: {p.sku || "-"}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-body-sm">{p.category.name}</td>
                <td className="p-3 text-body-sm font-medium">Rp {p.price.toLocaleString()}</td>
                <td className="p-3 text-body-sm">{p.stock}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.isActive ? "AKTIF" : "NONAKTIF"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-2 hover:bg-blue-50 text-blue-600 rounded" title="Edit">✏️</button>
                    {p.isActive ? (
                      <button onClick={() => deactivate(p.id)} className="p-2 hover:bg-orange-50 text-orange-600 rounded" title="Nonaktifkan">🚫</button>
                    ) : (
                      <button onClick={() => activate(p.id)} className="p-2 hover:bg-green-50 text-green-600 rounded" title="Aktifkan">✅</button>
                    )}
                    <button onClick={() => deletePermanently(p.id)} className="p-2 hover:bg-red-50 text-red-600 rounded" title="Hapus Permanen">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
