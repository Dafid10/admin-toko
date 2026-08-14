import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createQrisPaymentRequest } from "@/lib/xendit";

type CheckoutBody = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: { productId: string; quantity: number }[];
};

function generateOrderNumber() {
  const date = new Date();
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORD-${ymd}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutBody = await req.json();

    if (!body.customerName || !body.customerPhone || !body.customerAddress) {
      return NextResponse.json({ error: "Data pembeli belum lengkap" }, { status: 400 });
    }
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
    }

    // Ambil harga & stok terbaru dari database — JANGAN pernah percaya harga dari client
    const productIds = body.items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of body.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Produk tidak ditemukan atau sudah tidak dijual` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stok "${product.name}" tidak mencukupi (sisa ${product.stock})` },
          { status: 400 }
        );
      }

      // --- PERBAIKAN 1: Kalkulasi subtotal tiap barang ---
      const subtotal = product.price * item.quantity;

      // --- PERBAIKAN 2: Penjumlahan ke total pembayaran ---
      totalAmount += subtotal;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        costPrice: product.costPrice, // Mengunci harga modal saat checkout
        quantity: item.quantity,
        subtotal,
      });
    }

    const orderNumber = generateOrderNumber();

    // Buat order dengan status MENUNGGU_PEMBAYARAN
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerAddress: body.customerAddress,
        totalAmount,
        items: { create: orderItemsData },
      },
    });

    // Minta kode QRIS ke Xendit
    const qris = await createQrisPaymentRequest({
      amount: totalAmount,
      referenceId: orderNumber,
      orderId: order.id,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        xenditPaymentId: qris.id,
        xenditReferenceId: qris.referenceId,
        xenditQrString: qris.qrString,
      },
    });

    // 1. Kirim data otomatis ke Google Sheets via Apps Script
    if (process.env.GOOGLE_SCRIPT_URL) {
      try {
        await fetch(`${process.env.GOOGLE_SCRIPT_URL}?key=${process.env.GOOGLE_SCRIPT_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderNumber,
            customerName: body.customerName,
            phone: body.customerPhone,
            product: orderItemsData.map(i => `${i.productName} (x${i.quantity})`).join(', '),
            quantity: orderItemsData.reduce((acc, i) => acc + i.quantity, 0),
            total: totalAmount,
            status: 'MENUNGGU_PEMBAYARAN'
          }),
        });
      } catch (sheetError) {
        console.error("Gagal sinkron ke Google Sheets:", sheetError);
      }
    }

    // 2. Kirim notifikasi instan ke Telegram Admin
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.ADMIN_TELEGRAM_CHAT_ID) {
      try {
        const productList = orderItemsData.map(i => `• ${i.productName} (x${i.quantity})`).join('\n');
        const telegramMessage = `🚨 *PESANAN BARU MASUK!* 🚨\n\n` +
          `📦 *No. Order:* \`${orderNumber}\`\n` +
          `👤 *Pelanggan:* ${body.customerName} (${body.customerPhone})\n` +
          `🛒 *Produk:*\n${productList}\n` +
          `💰 *Total:* Rp ${totalAmount.toLocaleString('id-ID')}\n` +
          `📍 *Alamat:* ${body.customerAddress}\n\n` +
          `Status: Menunggu pembayaran (QRIS).`;

        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.ADMIN_TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: 'Markdown',
          }),
        });
      } catch (telegramError) {
        console.error("Gagal kirim notifikasi Telegram:", telegramError);
      }
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      qrString: qris.qrString,
      totalAmount,
      expiresAt: qris.expiresAt,
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan saat memproses checkout" },
      { status: 500 }
    );
  }
}