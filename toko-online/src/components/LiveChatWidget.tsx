"use client";

import { useState } from "react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "ai", text: "Halo! Ada yang bisa saya bantu seputar produk toko kami? Atau Anda ingin terhubung langsung ke penjual?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");

  const handleSend = async (toTelegram = false) => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg, 
          action: toTelegram ? "to_telegram" : "ai",
          customerName 
        }),
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
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:opacity-90 transition flex items-center gap-2 font-medium text-sm"
        >
          <span className="material-symbols-outlined">smart_toy</span> Tanya AI / Penjual
        </button>
      ) : (
        <div className="bg-surface-lowest w-80 sm:w-96 h-[500px] border border-outline-variant rounded-2xl shadow-xl flex flex-col overflow-hidden">
          <div className="bg-primary text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold text-sm">Asisten Toko & Live Chat</h3>
            <button onClick={() => setIsOpen(false)} className="text-white font-bold text-lg">×</button>
          </div>

          <div className="p-2 bg-surface-low border-b text-[11px] text-ink-muted flex gap-2 items-center">
            <span>Nama Anda:</span>
            <input 
              type="text" 
              value={customerName} 
              onChange={(e) => setCustomerName(e.target.value)} 
              placeholder="Opsional (Cth: Budi)" 
              className="border rounded px-2 py-0.5 text-xs flex-1 bg-white"
            />
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-xl max-w-[85%] ${m.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-ink border border-outline-variant'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-gray-400 text-xs italic">Sedang mengetik...</div>}
          </div>

          <div className="p-3 border-t bg-white space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(false)}
                placeholder="Ketik pertanyaan ke AI..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
              <button 
                onClick={() => handleSend(false)} 
                disabled={loading}
                className="bg-primary text-white px-3 py-2 rounded-lg text-xs font-medium hover:opacity-90"
              >
                Kirim AI
              </button>
            </div>
            <button
              onClick={() => handleSend(true)}
              disabled={loading}
              className="w-full bg-amber-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-amber-700 transition"
            >
              📞 Teruskan Pesan Ini ke Telegram Penjual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}