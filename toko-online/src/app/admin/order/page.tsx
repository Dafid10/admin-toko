'use client';

import { useState } from 'react';

// Mock data pesanan masuk (terfokus pada produk Box Container Hanata 3101)
const initialOrders = [
  {
    id: 'ORD-20260813-001',
    customerName: 'Budi Santoso',
    phone: '081234567890',
    product: 'Box Container / Keranjang Industri Rapat Hanata 3101',
    quantity: 2,
    total: 'Rp 350.000',
    status: 'PREPARING', // Status: PREPARING | ON_DELIVERY | COMPLETED
    shippingType: 'GoSend Instant (Beroda - Besar)',
    resi: null,
  },
  {
    id: 'ORD-20260813-002',
    customerName: 'Siti Rahma',
    phone: '089876543210',
    product: 'Box Container / Keranjang Industri Rapat Hanata 3101',
    quantity: 1,
    total: 'Rp 175.000',
    status: 'ON_DELIVERY',
    shippingType: 'GoSend Instant (Beroda - Besar)',
    resi: 'GS-INSTANT-88912345',
  },
];

export default function AdminDashboard() {
  const [orders, setOrders] = useState(initialOrders);
 const [loadingId, setLoadingId] = useState<string | null>(null);

  // Fungsi simulasi panggil kurir manual (Dispatch)
  // Tombol ini memicu sistem memanggil API kurir (Biteship) dan menerbitkan resi
  const handleDispatchCourier = (orderId: string) => {
    setLoadingId(orderId);
    setTimeout(() => {
      setOrders((prevOrders) =>
        prevOrders.map((ord) => {
          if (ord.id === orderId) {
            return {
              ...ord,
              status: 'ON_DELIVERY',
              resi: `GS-INSTANT-${Math.floor(10000000 + Math.random() * 90000000)}`,
            };
          }
          return ord;
        })
      );
      setLoadingId(null);
      alert(`Kurir berhasil dipanggil untuk pesanan ${orderId}! Resi otomatis diterbitkan dan status pelanggan berubah.`);
    }, 1000); // Simulasi delay proses API kurir
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard Toko</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola pesanan masuk dan kontrol waktu pemanggilan kurir.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 font-semibold text-xs rounded-full border border-blue-100 inline-block">
              Total Pesanan Aktif: {orders.length}
            </span>
          </div>
        </div>

        {/* Tabel Daftar Pesanan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Daftar Transaksi Masuk</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="py-3 px-4 font-semibold">No. Order & Pelanggan</th>
                  <th className="py-3 px-4 font-semibold">Produk & Total</th>
                  <th className="py-3 px-4 font-semibold">Kurir & Status</th>
                  <th className="py-3 px-4 font-semibold">Nomor Resi</th>
                  <th className="py-3 px-4 font-semibold text-center">Kontrol Dispatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 transition">
                    
                    {/* No Order & Customer */}
                    <td className="py-4 px-4 align-top">
                      <p className="font-bold text-blue-600">{ord.id}</p>
                      <p className="text-gray-900 font-medium mt-0.5">{ord.customerName}</p>
                      <p className="text-xs text-gray-500">{ord.phone}</p>
                    </td>

                    {/* Product & Total */}
                    <td className="py-4 px-4 align-top max-w-xs">
                      <p className="font-medium text-gray-900 line-clamp-1">{ord.product}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: {ord.quantity} pcs | <span className="font-semibold text-gray-800">{ord.total}</span>
                      </p>
                    </td>

                    {/* Shipping & Status */}
                    <td className="py-4 px-4 align-top">
                      <p className="text-xs font-medium text-gray-600">{ord.shippingType}</p>
                      <div className="mt-1.5">
                        {ord.status === 'PREPARING' && (
                          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                            Menyiapkan Barang
                          </span>
                        )}
                        {ord.status === 'ON_DELIVERY' && (
                          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-full">
                            Kurir Menjemput
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Resi */}
                    <td className="py-4 px-4 align-top">
                      {ord.resi ? (
                        <span className="font-mono text-xs bg-gray-100 px-2.5 py-1 rounded border text-gray-800 font-bold inline-block">
                          {ord.resi}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 italic">Belum dipanggil</span>
                      )}
                    </td>

                    {/* Aksi Dispatch Manual */}
                    <td className="py-4 px-4 align-middle text-center">
                      {ord.status === 'PREPARING' ? (
                        <button
                          onClick={() => handleDispatchCourier(ord.id)}
                          disabled={loadingId === ord.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2 px-3.5 rounded-xl transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5 mx-auto"
                        >
                          {loadingId === ord.id ? (
                            'Memproses...'
                          ) : (
                            <>
                              🚗 Panggil Kurir
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1.5 rounded-xl inline-block">
                          Selesai Dipickup
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
 