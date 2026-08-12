"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Maaf, terjadi kesalahan. Silakan coba lagi nanti." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const forwardToTelegram = async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      if (response.ok) {
        alert("Pesan berhasil diteruskan ke Telegram Penjual");
      } else {
        alert("Gagal meneruskan pesan");
      }
    } catch (error) {
      console.error("Telegram error:", error);
      alert("Terjadi kesalahan saat menghubungi Telegram");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all flex items-center justify-center cursor-pointer"
        aria-label="Toggle Chat"
      >
        <span className="material-symbols-outlined">
          {isOpen ? "close" : "chat"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[500px] overflow-hidden">
          <div className="bg-blue-600 p-4 text-white">
            <h3 className="font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">robot_2</span>
              Asisten AI Gemini {isAdmin && "(Mode Admin)"}
            </h3>
            <p className="text-xs opacity-80">
              {isAdmin ? "Pusat bantuan data & laporan" : "Tanya apa saja tentang produk kami"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                <span className="material-symbols-outlined text-4xl block mb-2 opacity-20">
                  chat_bubble
                </span>
                <p className="text-sm">Halo! Ada yang bisa saya bantu?</p>
              </div>
            )}
            
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  
                  {msg.role === "assistant" && !isAdmin && (
                    <button
                      onClick={() => forwardToTelegram(msg.content)}
                      className="mt-2 text-[10px] flex items-center gap-1 text-blue-600 hover:underline border-t border-blue-100 pt-2 w-full text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">send</span>
                      Teruskan Pesan Ini ke Telegram Penjual
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-gray-50 space-y-2">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tanya AI Gemini..."
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center cursor-pointer"
                title="Kirim ke AI Gemini"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
            
            {!isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (message.trim()) {
                    forwardToTelegram(message);
                    setMessage("");
                  } else {
                    alert("Ketik pesan terlebih dahulu di kolom chat untuk diteruskan ke Telegram");
                  }
                }}
                disabled={isLoading}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                Teruskan Pesan ke Telegram Penjual
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}