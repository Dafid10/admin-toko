"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    stockStatus: "READY",
    indentDays: "",
    categoryId: "",
    imageUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          indentDays: formData.stockStatus === "INDENT" && formData.indentDays ? Number(formData.indentDays) : null,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan produk");

      alert("Produk berhasil ditambahkan!");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan produk.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100 my-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Tambah Produk Baru</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Produk</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Box Hanata 3101"
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Slug (URL unik)</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="Contoh: box-hanata-3101"
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Harga (Rp)</label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="Contoh: 150000"
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Stok</label>
            <input
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="Contoh: 10"
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Bagian Status Stok & Indent */}
        <div className="space-y-4 border border-gray-200 p-4 rounded-xl bg-gray-50 my-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Status Stok Produk</label>
            <select
              value={formData.stockStatus || "READY"}
              onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="READY">Ready Stock</option>
              <option value="LIMITED">Limited</option>
              <option value="INDENT">Indent (Pre-Order)</option>
            </select>
          </div>

          {formData.stockStatus === "INDENT" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Estimasi Hari Indent (Masukkan angka hari, misal: 3 atau 7)
              </label>
              <input
                type="number"
                value={formData.indentDays}
                onChange={(e) => setFormData({ ...formData, indentDays: e.target.value })}
                placeholder="Contoh: 3"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi Produk</label>
          <textarea
            rows={4}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Tulis deskripsi produk di sini..."
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? "Menyimpan..." : "Simpan Produk"}
        </button>
      </form>
    </div>
  );
}