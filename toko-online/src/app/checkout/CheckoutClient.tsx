"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import QRCode from "react-qr-code";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

type CheckoutResult = {
  orderId: string;
  orderNumber: string;
  qrString: string;
  totalAmount: number;
  expiresAt: string | null;
};

function useCountdown(expiresAt: string | null) {
  const [label, setLabel] = useState("--:--");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      if (diff <= 0) {
        setExpired(true);
        setLabel("EXPIRED");
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setLabel(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return { label, expired };
}

export default function CheckoutClient() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({ customerName: "", customerPhone: "", customerAddress: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("MENUNGGU_PEMBAYARAN");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const countdown = useCountdown(result?.expiresAt ?? null);

  useEffect(() => {
    if (!result) return;
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/orders/${result.orderId}/status`);
      if (!res.ok) return;
      const data = await res.json();
      setOrderStatus(data.status);
      if (data.status === "LUNAS") {
        clearCart();
        if (pollRef.current) clearInterval(pollRef.current);
      }
      if (data.status === "DIBATALKAN") {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [result, clearCart]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat pesanan");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0 && !result) {
    router.replace("/keranjang");
    return null;
  }

  // ==== Tampilan sukses ====
  if (result && orderStatus === "LUNAS") {
    return (
      <div className="max-w-2xl mx-auto w-full">
        <div className="card p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary-container text-on-secondary-container mb-stack-md">
            <span className="material-symbols-outlined filled text-[48px]">check_circle</span>
          </div>
          <h1 className="text-display-lg-mobile md:text-display-lg text-ink mb-stack-sm">
            Pembayaran Berhasil!
          </h1>
          <p className="text-body-lg text-ink-muted mb-stack-lg max-w-lg mx-auto">
            Terima kasih telah berbelanja di PasarDigital. Pesanan Anda sedang diproses.
          </p>

          <div className="bg-surface rounded-xl p-6 mb-stack-lg text-left border border-outline-variant">
            <h2 className="text-headline-sm text-ink mb-stack-md border-b border-outline-variant pb-2">
              Detail Pesanan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-stack-md gap-x-gutter">
              <div>
                <p className="text-label-sm text-ink-muted uppercase tracking-wider mb-1">No. Pesanan</p>
                <p className="text-body-md font-medium text-ink">#{result.orderNumber}</p>
              </div>
              <div>
                <p className="text-label-sm text-ink-muted uppercase tracking-wider mb-1">Metode Pembayaran</p>
                <p className="text-body-md font-medium text-ink">QRIS</p>
              </div>
              <div>
                <p className="text-label-sm text-ink-muted uppercase tracking-wider mb-1">Total Bayar</p>
                <p className="text-body-md font-semibold text-primary">{formatRupiah(result.totalAmount)}</p>
              </div>
              <div>
                <p className="text-label-sm text-ink-muted uppercase tracking-wider mb-1">Tanggal Bayar</p>
                <p className="text-body-md font-medium text-ink">
                  {new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} WIB
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface-low rounded-xl p-6 mb-stack-lg text-left flex items-start gap-stack-md">
            <span className="material-symbols-outlined text-primary mt-1">mark_email_read</span>
            <div>
              <h3 className="text-label-md text-ink mb-1">Selanjutnya?</h3>
              <p className="text-body-sm text-ink-muted">
                Penjual akan segera menyiapkan dan mengirim pesanan Anda. Anda bisa memantau statusnya kapan saja.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-stack-md justify-center">
            <button onClick={() => router.push("/")} className="px-8 py-3 bg-primary text-white text-label-md rounded-full hover:bg-primary-hover transition-colors shadow-sm">
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (result && orderStatus === "DIBATALKAN") {
    return (
      <div className="max-w-md mx-auto text-center py-16 card p-10">
        <span className="material-symbols-outlined text-[48px] text-danger mb-stack-sm block">error</span>
        <h1 className="text-headline-md text-danger mb-stack-sm">Pembayaran Gagal / Kedaluwarsa</h1>
        <p className="text-ink-muted mb-stack-lg">Silakan buat pesanan baru.</p>
        <button onClick={() => router.push("/keranjang")} className="btn-primary">
          Kembali ke Keranjang
        </button>
      </div>
    );
  }

  // ==== Tampilan QR menunggu pembayaran ====
  if (result) {
    return (
      <main className="flex-grow w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-lg bg-surface-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden">
          <div className="bg-surface-low p-stack-md border-b border-outline-variant text-center relative">
            <button
              onClick={() => router.push("/keranjang")}
              aria-label="Kembali"
              className="absolute left-stack-md top-1/2 -translate-y-1/2 text-ink-muted hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-headline-sm text-ink">Detail Pembayaran</h1>
          </div>

          <div className="p-stack-lg flex flex-col items-center gap-stack-lg">
            <div className="text-center w-full">
              <p className="text-label-sm text-ink-muted uppercase tracking-wider mb-stack-xs">
                Total Bayar
              </p>
              <div className="text-display-lg-mobile md:text-display-lg text-primary mb-stack-sm">
                {formatRupiah(result.totalAmount)}
              </div>
              <div className="flex items-center justify-center gap-stack-xs text-ink-muted bg-surface-highest inline-flex px-3 py-1 rounded-full">
                <span className="text-body-sm">No. Pesanan: #{result.orderNumber}</span>
              </div>
            </div>

            {result.expiresAt && !countdown.expired && (
              <div className="w-full bg-danger-container/30 border border-danger-container rounded-xl p-stack-md flex flex-col items-center justify-center gap-stack-xs">
                <div className="flex items-center gap-stack-xs text-danger">
                  <span className="material-symbols-outlined">timer</span>
                  <span className="text-label-md">Selesaikan pembayaran dalam</span>
                </div>
                <div className="text-headline-md text-danger tracking-widest font-mono">
                  {countdown.label}
                </div>
              </div>
            )}

            <div className="w-full flex flex-col items-center gap-stack-md bg-surface-low rounded-xl p-stack-lg border border-outline-variant relative">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant">
                <QRCode value={result.qrString} size={200} />
              </div>
              <p className="text-body-sm text-ink-muted text-center">
                Scan dengan aplikasi e-wallet atau m-banking apa saja yang mendukung QRIS.
              </p>
            </div>

            <div className="w-full border border-outline-variant rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-stack-md bg-surface-low hover:bg-surface-container transition-colors"
                onClick={() => setShowInstructions((s) => !s)}
              >
                <div className="flex items-center gap-stack-sm text-ink">
                  <span className="material-symbols-outlined">help_outline</span>
                  <span className="text-label-md">Cara membayar dengan QRIS?</span>
                </div>
                <span
                  className={`material-symbols-outlined transition-transform duration-300 ${
                    showInstructions ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>
              {showInstructions && (
                <div className="bg-surface-lowest max-h-48 overflow-y-auto border-t border-outline-variant p-stack-md">
                  <ol className="list-decimal list-inside space-y-stack-sm text-body-sm text-ink-muted">
                    <li>Buka aplikasi m-banking atau e-wallet Anda (GoPay, OVO, DANA, ShopeePay, BCA mobile, Livin&apos; by Mandiri, dsb).</li>
                    <li>Pilih menu <strong>Scan QR</strong> atau <strong>Bayar</strong>.</li>
                    <li>Scan kode QR di atas. Jika membuka di HP yang sama, simpan gambar QR lalu pilih dari galeri.</li>
                    <li>Pastikan nominal yang tampil sesuai dengan <strong>{formatRupiah(result.totalAmount)}</strong>.</li>
                    <li>Konfirmasi pembayaran dan masukkan PIN untuk menyelesaikan transaksi.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          <div className="p-stack-md bg-surface-low border-t border-outline-variant flex flex-col gap-stack-sm">
            <div className="w-full text-center flex items-center justify-center gap-2 text-body-sm text-ink-muted py-2">
              <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
              Menunggu konfirmasi pembayaran otomatis...
            </div>
          </div>
        </div>

        <div className="mt-stack-lg flex items-center justify-center gap-stack-sm text-ink-muted">
          <span className="material-symbols-outlined filled text-[18px]">lock</span>
          <span className="text-label-sm uppercase tracking-wider">
            Pembayaran Aman oleh PasarDigital &amp; Xendit
          </span>
        </div>
      </main>
    );
  }

  // ==== Form data pembeli ====
  return (
    <div className="grid md:grid-cols-3 gap-gutter">
      <form onSubmit={handleSubmit} className="md:col-span-2 flex flex-col gap-stack-md card p-stack-lg">
        <h1 className="text-headline-md text-ink mb-stack-sm">Data Pengiriman</h1>

        <div>
          <label className="block text-label-sm text-ink-muted mb-1">Nama Lengkap</label>
          <input
            required
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="w-full border border-outline-variant rounded-lg px-4 py-2.5 bg-surface-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-label-sm text-ink-muted mb-1">Nomor WhatsApp</label>
          <input
            required
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            placeholder="08xxxxxxxxxx"
            className="w-full border border-outline-variant rounded-lg px-4 py-2.5 bg-surface-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-label-sm text-ink-muted mb-1">Alamat Lengkap</label>
          <textarea
            required
            rows={3}
            value={form.customerAddress}
            onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
            className="w-full border border-outline-variant rounded-lg px-4 py-2.5 bg-surface-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {error && <p className="text-danger text-body-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-stack-sm flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
          {loading ? "Membuat kode QRIS..." : "Buat Pesanan & Bayar QRIS"}
        </button>
      </form>

      <div className="card p-stack-lg h-fit">
        <h2 className="text-headline-sm text-ink mb-stack-md">Ringkasan Pesanan</h2>
        {items.map((i) => (
          <div key={i.productId} className="flex justify-between text-body-sm mb-stack-sm text-ink-muted">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span className="text-ink">{formatRupiah(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-outline-variant my-stack-sm" />
        <div className="flex justify-between text-label-md text-ink font-bold">
          <span>Total</span>
          <span>{formatRupiah(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
