"use client";

import Link from "next/link";

export default function FloatingTelegram() {
  // Ganti dengan username bot Telegram toko Anda nanti (tanpa @)
  const telegramUsername = "UsernameBotTokoAnda"; 

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group">
      {/* Efek Bubble / Tooltip */}
      <div className="bg-white text-gray-800 text-xs font-semibold px-3 py-2 rounded-xl shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 pointer-events-none">
        Live Chat
      </div>

      {/* Tombol Utama Telegram */}
      <Link
        href={`https://t.me/${telegramUsername}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Live Chat Telegram"
        className="bg-[#229ED9] hover:bg-[#1d8ebf] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
      >
        {/* Icon Telegram SVG */}
        <svg 
          className="w-7 h-7 fill-current" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.96-.75 3.78-1.65 6.31-2.74 7.58-3.27 3.61-1.51 4.36-1.77 4.85-1.78.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.04.2z"/>
        </svg>
      </Link>
    </div>
  );
}