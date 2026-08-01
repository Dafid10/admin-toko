"use client";

import { useEffect, useState } from "react";

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

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    categoryId: "",
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

  useEffect(() => {
    load();
  }, []);

  async function addCategory() {
    if (!newCategoryName.trim()) return;
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
    });
    if (res.ok) {
      setNewCategoryName("");
      load();
    }
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newProduct.categoryId) {
      alert("Pilih kategori dulu (tambah kategori jika belum ada)");
      return;
    }
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    if (res.ok) {
      setNewProduct({ name: "", sku: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" });
      setShowForm(false);
      load();
    }
  }

  async function updateField(id: string, field: string, value: string | number | boolean) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
  }

  async function deactivate(id: string) {
    if (!confirm("Nonaktifkan produk ini? Produk tidak akan tampil di katalog lagi.")) return;
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function activate(id: string) {
    await updateField(id, "isActive", true);
    load();
  }

  async function syncStock() {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/admin/sync-stock", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSyncMessage(
        `✓ ${data.diperbarui} produk diperbarui dari sheet.` +
          (data.kodeTidakDitemukanDiSheet.length > 0
            ? ` Kode tidak ditemukan di sheet: ${data.kodeTidakDitemukanDiSheet.join(", ")}.`
            : "")
      );
      load();
    } catch (err: any) {
      setSyncMessage(`✗ Gagal sinkron: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  }

  async function importFromSheet() {
    setImporting(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/admin/import-from-sheet", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSyncMessage(data.message);
      load();
    } catch (err: any) {
      setSyncMessage(`✗ Gagal impor: ${err.message}`);
    } finally {
      setImporting(false);
    }
  }

  if (loading) return <p className="text-ink-muted">Memuat...</p>;

  return (
    <div>
      <div className="card p-5 mb-stack-lg">
        <h2 className="text-label-md text-ink mb-1">Sinkronisasi Google Sheet (MASTER_STOCK)</h2>
        <p className="text-body-sm text-ink-muted mb-stack-md">
          Stok di sheet adalah sumber utama. Sinkron akan menimpa angka stok produk yang SKU-nya cocok.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={syncStock} disabled={syncing} className="btn-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">sync</span>
            {syncing ? "Menyinkronkan..." : "Sinkron Stok Sekarang"}
          </button>
          <button onClick={importFromSheet} disabled={importing} className="btn-secondary flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            {importing ? "Mengimpor..." : "Impor Produk Baru dari Sheet"}
          </button>
        </div>
        {syncMessage && <p className="text-body-sm text-ink mt-stack-sm">{syncMessage}</p>}
      </div>

      <div className="flex gap-2 mb-stack-lg">
        <input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nama kategori baru"
          className="border border-outline-variant rounded-lg px-3 py-2 text-body-sm bg-surface-lowest"
        />
        <button onClick={addCategory} className="btn-secondary text-body-sm">
          + Tambah Kategori
        </button>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-body-sm ml-auto">
          {showForm ? "Batal" : "+ Tambah Produk"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addProduct} className="card p-5 mb-stack-lg grid md:grid-cols-2 gap-stack-md">
          <input
            required
            placeholder="Nama produk"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="border border-outline-variant rounded-lg px-3 py-2 bg-surface-lowest"
          />
          <input
            placeholder="SKU / Kode (samakan dengan MASTER_STOCK)"
            value={newProduct.sku}
            onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
            className="border border-outline-variant rounded-lg px-3 py-2 bg-surface-lowest font-mono"
          />
          <select
            required
            value={newProduct.categoryId}
            onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
            className="border border-outline-variant rounded-lg px-3 py-2 bg-surface-lowest"
          >
            <option value="">Pilih kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            required
            type="number"
            placeholder="Harga (Rp)"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            className="border border-outline-variant rounded-lg px-3 py-2 bg-surface-lowest"
          />
          <input
            required
            type="number"
            placeholder="Stok (kosongkan 0 kalau nanti disinkron dari sheet)"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            className="border border-outline-variant rounded-lg px-3 py-2 bg-surface-lowest md:col-span-2"
          />
          <input
            placeholder="URL foto produk (https://...)"
            value={newProduct.imageUrl}
            onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
            className="border border-outline-variant rounded-lg px-3 py-2 bg-surface-lowest md:col-span-2"
          />
          <textarea
            required
            placeholder="Deskripsi produk"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            className="border border-outline-variant rounded-lg px-3 py-2 bg-surface-lowest md:col-span-2"
            rows={3}
          />
          <button type="submit" className="btn-primary md:col-span-2">
            Simpan Produk
          </button>
        </form>
      )}

      <div className="bg-surface-lowest rounded-2xl border border-outline-variant shadow-card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-low border-b border-outline-variant">
              <th className="p-3 text-label-sm text-ink-muted uppercase tracking-wider">Produk</th>
              <th className="p-3 text-label-sm text-ink-muted uppercase tracking-wider">SKU</th>
              <th className="p-3 text-label-sm text-ink-muted uppercase tracking-wider">Kategori</th>
              <th className="p-3 text-label-sm text-ink-muted uppercase tracking-wider">Harga</th>
              <th className="p-3 text-label-sm text-ink-muted uppercase tracking-wider">Stok</th>
              <th className="p-3 text-label-sm text-ink-muted uppercase tracking-wider">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-3 text-body-sm text-ink">{p.name}</td>
                <td className="p-3">
                  <input
                    type="text"
                    defaultValue={p.sku ?? ""}
                    placeholder="—"
                    onBlur={(e) => updateField(p.id, "sku", e.target.value)}
                    className="w-32 border border-outline-variant rounded-md px-2 py-1 font-mono text-body-sm bg-surface-lowest"
                  />
                </td>
                <td className="p-3 text-ink-muted text-body-sm">{p.category.name}</td>
                <td className="p-3">
                  <input
                    type="number"
                    defaultValue={p.price}
                    onBlur={(e) => updateField(p.id, "price", Number(e.target.value))}
                    className="w-28 border border-outline-variant rounded-md px-2 py-1 bg-surface-lowest"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    defaultValue={p.stock}
                    onBlur={(e) => updateField(p.id, "stock", Number(e.target.value))}
                    className="w-20 border border-outline-variant rounded-md px-2 py-1 bg-surface-lowest"
                  />
                </td>
                <td className="p-3">
                  {p.isActive ? (
                    <span className="status-chip-lunas">Aktif</span>
                  ) : (
                    <span className="status-chip-neutral">Nonaktif</span>
                  )}
                </td>
                <td className="p-3">
                  {p.isActive ? (
                    <button onClick={() => deactivate(p.id)} className="text-danger text-label-sm hover:underline">
                      Nonaktifkan
                    </button>
                  ) : (
                    <button onClick={() => activate(p.id)} className="text-primary text-label-sm hover:underline">
                      Aktifkan
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-label-sm text-ink-muted mt-stack-sm">
        Tip: klik di luar kolom (blur) untuk menyimpan perubahan otomatis. Produk dari &quot;Impor dari Sheet&quot; masuk nonaktif — isi harga &amp; foto, baru klik &quot;Aktifkan&quot;.
      </p>
    </div>
  );
}
