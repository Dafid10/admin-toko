import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Cek apakah ini kiriman dari Tombol Website ({ message: "teks" })
    if (body.message && typeof body.message === 'string') {
      const userText = body.message;

      if (!TELEGRAM_BOT_TOKEN || !ADMIN_CHAT_ID) {
        return NextResponse.json({ error: "Konfigurasi Telegram belum lengkap di .env" }, { status: 500 });
      }

      // Teruskan pesan pembeli dari web ke Admin Telegram
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: `🛒 **Pesan dari Web Chat (Pembeli):**\n\n${userText}`,
          parse_mode: "Markdown",
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengirim pesan ke Telegram Penjual");
      }

      return NextResponse.json({ success: true });
    }

    // 2. Jika bukan dari web, berarti ini adalah Webhook Telegram standar ({ message: { text, chat: { id } } })
    const telegramMessage = body.message;
    if (!telegramMessage || !telegramMessage.text) {
      return NextResponse.json({ status: 'ok' });
    }

    const chatId = telegramMessage.chat.id;
    const userText = telegramMessage.text;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    let botReply = "";
    let isQuotaExceeded = false;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Anda adalah Customer Service toko online Box Container & Keranjang Industri Hanata (seperti Box Hanata 3101 yang besar dan beroda). Jawab pertanyaan pembeli ini dengan ramah, singkat, dan informatif dalam Bahasa Indonesia: "${userText}"`
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        if (response.status === 429 || data.error?.code === 429) {
          isQuotaExceeded = true;
        }
        throw new Error(data.error?.message || "Gemini API error");
      }

      botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya kurang paham. Ada yang bisa saya bantu seputar produk Box Hanata?";
    
    } catch (aiError) {
      console.error("AI Error / Quota Habis:", aiError);
      isQuotaExceeded = true;
      botReply = "Halo kak! Maaf ya, sistem AI kami sedang istirahat sebentar. Pesan Anda sudah diteruskan ke Admin kami, mohon tunggu sebentar ya nanti pasti dibalas!";
    }

    if (TELEGRAM_BOT_TOKEN) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: botReply
        })
      });

      if (isQuotaExceeded && ADMIN_CHAT_ID) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            text: `[PERHATIAN: KUOTA AI HABIS/ERROR]\nPelanggan (ID: ${chatId}) berkata: "${userText}"\nSilakan balas langsung atau hubungi pelanggan ini.`
          })
        });
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}