import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message, action, customerName } = await req.json();

    // 1. Logika Telegram
    if (action === "to_telegram") {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID;

      if (!token || !chatId) {
        return NextResponse.json({ error: "Config Telegram tidak lengkap" }, { status: 500 });
      }

      const text = `💬 *Pesan dari Website*\n👤 *Nama:* ${customerName || "Pengunjung"}\n📝 *Pesan:* ${message}`;
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
      });
      return NextResponse.json({ reply: "Pesan telah diteruskan ke Telegram." });
    }

    // 2. Logika Gemini (Menggunakan Model 1.5 Flash - Model Paling Stabil)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("API Key kosong!");
      return NextResponse.json({ error: "API Key belum diset" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(message);
    const text = result.response.text();

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("DETAIL ERROR:", error.message); // Ini akan muncul di log Vercel jika error
    return NextResponse.json({ error: "Gagal: " + error.message }, { status: 500 });
  }
}