import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Ambil transaksi yang sudah lunas (PAID) beserta item barangnya
    const paidOrders = await prisma.order.findMany({
      where: { status: "PAID" },
      include: { items: true },
    });

    const totalPenjualanKotor = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalBiayaGateway = paidOrders.reduce((sum, o) => sum + (o.paymentFee || 0), 0);

    // Hitung total harga modal dari semua barang yang terjual
    const totalModal = paidOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + (i.costPrice * i.quantity), 0), 
      0
    );

    // Rumus Laba Bersih = Omset Kotor - Fee Gateway - Total Modal
    const totalPenjualanBersih = totalPenjualanKotor - totalBiayaGateway - totalModal;
    const jumlahPesanan = paidOrders.length;

    return NextResponse.json({
      totalPenjualanKotor,
      totalBiayaGateway,
      totalModal,            // Angka total modal
      totalPenjualanBersih,  // Angka laba bersih
      jumlahPesanan,
    });
  } catch (err: any) {
    console.error("Report error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengambil data laporan" },
      { status: 500 }
    );
  }
}