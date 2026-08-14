import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyXenditWebhookToken } from "@/lib/xendit";
import { pushSaleToSheet } from "@/lib/googleSheet";

// Xendit akan POST ke endpoint ini setiap kali ada perubahan status pembayaran.
// Set URL ini di dashboard.xendit.co -> Settings -> Webhooks:
//   https://tokosaya.com/api/webhooks/xendit
//
// Estimasi biaya admin QRIS Xendit saat ini ~0.7% dari nilai transaksi (bisa berubah,
// cek tarif terbaru di dashboard Xendit Anda) — dipakai untuk laporan margin di /admin/laporan.
const ESTIMASI_PERSEN_BIAYA_QRIS = 0.007;

export async function POST(req: NextRequest) {
  // 1. Verifikasi bahwa notifikasi ini benar-benar dari Xendit, bukan pihak lain
  const token = req.headers.get("x-callback-token");
  if (!verifyXenditWebhookToken(token)) {
    return NextResponse.json({ error: "Token webhook tidak valid" }, { status: 401 });
  }

  const payload = await req.json();

  // Payload payment_requests webhook memuat reference_id & status.
  // status yang menandakan pembayaran berhasil: "SUCCEEDED"
  const referenceId: string | undefined = payload?.data?.reference_id ?? payload?.reference_id;
  const status: string | undefined = payload?.data?.status ?? payload?.status;
  const paymentId: string | undefined = payload?.data?.id ?? payload?.id;

  if (!referenceId) {
    return NextResponse.json({ error: "reference_id tidak ada di payload" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: referenceId },
    include: { items: true },
  });

  if (!order) {
    console.warn(`Webhook Xendit: order dengan orderNumber ${referenceId} tidak ditemukan`);
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }

  // Hindari memproses dua kali kalau Xendit kirim webhook duplikat
  if (order.status !== "MENUNGGU_PEMBAYARAN") {
    return NextResponse.json({ ok: true, message: "Sudah diproses sebelumnya" });
  }

  if (status === "SUCCEEDED") {
    // 2. Kurangi stok tiap produk yang dibeli — dilakukan di dalam transaction
    //    supaya stok & status order konsisten (tidak ada race condition antar order)
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "LUNAS",
          paidAt: new Date(),
          xenditPaymentId: paymentId ?? order.xenditPaymentId,
          paymentFee: Math.round(order.totalAmount * ESTIMASI_PERSEN_BIAYA_QRIS),
        },
      });
    });

    // 3. Lapor penjualan ke Google Sheet (MASTER_STOCK ikut berkurang di sana juga,
    //    jadi sheet tetap jadi "sumber kebenaran" stok untuk semua channel).
    //    Sengaja tidak pakai await di dalam transaction di atas — kalau Apps Script
    //    lambat/down, konfirmasi pembayaran ke pembeli tidak boleh ikut tertunda/gagal.
    try {
      await pushSaleToSheet({
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod,
        items: order.items.map((i) => ({
          sku: i.id,
          nama: i.productName,
          qty: i.quantity,
          harga: i.price,
        })),
      });
    } catch (sheetError) {
      console.error(`Gagal lapor order ${order.orderNumber} ke Google Sheet:`, sheetError);
    }

    // 4. Kirim notifikasi instan ke Telegram Admin
    try {
      const message = `🚨 *PEMBAYARAN BERHASIL (LUNAS)!* 🚨\n\n` +
        `📦 *No. Order:* \`${order.orderNumber}\`\n` +
        `👤 *Pelanggan:* ${order.customerName} (${order.customerPhone})\n` +
        `💰 *Total:* Rp ${order.totalAmount.toLocaleString('id-ID')}\n\n` +
        `Barang sedang disiapkan. Silakan cek dashboard admin untuk panggil kurir Biteship!`;

      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.ADMIN_TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    } catch (telegramError) {
      console.error("Gagal kirim notifikasi Telegram:", telegramError);
    }

  } else if (status === "FAILED" || status === "EXPIRED") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "DIBATALKAN" },
    });
  }

  return NextResponse.json({ ok: true });
}