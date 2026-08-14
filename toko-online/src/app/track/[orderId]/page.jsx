'use client';

import { use } from 'react';

// Mock database pesanan untuk simulasi
const mockOrders = {
  'ORD-20260813-001': {
    orderId: 'ORD-20260813-001',
    customerName: 'Budi Santoso',
    product: 'Box Container / Keranjang Industri Rapat Hanata 3101',
    quantity: 2,
    totalPrice: 'Rp 350.000',
    status: 'PREPARING', // Status: PREPARING | DISPATCHED | ON_DELIVERY | COMPLETED
    shippingType: 'GoSend Instant (Beroda - Besar)',
    resi: null,
    liveTrackingUrl: null,
    updatedAt: '13 Agustus 2026, 07:45 WIB',
  },
  'ORD-20260813-002': {
    orderId: 'ORD-20260813-002',
    customerName: 'Siti Rahma',
    product: 'Box Container / Keranjang Industri Rapat Hanata 3101',
    quantity: 1,
    totalPrice: 'Rp 175.000',
    status: 'ON_DELIVERY',
    shippingType: 'GoSend Instant (Beroda - Besar)',
    resi: 'GS-INSTANT-88912345',
    liveTrackingUrl: 'https://maps.google.com/?q=live-tracking-simulated',
    updatedAt: '13 Agustus 2026, 08:10 WIB',
  },
};

export default function TrackingPage({ params }) {
  // Unwrap params menggunakan React.use() untuk kompatibilitas Next.js App Router terbaru
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;

  // Ambil data pesanan berdasarkan ID, jika tidak ada tampilkan data dummy default atau not found
  const order = mockOrders[orderId] || {
    orderId: orderId,
    customerName: 'Pelanggan Setia',
    product: 'Box Container / Keranjang Industri Rapat Hanata 3101',
    quantity: 1,
    totalPrice: 'Rp 175.000',
    status: 'PREPARING',
    shippingType: 'Kurir Toko / Instan',
    resi: null,
    liveTrackingUrl: null,
    updatedAt: 'Hari ini',
  };

  // Konfigurasi tahapan status untuk UI Timeline
  const steps = [
    { key: 'PREPARING', label: 'Pesanan Diterima & Disiapkan' },
    { key: 'DISPATCHED', label: 'Kurir Dipanggil (Menjemput Paket)' },
    { key: 'ON_DELIVERY', label: 'Dalam Perjalanan ke Lokasi Anda' },
    { key: 'COMPLETED', label: 'Pesanan Selesai' },
  ];

  const getCurrentStepIndex = (status) => {
    switch (status) {
      case 'PREPARING': return 0;
      case 'DISPATCHED': return 1;
      case 'ON_DELIVERY': return 2;
      case 'COMPLETED': return 3;
      default: return 0;
    }
  };

  const currentStepIndex = getCurrentStepIndex(order.status);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-blue-600 px-6 py-6 text-white text-center">
          <h1 className="text-xl font-bold">Lacak Status Pesanan</h1>
          <p className="text-blue-100 text-sm mt-1">No. Order: {order.orderId}</p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Status Badge */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Status Terkini</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">
                {order.status === 'PREPARING' && 'Barang Sedang Disiapkan oleh Toko'}
                {order.status === 'DISPATCHED' && 'Kurir Telah Dipanggil & Mencari Driver'}
                {order.status === 'ON_DELIVERY' && 'Kurir Sedang Mengantar Pesanan Anda'}
                {order.status === 'COMPLETED' && 'Pesanan Telah Selesai'}
              </p>
            </div>
            <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border shadow-2xs">
              {order.updatedAt}
            </span>
          </div>

          {/* Dinamic Resi / Tracking Box */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Informasi Pengiriman</h2>
            <div className="text-sm space-y-1 text-gray-600">
              <p><span className="font-medium text-gray-900">Kurir:</span> {order.shippingType}</p>
              <p>
                <span className="font-medium text-gray-900">Nomor Resi / Booking:</span>{' '}
                {order.resi ? (
                  <span className="font-mono bg-white px-2 py-0.5 rounded border text-blue-600 font-bold">
                    {order.resi}
                  </span>
                ) : (
                  <span className="text-amber-600 italic">Belum tersedia (Resi muncul setelah admin memanggil kurir)</span>
                )}
              </p>
            </div>

            {/* Tombol Live Tracking Peta (Hanya muncul jika resi & link tersedia) */}
            {order.liveTrackingUrl && (
              <div className="pt-2">
                <a
                  href={order.liveTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-xl transition shadow-sm"
                >
                  Buka Peta Live Tracking Kurir
                </a>
              </div>
            )}
          </div>

          {/* Timeline Progress */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Linimasa Pesanan</h2>
            <div className="border-l-2 border-blue-200 ml-3 space-y-6 pl-4">
              {steps.map((step, index) => {
                const isPassed = index <= currentStepIndex;
                return (
                  <div key={step.key} className="relative flex items-start space-x-3">
                    <span
                      className={`absolute -left-[23px] h-4 w-4 rounded-full border-2 bg-white ${
                        isPassed ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}
                    />
                    <div>
                      <p className={`text-sm font-medium ${isPassed ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail Produk */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <h2 className="text-sm font-semibold text-gray-700">Rincian Belanja</h2>
            <div className="bg-white border rounded-xl p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Penerima</span>
                <span className="font-medium text-gray-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Produk</span>
                <span className="font-medium text-gray-900 text-right">{order.product} (x{order.quantity})</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600 font-semibold">Total Pembayaran</span>
                <span className="font-bold text-blue-600">{order.totalPrice}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center text-xs text-gray-500">
          Simpan tautan halaman ini untuk memantau status pesanan Anda secara berkala.
        </div>

      </div>
    </main>
  );
}