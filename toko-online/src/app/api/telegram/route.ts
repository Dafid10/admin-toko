import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ADMIN_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;

    // Jika tidak ada teks pesan, abaikan
    if (!message || !message.text) {
      return NextResponse.json({ status: 'ok' });
    }

    const chatId = message.chat.id;
    const userText = message.text;

    let botReply = "";
    let isQuotaExceeded = false;

    // Coba minta jawaban ke Gemini AI
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
      
      // Cek jika kuota habis atau ada error dari Google API
      if (!response.ok || data.error) {
        if (response.status === 429 || data.error?.code === 429) {
          isQuotaExceeded = true;
        }
        throw new Error(data.error?.message || "Gemini API error");
      }

      botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya kurang paham. Ada yang bisa saya bantu seputar produk Box Hanata?";
    
    } catch (aiError) {
      // Penanganan ketika kuota Gemini habis atau error
      console.error("AI Error / Quota Habis:", aiError);
      isQuotaExceeded = true;
      botReply = "Halo kak! Maaf ya, sistem AI kami sedang istirahat sebentar. Pesan Anda sudah diteruskan ke Admin kami, mohon tunggu sebentar ya nanti pasti dibalas!";
    }

    // Kirim balasan ke pembeli di Telegram
    if (TELEGRAM_BOT_TOKEN) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: botReply
        })
      });

      // Jika kuota habis, berikan laporan darurat ke akun Telegram pribadi Admin
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
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}