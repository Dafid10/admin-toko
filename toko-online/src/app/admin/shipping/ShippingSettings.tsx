"use client";

import { useEffect, useState } from "react";

export default function ShippingSettings() {
  const [expeditions, setExpeditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");

  async function load() {
    const res = await fetch("/api/admin/shipping");
    if (res.ok) {
      setExpeditions(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function add() {
    if (!newName) return;
    await fetch("/api/admin/shipping", {
      method: "POST",
      body: JSON.stringify({ name: newName, type: 'MANUAL' })
    });
    setNewName("");
    load();
  }

  async function toggle(id: string, currentStatus: boolean) {
    await fetch("/api/admin/shipping", {
      method: "PATCH",
      body: JSON.stringify({ id, isActive: !currentStatus })
    });
    load();
  }

  if (loading) return <p>Memuat...</p>;

  return (
    <div className="card p-6">
      <h2 className="text-headline-sm mb-4">Pengaturan Ekspedisi</h2>
      
      <div className="flex gap-2 mb-6">
        <input 
          placeholder="Nama Ekspedisi (misal: J&T Cargo)" 
          value={newName} 
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button onClick={add} className="btn-primary">Tambah</button>
      </div>

      <div className="space-y-3">
        {expeditions.map((ex) => (
          <div key={ex.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-bold">{ex.name}</p>
              <p className="text-xs text-ink-muted uppercase">{ex.type}</p>
            </div>
            <button 
              onClick={() => toggle(ex.id, ex.isActive)}
              className={`px-3 py-1 rounded-full text-xs font-bold ${ex.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {ex.isActive ? 'AKTIF' : 'NONAKTIF'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
