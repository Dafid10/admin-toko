"use client";

import { useEffect, useMemo, useState } from "react";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  trackingNumber?: string | null;
  expeditionName?: string | null;
  items: { productName: string; quantity: number }[];
};

const STATUS_LABEL: Record<string, string> = {
  MENUNGGU_PEMBAYARAN: "Menunggu Pembayaran",
  LUNAS: "Lunas",
  DIPROSES: "Diproses",
  DIKIRIM: "Dikirim",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

function statusChipClass(status: string) {
  if (status === "LUNAS" || status === "SELESAI") return "status-chip-lunas";
  if (status === "MENUNGGU_PEMBAYARAN") return "status-chip-pending";
  if (status === "DIBATALKAN") return "status-chip-danger";
  return "status-chip-neutral";
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("SEMUA");
  const [showResiModal, setShowResiModal] = useState<{ id: string, expedition: string, resi: string } | null>(null);

  async function load() {
    const res = await fetch("/api/admin/orders");
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  async function updateStatus(orderId: string, status: string, trackingNumber?: string, expeditionName?: string) {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status, trackingNumber, expeditionName }),
    });
    load();
  }

  const stats = useMemo(() => {
    const lunas = orders.filter((o) => ["LUNAS", "DIPROSES", "DIKIRIM", "SELESAI"].includes(o.status));
    const pending = orders.filter((o) => o.status === "MENUNGGU_PEMBAYARAN");
    const revenue = lunas.reduce((sum, o) => sum + o.totalAmount, 0);
    return { revenue, lunasCount: lunas.length, pendingCount: pending.length, total: orders.length };
  }, [orders]);

  const filtered = filter === "SEMUA" ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <p className="text-ink-muted">Memuat...</p>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-stack-lg">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-stack-sm">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">payments</span>
          </div>
          <p className="text-body-sm text-ink-muted mb-1">Total Pendapatan</p>
          <h3 className="text-headline-md text-ink">{formatRupiah(stats.revenue)}</h3>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-stack-sm">
            <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-full">task_alt</span>
          </div>
          <p className="text-body-sm text-ink-muted mb-1">Pesanan Lunas</p>
          <h3 className="text-headline-md text-ink">{stats.lunasCount}</h3>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-stack-sm">
            <span className="material-symbols-outlined text-on-tertiary-container bg-tertiary-container/20 p-2 rounded-full">
              hourglass_empty
            </span>
          </div>
          <p className="text-body-sm text-ink-muted mb-1">Menunggu Pembayaran</p>
          <h3 className="text-headline-md text-ink">{stats.pendingCount}</h3>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-stack-md">
        {["SEMUA", ...Object.keys(STATUS_LABEL)].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-label-sm border transition-colors ${
              filter === s ? "bg-primary text-white border-primary" : "bg-surface-lowest border-outline-variant text-ink-muted"
            }`}
          >
            {s === "SEMUA" ? "Semua" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="bg-surface-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-low border-b border-outline-variant">
                <th className="p-4 text-label-sm text-ink-muted uppercase tracking-wider">No. Pesanan</th>
                <th className="p-4 text-label-sm text-ink-muted uppercase tracking-wider">Pembeli</th>
                <th className="p-4 text-label-sm text-ink-muted uppercase tracking-wider">Item</th>
                <th className="p-4 text-label-sm text-ink-muted uppercase tracking-wider">Total</th>
                <th className="p-4 text-label-sm text-ink-muted uppercase tracking-wider">Status</th>
                <th className="p-4 text-label-sm text-ink-muted uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-surface-bright transition-colors">
                  <td className="p-4 font-mono text-body-sm text-ink">{o.orderNumber}</td>
                  <td className="p-4">
                    <div className="text-body-sm text-ink">{o.customerName}</div>
                    <div className="text-ink-muted text-label-sm">{o.customerPhone}</div>
                  </td>
                  <td className="p-4 text-label-sm text-ink-muted">
                    {o.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
                  </td>
                  <td className="p-4 text-body-sm text-ink font-medium">{formatRupiah(o.totalAmount)}</td>
                  <td className="p-4">
                    <span className={statusChipClass(o.status)}>{STATUS_LABEL[o.status]}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                        {o.status === "LUNAS" && (
                        <button onClick={() => updateStatus(o.id, "DIPROSES")} className="text-primary text-label-sm hover:underline text-left">
                            Proses Pesanan
                        </button>
                        )}
                        {o.status === "DIPROSES" && (
                        <button onClick={() => setShowResiModal({ id: o.id, expedition: o.expeditionName || '', resi: o.trackingNumber || '' })} className="text-primary text-label-sm hover:underline text-left">
                            Tandai Dikirim (Input Resi)
                        </button>
                        )}
                        {o.status === "DIKIRIM" && (
                        <>
                            <div className="text-[10px] text-ink-muted">Resi: {o.trackingNumber || '-'}</div>
                            <button onClick={() => updateStatus(o.id, "SELESAI")} className="text-primary text-label-sm hover:underline text-left">
                                Tandai Selesai
                            </button>
                        </>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-ink-muted">
                    Tidak ada pesanan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showResiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="card w-full max-w-sm p-6 bg-white shadow-2xl">
                  <h3 className="text-lg font-bold mb-4">Input Informasi Pengiriman</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-label-sm block mb-1">Nama Ekspedisi</label>
                          <input 
                            placeholder="Contoh: J&T Cargo / Manual" 
                            value={showResiModal.expedition} 
                            onChange={(e) => setShowResiModal({...showResiModal, expedition: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2"
                          />
                      </div>
                      <div>
                          <label className="text-label-sm block mb-1">Nomor Resi / Nota</label>
                          <input 
                            placeholder="Masukkan nomor resi" 
                            value={showResiModal.resi} 
                            onChange={(e) => setShowResiModal({...showResiModal, resi: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2"
                          />
                      </div>
                      <div className="flex gap-2 pt-2">
                          <button onClick={() => setShowResiModal(null)} className="btn-secondary flex-1">Batal</button>
                          <button onClick={() => {
                              updateStatus(showResiModal.id, "DIKIRIM", showResiModal.resi, showResiModal.expedition);
                              setShowResiModal(null);
                          }} className="btn-primary flex-1">Simpan & Kirim</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
