"use client";
import { usePathname } from "next/navigation";

export default function ChatWidget() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* ... kode widget Anda ... */}
      
      {/* Tombol Telegram ini HANYA muncul jika bukan halaman admin */}
      {!isAdmin && (
        <button className="bg-yellow-500 w-full p-3 rounded-lg text-sm font-bold shadow-sm mb-2">
          Teruskan Pesan ke Telegram Penjual
        </button>
      )}
    </div>
  );
}