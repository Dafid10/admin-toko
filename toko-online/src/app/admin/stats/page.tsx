"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminStatsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin-stats").then(res => res.json()).then(setData);
  }, []);

  if (!data) return <div className="p-6">Memuat statistik...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📊 Statistik & Grafik Penjualan</h1>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-sm">
          <p className="opacity-80 text-sm">Hari Ini</p>
          <h2 className="text-2xl font-bold mt-1">Rp {data.totalToday?.toLocaleString() || 0}</h2>
        </div>
        <div className="bg-green-600 text-white p-6 rounded-xl shadow-sm">
          <p className="opacity-80 text-sm">Minggu Ini</p>
          <h2 className="text-2xl font-bold mt-1">Rp {data.totalWeek?.toLocaleString() || 0}</h2>
        </div>
        <div className="bg-purple-600 text-white p-6 rounded-xl shadow-sm">
          <p className="opacity-80 text-sm">30 Hari Terakhir</p>
          <h2 className="text-2xl font-bold mt-1">Rp {data.totalMonth?.toLocaleString() || 0}</h2>
        </div>
      </div>

      {/* Grafik Batang */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Top 5 Barang Terlaris</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topProducts || []}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="qty" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}