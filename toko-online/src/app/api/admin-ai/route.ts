// ... (import tetap sama)
export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // AMBIL KEDUA DATA (PRODUK + ORDER)
    const products = await prisma.product.findMany();
    const orders = await prisma.order.findMany({ 
      include: { items: { include: { product: true } } } 
    });

    const storeData = JSON.stringify({ products, orders });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Data Toko Lengkap (Produk + Penjualan): ${storeData}. 
      Pertanyaan Admin: ${message}. 
      Tugas Anda: Anda adalah asisten bisnis cerdas. Analisis data penjualan, tentukan produk terlaris, pendapatan, dan berikan insight strategis.`,
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal analisis: " + error.message }, { status: 500 });
  }
}