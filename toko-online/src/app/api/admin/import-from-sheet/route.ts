import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { fetchStockFromSheet } from "@/lib/googleSheet";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .concat("-", Math.random().toString(36).slice(2, 6));
}

// Dipisah dari /sync-stock secara sengaja: yang ini MEMBUAT produk baru
// (perlu dijalankan manual sekali-sekali oleh admin, bukan tiap tick cron),
// sedangkan /sync-stock cuma memperbarui stok produk yang sudah ada.
export async function POST() {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sheetItems = await fetchStockFromSheet();
    const existingSkus = new Set(
      (await prisma.product.findMany({ select: { sku: true } }))
        .map((p) => p.sku?.toUpperCase())
        .filter(Boolean)
    );

    const belumAda = sheetItems.filter((i) => !existingSkus.has(i.kode.toUpperCase()));
    if (belumAda.length === 0) {
      return NextResponse.json({ ok: true, dibuat: 0, message: "Semua kode di sheet sudah ada di website." });
    }

    // Kategori fallback untuk produk hasil impor — admin bisa pindahkan nanti
    let kategori = await prisma.category.findFirst({ where: { slug: "belum-dikategorikan" } });
    if (!kategori) {
      kategori = await prisma.category.create({
        data: { name: "Belum Dikategorikan", slug: "belum-dikategorikan" },
      });
    }

    let dibuat = 0;
    for (const item of belumAda) {
      const nama = item.nama || item.kode;
      await prisma.product.create({
        data: {
          name: nama,
          slug: slugify(nama),
          sku: item.kode,
          description: "Produk diimpor otomatis dari Google Sheet — lengkapi deskripsi, harga, dan foto sebelum diaktifkan.",
          price: 0,
          stock: item.stok,
          isActive: false, // sengaja nonaktif dulu, admin wajib isi harga & review sebelum tampil ke pembeli
          categoryId: kategori.id,
        },
      });
      dibuat++;
    }

    return NextResponse.json({
      ok: true,
      dibuat,
      message: `${dibuat} produk baru dibuat (nonaktif, kategori "Belum Dikategorikan"). Lengkapi harga & foto lalu aktifkan di halaman ini.`,
    });
  } catch (err: any) {
    console.error("Import from sheet error:", err);
    return NextResponse.json({ error: err.message || "Impor gagal" }, { status: 500 });
  }
}
