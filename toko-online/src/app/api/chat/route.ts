import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { message, action, customerName } = await req.json();

    // 1. Logika Telegram
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

    // 2. Ambil data produk & stok dari database
    const products = await prisma.product.findMany();
    const productContext = JSON.stringify(products);

    // 3. Logika Gemini AI dengan instruksi yang lebih tegas membaca database
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: `Anda adalah Customer Service AI untuk toko online wadah plastik/box container industri (Hanata). 
        Berikut adalah data produk dan stok terkini dari database toko: ${productContext}. 
        TUGAS ANDA: Jawab pertanyaan pembeli mengenai ketersediaan stok, harga, atau produk apa saja yang habis/tersedia secara LANGSUNG berdasarkan data JSON di atas. 
        Jangan menyuruh pembeli mengecek ke website jika datanya sudah ada di database. Sebutkan nama produk dan status stoknya dengan jelas. 
        Jika pembeli ingin memesan khusus, nego, atau bertanya di luar data yang ada, arahkan mereka menekan tombol 'Teruskan Pesan Ini ke Telegram Penjual' di bawah.`,
      },
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    console.error("Error Chat API:", error);
    return NextResponse.json({ error: "Gagal memproses pesan: " + (error.message || error) }, { status: 500 });
  }
}