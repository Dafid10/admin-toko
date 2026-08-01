"use client";

import { useEffect, useState } from "react";

type Report = {
  totalPenjualanKotor: number;
  totalBiayaGateway: number;
  totalPenjualanBersih: number;
  jumlahPesanan: number;
  perHari: Record<string, { kotor: number; bersih: number; jumlah: number }>;
  produkTerlaris: { name: string; qty: number; revenue: number }[];
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ReportView() {
  const [report, setReport] = useState<Report | null>(null);
  const [range, setRange] = useState("30");

  useEffect(() => {
    fetch(`/api/admin/report?range=${range}`)
      .then((r) => r.json())
      .then(setReport);
  }, [range]);

  if (!report) return <p className="text-ink-muted">Memuat...</p>;

  const hariDiurutkan = Object.entries(report.perHari).sort((a, b) => (a[0] < b[0] ? 1 : -1));

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {[
          { v: "7", l: "7 Hari" },
          { v: "30", l: "30 Hari" },
          { v: "90", l: "90 Hari" },
        ].map((r) => (
          <button
            key={r.v}
            onClick={() => setRange(r.v)}
            className={`px-4 py-2 rounded-full text-sm border ${
              range === r.v ? "bg-primary text-white border-forest" : "bg-surface-lowest border-outline-variant"
            }`}
          >
            {r.l}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-xs text-ink-muted mb-1">Penjualan Kotor</p>
          <p className="text-headline-sm text-ink">
            {formatRupiah(report.totalPenjualanKotor)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-ink-muted mb-1">Estimasi Biaya Gateway</p>
          <p className="text-headline-sm text-ink text-danger">
            − {formatRupiah(report.totalBiayaGateway)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-ink-muted mb-1">Penjualan Bersih</p>
          <p className="text-headline-sm text-ink text-primary">
            {formatRupiah(report.totalPenjualanBersih)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-ink-muted mb-1">Jumlah Pesanan Lunas</p>
          <p className="text-headline-sm text-ink">{report.jumlahPesanan}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-medium mb-3">Penjualan per Hari</h2>
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {hariDiurutkan.map(([tanggal, d]) => (
              <div key={tanggal} className="flex justify-between text-sm border-b border-outline-variant pb-2">
                <span>{tanggal}</span>
                <span>
                  {formatRupiah(d.bersih)}{" "}
                  <span className="text-ink-muted">({d.jumlah} pesanan)</span>
                </span>
              </div>
            ))}
            {hariDiurutkan.length === 0 && (
              <p className="text-ink-muted text-sm">Belum ada penjualan di periode ini.</p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-medium mb-3">Produk Terlaris</h2>
          <div className="flex flex-col gap-2">
            {report.produkTerlaris.map((p, idx) => (
              <div key={idx} className="flex justify-between text-sm border-b border-outline-variant pb-2">
                <span>{p.name}</span>
                <span>
                  {p.qty} terjual · {formatRupiah(p.revenue)}
                </span>
              </div>
            ))}
            {report.produkTerlaris.length === 0 && (
              <p className="text-ink-muted text-sm">Belum ada data.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
