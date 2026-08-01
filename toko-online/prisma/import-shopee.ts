import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

type ShopeeProduct = {
  shopeeProductId: string;
  name: string;
  description: string;
  sku: string | null;
  price: number;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80)
    .concat("-", Math.random().toString(36).slice(2, 6));
}

async function main() {
  const dataPath = path.join(__dirname, "data", "shopee-products.json");
  const products: ShopeeProduct[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  // Kategori fallback untuk semua produk hasil impor Shopee ini.
  // Pindahkan produk ke kategori lain kapan saja lewat /admin/produk.
  let kategori = await prisma.category.findFirst({ where: { slug: "container-box-penyimpanan" } });
  if (!kategori) {
    kategori = await prisma.category.create({
      data: { name: "Container & Box Penyimpanan", slug: "container-box-penyimpanan" },
    });
  }

  let dibuat = 0;
  let diupdate = 0;
  let dilewati = 0;

  for (const p of products) {
    const existing = await prisma.product.findUnique({
      where: { shopeeProductId: p.shopeeProductId },
    });

    if (existing) {
      // Sudah pernah diimpor sebelumnya — cukup update harga & sku, jangan bikin duplikat.
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          sku: p.sku,
          price: p.price,
        },
      });
      diupdate++;
      continue;
    }

    try {
      await prisma.product.create({
        data: {
          name: p.name,
          slug: slugify(p.name),
          sku: p.sku,
          shopeeProductId: p.shopeeProductId,
          description: p.description,
          price: p.price,
          stock: 0, // belum ada data stok — sinkron lewat Google Sheet setelah SKU dicek/dilengkapi
          isActive: false, // sengaja nonaktif — review harga & lengkapi foto dulu sebelum tampil ke pembeli
          categoryId: kategori.id,
        },
      });
      dibuat++;
    } catch (err) {
      console.error(`Gagal impor "${p.name}":`, err);
      dilewati++;
    }
  }

  const adaHarga = products.filter((p) => p.price > 0).length;
  console.log("=== Impor Shopee selesai ===");
  console.log(`Produk baru dibuat   : ${dibuat}`);
  console.log(`Produk sudah ada, diupdate harga: ${diupdate}`);
  console.log(`Gagal/dilewati       : ${dilewati}`);
  console.log(`Punya harga (dari kolom offline PL_shopee): ${adaHarga} / ${products.length}`);
  console.log(`Belum ada harga (masih Rp0, cek manual)   : ${products.length - adaHarga}`);
  console.log("\nSemua produk masuk NONAKTIF ke kategori \"Container & Box Penyimpanan\".");
  console.log("Buka /admin/produk untuk cek harga, lengkapi foto, lalu Aktifkan satu per satu.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
