import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { message, history, action, customerName } = await req.json();

    // Jika customer memilih tombol "Kirim ke Telegram / Live Chat"
    if (action === "to_telegram") {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID;

      if (!token || !chatId) {
        return NextResponse.json({ error: "Telegram belum dikonfigurasi." }, { status: 500 });
      }

      const text = `💬 *Pesan Live Chat dari Website*\n\n` +
                   `👤 *Nama:* ${customerName || "Pengunjung"}\n` +
                   `📝 *Pesan:* ${message}`;

      const resTel = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
      });

      const dataTel = await resTel.json();
      if (!dataTel.ok) throw new Error("Gagal mengirim ke Telegram");

      return NextResponse.json({ 
        reply: "Pesan Anda telah diteruskan langsung ke Telegram Penjual. Mohon tunggu balasan berikutnya ya!" 
      });
    }

    // Jika chat biasa, dijawab oleh Gemini AI
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: "Anda adalah Customer Service AI untuk toko online wadah plastik/box container industri (Hanata). Jawab pertanyaan seputar produk, harga, dan stok dengan ramah. Jika pembeli menanyakan hal di luar kapasitas Anda atau memaksa ingin chat dengan manusia/penjual, arahkan mereka untuk menekan tombol 'Hubungkan ke Penjual' di bawah.",
      },
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error("Error Chat API:", error);
    return NextResponse.json({ error: "Gagal memproses pesan" }, { status: 500 });
  }
}