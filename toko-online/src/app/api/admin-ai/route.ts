import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "@prisma/client";

// DEFINISI INI YANG TADI TERLEWAT, JANGAN SAMPAI TERLEWAT LAGI:
const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Sekarang prisma bisa digunakan karena sudah didefinisikan di atas
    const products = await prisma.product.findMany();
    const orders = await prisma.order.findMany({ 
      include: { items: { include: { product: true } } } 
    });

    const storeData = JSON.stringify({ products, orders });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Data Toko Lengkap (Produk + Penjualan): ${storeData}. 
      Pertanyaan Admin: ${message}. 
      Tugas Anda: Anda adalah asisten bisnis cerdas. Analisis data penjualan, tentukan produk terlaris, pendapatan, dan berikan insight strategis dalam Bahasa Indonesia yang ringkas.`,
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    console.error("Admin AI Error:", error);
    return NextResponse.json({ error: "Gagal analisis: " + error.message }, { status: 500 });
  }
}