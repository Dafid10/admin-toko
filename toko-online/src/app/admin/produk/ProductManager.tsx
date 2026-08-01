"use client";

import { useEffect, useState } from "react";

// ... (Type definitions tetap sama) ...
type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  imageUrl: string | null;
  category: { id: string; name: string };
};

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false); // Baru: state untuk loading simpan

  const [newProduct, setNewProduct] = useState({
    name: "", sku: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "",
  });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
      setCategories(data.categories);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addCategory() {
    if (!newCategoryName.trim()) return;
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
    });
    setNewCategoryName("");
    load();
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); // Mulai loading

    const payload = {
        ...newProduct,
        price: Number(newProduct.price) || 0,
        stock: Number(newProduct.stock) || 0,
    };

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setNewProduct({ name: "", sku: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" });
      setShowForm(false);
      load();
    }
    setSaving(false); // Selesai loading
  }

  async function updateField(id: string, field: string, value: string | number | boolean) {
    // Optimistic update
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
  }

  // ... (fungsi deactivate & activate tetap sama) ...
  async function deactivate(id: string) {
    if (!confirm("Nonaktifkan produk?")) return;
    await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  async function activate(id: string) { await updateField(id, "isActive", true); load(); }

  // ... (fungsi syncStock & importFromSheet tetap sama) ...
  async function syncStock() { setSyncing(true); try { const res = await fetch("/api/admin/sync-stock", { method: "POST" }); const data = await res.json(); if (!res.ok) throw new Error(data.error); setSyncMessage(`✓ Berhasil: ${data.diperbarui} produk.`); load(); } catch(e:any) { setSyncMessage(`✗ Gagal: ${e.message}`); } finally { setSyncing(false); } }
  
  async function importFromSheet() { setImporting(true); try { const res = await fetch("/api/admin/import-from-sheet", { method: "POST" }); const data = await res.json(); if (!res.ok) throw new Error(data.error); setSyncMessage(data.message); load(); } catch(e:any) { setSyncMessage(`✗ Gagal: ${e.message}`); } finally { setImporting(false); } }

  if (loading) return <p>Memuat...</p>;

  return (
    <div>
      {/* Container Sinkronisasi (tetap) */}
      <div className="card p-5 mb-stack-lg">
         {/* ... konten sync sama seperti sebelumnya ... */}
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
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Tambah Produk</button>
      </div>

      {/* MODAL POPOUP */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="card w-full max-w-2xl p-6 bg-white shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Tambah Produk Baru</h3>
                    <button onClick={() => setShowForm(false)} className="text-ink-muted hover:text-ink">Tutup</button>
                </div>
                <form onSubmit={addProduct} className="grid md:grid-cols-2 gap-4">
                    <input required placeholder="Nama produk" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="border rounded-lg px-3 py-2" />
                    <input placeholder="SKU/Kode" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} className="border rounded-lg px-3 py-2" />
                    <select required value={newProduct.categoryId} onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })} className="border rounded-lg px-3 py-2">
                        <option value="">Pilih kategori</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="number" required placeholder="Harga (Rp)" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="border rounded-lg px-3 py-2" />
                    <input type="number" required placeholder="Stok" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} className="border rounded-lg px-3 py-2 md:col-span-2" />
                    <textarea required placeholder="Deskripsi" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="border rounded-lg px-3 py-2 md:col-span-2" rows={3} />
                    
                    <button type="submit" disabled={saving} className="btn-primary md:col-span-2 py-3">
                        {saving ? "Menyimpan Produk..." : "Simpan Produk"}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary md:col-span-2 py-2">
                        Batal
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* ... (Tabel tetap sama) ... */}
    </div>
  );
}