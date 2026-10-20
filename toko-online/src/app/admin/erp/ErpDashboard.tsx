"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
interface Product { code: string; name: string; stock_real: number; cost_price: number; min_stock: number; }
interface Order { order_id: string; product_code: string; product_name: string; qty: number; sell_price: number; order_date: string; store: string; }
const rp = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");
export default function ErpDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<7 | 30>(30);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("products").select("*").order("code");
      const { data: o } = await supabase.from("orders").select("*").order("order_date", { ascending: false }).limit(200);
      setProducts((p as Product[]) || []);
      setOrders((o as Order[]) || []);
      setLoading(false);
    })();
  }, []);
  if (loading) return <div className="p-8 text-gray-800">Loading...</div>;
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - period);
  const ordersP = orders.filter(o => new Date(o.order_date) >= cutoff);
  const omzet = ordersP.reduce((s, o) => s + Number(o.sell_price || 0), 0);
  const prodMap: Record<string, Product> = {};
  products.forEach(p => { prodMap[p.code] = p; });
  const modal = ordersP.reduce((s, o) => s + (Number(o.qty || 0) * Number(prodMap[o.product_code || ""]?.cost_price || 0)), 0);
  const laba = omzet - modal;
  const pcs = ordersP.reduce((s, o) => s + Number(o.qty || 0), 0);
  const lowStock = products.filter(p => (p.stock_real || 0) <= (p.min_stock || 5)).length;
  const byProd: Record<string, { name: string; qty: number; omzet: number }> = {};
  ordersP.forEach(o => {
    const k = o.product_code || o.product_name || "?";
    if (!byProd[k]) byProd[k] = { name: o.product_name || k, qty: 0, omzet: 0 };
    byProd[k].qty += Number(o.qty || 0);
    byProd[k].omzet += Number(o.sell_price || 0);
  });
  const top5 = Object.entries(byProd).sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);
  const maxTop = top5[0]?.[1].qty || 1;
  const filtered = products.filter(p => !search || (p.code + " " + p.name).toLowerCase().includes(search.toLowerCase()));
  const byDay: Record<string, number> = {};
  ordersP.forEach(o => {
    const d = new Date(o.order_date).toISOString().slice(0, 10);
    byDay[d] = (byDay[d] || 0) + Number(o.sell_price || 0);
  });
  const days = Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])).slice(-14);
  const maxDay = Math.max(...days.map(d => d[1]), 1);
  return (
    <div className="space-y-5 bg-gray-50 p-4 rounded-xl max-w-5xl">
      <div><h1 className="text-2xl font-black text-gray-900">Dashboard ERP</h1>
      <p className="text-sm text-gray-500">Ringkasan penjualan &amp; stok grosir ecer plastik</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Total Produk", v: String(products.length), s: "Produk tercatat di katalog", c: "text-gray-900" },
          { l: "Total Order", v: String(orders.length), s: "Order pada data terakhir", c: "text-gray-900" },
          { l: "Stok Menipis", v: String(lowStock), s: "Stok ≤ batas minimum", c: "text-red-600" },
          { l: `Omzet ${period} Hari`, v: rp(omzet), s: `${ordersP.length} order · ${pcs} pcs`, c: "text-gray-900" },
        ].map((k, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500">{k.l}</p>
            <p className={`text-2xl font-black ${k.c}`}>{k.v}</p>
            <p className="text-xs text-gray-400">{k.s}</p>
          </div>
        ))}
      </div>
      <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="font-black text-gray-900">Laporan Penjualan</h2>
          <p className="text-xs text-gray-500">Omzet, modal, dan laba kotor periode terpilih.</p></div>
          <div className="flex gap-1 bg-gray-100 rounded-full p-1">
            {[7, 30].map(d => (
              <button key={d} onClick={() => setPeriod(d as 7 | 30)}
                className={`px-4 py-1 rounded-full text-sm font-bold ${period === d ? "bg-emerald-600 text-white" : "text-gray-500"}`}>{d} hari</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="p-4 rounded-xl bg-gray-50"><p className="text-xs text-gray-500">Omzet</p><p className="text-xl font-black text-gray-900">{rp(omzet)}</p><p className="text-xs text-gray-400">{ordersP.length} order · {pcs} pcs</p></div>
          <div className="p-4 rounded-xl bg-gray-50"><p className="text-xs text-gray-500">Modal (HPP)</p><p className="text-xl font-black text-gray-900">{rp(modal)}</p><p className="text-xs text-gray-400">Qty × harga modal</p></div>
          <div className="p-4 rounded-xl bg-emerald-50"><p className="text-xs text-gray-500">Laba Kotor</p><p className="text-xl font-black text-emerald-700">{rp(laba)}</p><p className="text-xs text-gray-400">Margin {omzet ? (laba / omzet * 100).toFixed(1) : 0}% dari omzet</p></div>
        </div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">Omzet per Hari</h3>
        <div className="flex items-end gap-1 h-24 mb-5">
          {days.map(([d, v]) => (
            <div key={d} className="flex-1 flex flex-col items-center" title={`${d}: ${rp(v)}`}>
              <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${Math.max(4, (v / maxDay) * 90)}px` }} />
            </div>
          ))}
        </div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">5 Produk Terlaris</h3>
        <div className="space-y-2">
          {top5.map(([code, t], i) => (
            <div key={code}>
              <div className="flex justify-between text-sm"><span className="text-gray-700"><b className="text-gray-900">{i + 1}.</b> {t.name.slice(0, 35)}</span><b className="text-gray-900">{t.qty} pcs</b></div>
              <div className="h-2 bg-gray-100 rounded-full"><div className="h-2 bg-emerald-600 rounded-full" style={{ width: `${(t.qty / maxTop) * 100}%` }} /></div>
              <p className="text-xs text-gray-400">Omzet {rp(t.omzet)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <h2 className="font-black text-gray-900 mb-3">Stok Produk</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..."
          className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 mb-3" />
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
          {filtered.map(p => {
            const st = p.stock_real || 0, mn = p.min_stock || 5;
            return (
              <div key={p.code} className="flex justify-between py-2 text-sm">
                <span><span className="font-mono font-bold text-gray-900">{p.code}</span><span className="text-gray-500 ml-2">{p.name.slice(0, 40)}</span></span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded ${st <= 0 ? "bg-red-100 text-red-700" : st <= mn ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{st <= 0 ? "HABIS" : st}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        <a href="/admin/erp/nota" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold">+ Nota Offline</a>
        <a href="/admin/erp/beli" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold">+ Pembelian Supplier</a>
        <a href="/admin/erp/koreksi" className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-bold">Koreksi Stok</a>
      </div>
    </div>
  );
}
