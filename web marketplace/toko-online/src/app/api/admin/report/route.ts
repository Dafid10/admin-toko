import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "30"; // hari
  const since = new Date();
  since.setDate(since.getDate() - Number(range));

  const paidOrders = await prisma.order.findMany({
    where: { status: { in: ["LUNAS", "DIPROSES", "DIKIRIM", "SELESAI"] }, paidAt: { gte: since } },
    include: { items: true },
    orderBy: { paidAt: "desc" },
  });

  const totalPenjualanKotor = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalBiayaGateway = paidOrders.reduce((sum, o) => sum + o.paymentFee, 0);
  const totalPenjualanBersih = totalPenjualanKotor - totalBiayaGateway;
  const jumlahPesanan = paidOrders.length;

  // Agregasi per hari, untuk grafik sederhana
  const perHari: Record<string, { kotor: number; bersih: number; jumlah: number }> = {};
  for (const o of paidOrders) {
    if (!o.paidAt) continue;
    const key = o.paidAt.toISOString().slice(0, 10);
    if (!perHari[key]) perHari[key] = { kotor: 0, bersih: 0, jumlah: 0 };
    perHari[key].kotor += o.totalAmount;
    perHari[key].bersih += o.totalAmount - o.paymentFee;
    perHari[key].jumlah += 1;
  }

  // Produk terlaris
  const terjual: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const o of paidOrders) {
    for (const item of o.items) {
      if (!terjual[item.productId]) {
        terjual[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      }
      terjual[item.productId].qty += item.quantity;
      terjual[item.productId].revenue += item.subtotal;
    }
  }
  const produkTerlaris = Object.values(terjual)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  return NextResponse.json({
    totalPenjualanKotor,
    totalBiayaGateway,
    totalPenjualanBersih,
    jumlahPesanan,
    perHari,
    produkTerlaris,
  });
}
