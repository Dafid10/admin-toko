"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
interface Product { code: string; name: string; stock_real: number; }
interface Adj { id: number; product_code: string; qty_change: number; reason: string; created_at: string; }
const REASONS = ["Cancel order", "Kirim sebagian", "Barang rusak", "Selisih fisik", "Retur", "Lainnya"];
export default function KoreksiForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<Adj[]>([]);
  const [search, setSearch] = useState("");
  const [selCode, setSelCode] = useState("");
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const load = async () => {
    const { data: p } = await supabase.from("products").select("code,name,stock_real").order("code");
    const { data: h } = await supabase.from("stock_adjustments").select("*").order("created_at", { ascending: false }).limit(20);
    setProducts((p as Product[]) || []); setHistory((h as Adj[]) || []);
  };
  useEffect(() => { load(); }, []);
  const filtered = products.filter(p => search && (p.code + " " + p.name).toLowerCase().includes(search.toLowerCase())).slice(0, 10);
  const sel = products.find(p => p.code === selCode);
  const submit = async () => {
    if (!selCode || qty === 0) { alert("Pilih produk & isi jumlah"); return; }
    setSaving(true);
    try {
      const r = note.trim() ? reason + " - " + note.trim() : reason;
      await supabase.from("stock_adjustments").insert({ product_code: selCode, qty_change: qty, reason: r });
      await supabase.from("products").update({ stock_real: (sel?.stock_real || 0) + qty }).eq("code", selCode);
      setSelCode(""); setQty(0); setNote(""); setSearch(""); await load();
      alert("Koreksi tersimpan!");
    } catch (e: any) { alert("Gagal: " + e.message); }
    setSaving(false);
  };
  return (
    <div className="space-y-4 max-w-2xl bg-white p-4 rounded-xl">
      <h1 className="text-xl font-black text-gray-900">Koreksi Stok</h1>
      <input value={search} onChange={e => { setSearch(e.target.value); setSelCode(""); }} placeholder="Cari produk..."
        className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-300 text-gray-900" />
      {search && !selCode && filtered.map(p => (
        <button key={p.code} onClick={() => { setSelCode(p.code); setSearch(p.code); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-xl flex justify-between text-sm">
          <b className="font-mono text-gray-900">{p.code}</b><span className="text-gray-500">stok: {p.stock_real}</span>
        </button>
      ))}
      {sel && (
        <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-900">
          <b className="font-mono">{sel.code}</b> — Stok: <b>{sel.stock_real}</b>
        </div>
      )}
      {selCode && (
        <>
          <input type="number" value={qty} onChange={e => setQty(Number(e.target.value))} placeholder="Jumlah (+/-)"
            className="w-full px-4 py-2 rounded-xl border border-gray-300 text-gray-900 font-mono text-lg" />
          {qty !== 0 && sel && <p className="text-sm text-gray-600">{sel.stock_real} → <b className={qty < 0 ? "text-red-600" : "text-emerald-600"}>{sel.stock_real + qty}</b></p>}
          <div className="flex flex-wrap gap-2">
            {REASONS.map(r => (
              <button key={r} onClick={() => setReason(r)} className={`px-3 py-1 rounded-xl text-xs font-bold ${reason === r ? "bg-amber-200 text-amber-800" : "bg-gray-100 text-gray-600"}`}>{r}</button>
            ))}
          </div>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Catatan (opsional)"
            className="w-full px-4 py-2 rounded-xl border border-gray-300 text-gray-900 text-sm" />
          <button onClick={submit} disabled={saving || qty === 0} className="w-full py-3 rounded-xl bg-amber-500 text-white font-black disabled:opacity-40">
            {saving ? "Menyimpan..." : "💾 Simpan Koreksi"}
          </button>
        </>
      )}
      <div className="border-t pt-3">
        <p className="text-xs font-bold text-gray-500 mb-2">RIWAYAT</p>
        {history.map(h => (
          <div key={h.id} className="flex gap-2 py-1 text-xs text-gray-700">
            <span className="font-mono font-bold">{h.product_code}</span>
            <span className={`font-mono font-bold ${h.qty_change < 0 ? "text-red-600" : "text-emerald-600"}`}>{h.qty_change > 0 ? "+" : ""}{h.qty_change}</span>
            <span className="text-gray-500 truncate">{h.reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
