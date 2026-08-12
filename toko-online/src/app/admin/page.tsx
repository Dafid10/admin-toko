"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  stockStatus: string;
  indentDays?: number | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      console.error("Gagal memuat produk:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        alert("Produk berhasil dihapus");
      } else {
        alert("Gagal menghapus produk");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus produk");
    }
  };

  return (
    <div className="w-full">
      {/* Header Halaman */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Produk</h1>
          <p className="text-gray-500 mt-2">
            Kelola daftar produk, stok, dan status indent/pre-order di sini.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Produk
        </Link>
      </div>

      {/* Tabel Produk */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Memuat data produk...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Belum ada produk. Silakan tambah produk baru.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                  <th className="p-4">Nama Produk</th>
                  <th className="p-4">Harga</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4">Status & Indent</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{product.name}</td>
                    <td className="p-4">Rp {product.price.toLocaleString("id-ID")}</td>
                    <td className="p-4">{product.stock}</td>
                    <td className="p-4">
                      {product.stockStatus === "INDENT" ? (
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          Indent ({product.indentDays || 3} Hari)
                        </span>
                      ) : product.stockStatus === "LIMITED" ? (
                        <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-1 rounded-full">
                          Limited
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
                          Ready Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center space-x-3">
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="text-blue-600 hover:underline font-medium text-xs"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:underline font-medium text-xs cursor-pointer"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}