// ... (import tetap sama)
export async function POST(req: Request) {
  try {
    const { message, action, customerName } = await req.json();

    // Logika Telegram tetap sama...
    if (action === "to_telegram") { /* ... (kode telegram tetap) */ }

    // AMBIL HANYA DATA PRODUK
    const products = await prisma.product.findMany();
    const productContext = JSON.stringify(products);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: `Anda adalah Customer Service AI toko Hanata. 
        Data stok tersedia: ${productContext}. 
        Tugas Anda: Jawab pertanyaan pembeli tentang stok dan info produk. 
        JANGAN berikan analisis penjualan, tren, atau data transaksi. Jika pembeli bertanya soal itu, arahkan ke kontak penjual.`,
      },
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memproses pesan" }, { status: 500 });
  }
}