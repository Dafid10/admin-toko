"use client";

import { useEffect, useState, use } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function PaymentPage({ params }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;

  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulasi mengambil data pesanan & QR String dari backend / database
  useEffect(() => {
    // Anda bisa menggantinya dengan fetch ke API detail order Anda, misal: /api/orders/${orderId}
    // Di sini kita gunakan data dummy atau ambil dari state/local storage jika disimpan sebelumnya
    const fetchOrderDetail = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        setOrderData(data);
      } catch (error) {
        console.error("Gagal memuat data pembayaran:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat instruksi pembayaran...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-8 text-center space-y-6">
        
        <div>
          <h1 className="text-xl font-bold text-gray-900">Selesaikan Pembayaran QRIS</h1>
          <p className="text-sm text-gray-500 mt-1">No. Order: <span className="font-mono font-semibold">{orderData?.orderNumber || orderId}</span></p>
        </div>

        {/* Kotak QR Code */}
        <div className="bg-white p-6 border-2 border-dashed border-gray-200 rounded-2xl inline-block shadow-inner">
          {orderData?.qrString ? (
            <QRCodeSVG value={orderData.qrString} size={220} level="M" includeMargin={true} />
          ) : (
            <div className="w-[220px] h-[220px] flex items-center justify-center text-gray-400 text-sm">
              QR Code tidak tersedia
            </div>
          )}
        </div>

        {/* Total Tagihan */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Total Pembayaran</p>
          <p className="text-2xl font-extrabold text-blue-900 mt-1">
            Rp {orderData?.totalAmount?.toLocaleString("id-ID") || "175.000"}
          </p>
        </div>

        {/* Instruksi Singkat */}
        <div className="text-xs text-gray-500 space-y-1 text-left bg-gray-50 p-4 rounded-xl border">
          <p className="font-semibold text-gray-700">Cara Pembayaran:</p>
          <p>1. Buka aplikasi M-Banking atau E-Wallet (BCA, GoPay, OVO, Dana, dll).</p>
          <p>2. Pilih menu <strong>Scan QR / QRIS</strong>.</p>
          <p>3. Arahkan kamera ke kotak QR di atas dan selesaikan pembayaran.</p>
        </div>

        <a
          href={`/track/${orderId}`}
          className="block w-full bg-gray-900 hover:bg-black text-white font-medium py-3 rounded-xl transition shadow-sm text-sm"
        >
          Cek Status Pesanan Saya
        </a>

      </div>
    </main>
  );
}