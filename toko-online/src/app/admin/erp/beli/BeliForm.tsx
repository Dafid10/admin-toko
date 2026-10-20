"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
interface Product { code: string; name: string; stock_real: number; cost_price: number; }
interface Item { code: string; name: string; qty: number; price: number; }
export default function BeliForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [selCode, setSelCode] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("products").select("code,name,stock_real,cost_price").order("code");
      setProducts((data as Product[]) || []);
    })();
  }, []);
  const filtered = products.filter(p => search && (p.code + " " + p.name).toLowerCase().includes(search.toLowerCase())).slice(0, 10);
  const sel = products.find(p => p.code === selCode);
  const pickProduct = (p: Product) => { setSelCode(p.code); setSearch(p.code); setPrice(Number(p.cost_price) || 0); setQty(1); };
  const addItem = () => {
    if (!sel || qty <= 0) return;
    setItems([...items, { code: sel.code, name: sel.name, qty, price }]);
    setSelCode(""); setSearch(""); setQty(1); setPrice(0);
  };
  const total = items.reduce((s, it) => s + it.qty * it.price, 0);
  const submit = async () => {
    if (!supplier.trim() || items.length === 0) { alert("Isi nama supplier & tambah barang"); return; }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      for (const it of items) {
        await supabase.from("purchases").insert({ purchase_date: now, supplier: supplier.trim(), product_code: it.code, product_name: it.name, qty: it.qty, unit_price: it.price, total_price: it.qty * it.price, status: "received" });
        const prod = products.find(p => p.code === it.code);
        if (prod) {
          await supabase.from("products").update({ stock_real: prod.stock_real + it.qty, cost_price: it.price }).eq("code", it.code);
        }
      }
      setDone(true); setItems([]); setSupplier("");
    } catch (e: any) { alert("Gagal: " + e.message); }
    setSaving(false);
  };
  if (done) return (
    <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center max-w-md mx-auto">
      <p className="text-4xl">✅</p><p className="font-black text-gray-900 text-xl">Pembelian Tersimpan!</p>
      <p className="text-sm text-gray-600">Stok otomatis bertambah.</p>
      <button onClick={() => setDone(false)} className="mt-4 px-6 py-2 rounded-xl bg-gray-200 text-gray-900 font-bold">+ Input Lagi</button>
    </div>
  );
  return (
    <div className="space-y-4 max-w-2xl bg-white p-4 rounded-xl">
      <h1 className="text-xl font-black text-gray-900">Pembelian Supplier</h1>
      <input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Nama supplier... (cth: PT Bersama Saudara Maju)"
        className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-300 text-gray-900" />
      <input value={search} onChange={e => { setSearch(e.target.value); setSelCode(""); }} placeholder="Cari produk..."
        className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-300 text-gray-900" />
      {search && !selCode && filtered.map(p => (
        <button key={p.code} onClick={() => pickProduct(p)} className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-xl flex justify-between text-sm">
          <span><b className="font-mono text-gray-900">{p.code}</b><span className="text-gray-500 ml-2">{p.name.slice(0, 30)}</span></span>
          <span className="text-gray-500">stok: {p.stock_real}</span>
        </button>
      ))}
      {sel && (
        <div className="flex gap-2">
          <input type="number" value={qty} onChange={e => setQty(Number(e.target.value))} placeholder="Qty" className="w-24 px-3 py-2 rounded-xl border border-gray-300 text-gray-900" />
          <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} placeholder="Harga beli/pcs" className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-gray-900" />
          <button onClick={addItem} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm">+ Tambah</button>
        </div>
      )}
      {items.length > 0 && (
        <div className="border-t pt-3">
          {items.map((it, i) => (
            <div key={i} className="flex justify-between py-1 text-sm text-gray-900">
              <span className="font-mono font-bold">{it.code} ×{it.qty}</span>
              <span>Rp{(it.qty * it.price).toLocaleString("id-ID")}</span>
            </div>
          ))}
          <div className="flex justify-between font-black text-gray-900 pt-2 border-t">
            <span>Total</span><span className="text-blue-600">Rp{total.toLocaleString("id-ID")}</span>
          </div>
          <button onClick={submit} disabled={saving} className="w-full mt-3 py-3 rounded-xl bg-blue-600 text-white font-black disabled:opacity-40">
            {saving ? "Menyimpan..." : "💾 Simpan Pembelian"}
          </button>
        </div>
      )}
      <p className="text-xs text-gray-400">💡 Atau foto nota supplier & kirim ke Muse — AI otomatis bacain & input.</p>
    </div>
  );
}
