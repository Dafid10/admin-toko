import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Mengambil data produk dan pesanan dari database untuk dianalisis oleh AI
    const products = await prisma.product.findMany();
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } }
    });

    const storeData = JSON.stringify({ products, orders });

    // Kirim data toko beserta pertanyaan admin ke Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Berikut adalah data database toko saya saat ini (dalam format JSON): ${storeData}. 
      Pertanyaan Admin: ${message}. 
      Tolong analisis data tersebut dan berikan jawaban yang akurat, profesional, serta ringkas dalam Bahasa Indonesia mengenai produk terlaris, stok, atau performa penjualan.`,
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    console.error("Admin AI Error:", error);
    return NextResponse.json({ error: "Gagal menganalisis data: " + error.message }, { status: 500 });
  }
}