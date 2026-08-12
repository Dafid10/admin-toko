"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminAIPage() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "ai", text: "Halo Admin! Tanyakan apa saja seputar analisis penjualan, produk terlaris, atau sisa stok toko Anda." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/admin-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "ai", text: data.reply || data.error }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "ai", text: "Terjadi kesalahan koneksi." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🤖 Admin AI Assistant (Analisis Toko)</h1>
        <Link href="/admin" className="text-blue-600 hover:underline text-sm font-medium">← Kembali ke Dashboard</Link>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm flex flex-col h-[600px] overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-xl max-w-[80%] text-sm ${m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border shadow-sm'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-gray-400 text-xs italic">Gemini sedang menganalisis database toko...</div>}
        </div>

        <div className="p-4 border-t bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Contoh: Barang apa yang paling laris? Atau berapa total stok Hanata 3101?"
            className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button 
            onClick={handleSend} 
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Tanya AI
          </button>
        </div>
      </div>
    </div>
  );
}