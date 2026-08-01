import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { fetchStockFromSheet } from "@/lib/googleSheet";

// Diizinkan untuk dua jenis pemanggil:
// 1. Admin yang login (tombol "Sinkron Sekarang" di dashboard)
// 2. Cron job otomatis di server, pakai header x-cron-secret (lihat README Bagian 5.4)
function isAuthorized(req: NextRequest): boolean {
  if (getAdminSession()) return true;
  const cronSecret = req.headers.get("x-cron-secret");
  return !!process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sheetItems = await fetchStockFromSheet();
    const products = await prisma.product.findMany({ where: { sku: { not: null } } });

    let diperbarui = 0;
    const kodeTidakDitemukanDiSheet: string[] = [];

    for (const product of products) {
      const match = sheetItems.find(
        (i) => i.kode.toUpperCase() === (product.sku || "").toUpperCase()
      );
      if (match) {
        if (match.stok !== product.stock) {
          await prisma.product.update({ where: { id: product.id }, data: { stock: match.stok } });
          diperbarui++;
        }
      } else {
        kodeTidakDitemukanDiSheet.push(product.sku!);
      }
    }

    return NextResponse.json({
      ok: true,
      totalProdukDenganSku: products.length,
      totalItemDiSheet: sheetItems.length,
      diperbarui,
      kodeTidakDitemukanDiSheet,
      waktu: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Sync stock error:", err);
    return NextResponse.json({ error: err.message || "Sinkronisasi gagal" }, { status: 500 });
  }
}
