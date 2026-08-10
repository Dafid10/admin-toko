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

function parseCSVLine(text: string, delimiter = ","): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ""));
  return result;
}

async function main() {
  const dataPath = path.join(__dirname, "data", "laporan import shopee.csv");
  
  if (!fs.existsSync(dataPath)) {
    console.error(`File CSV tidak ditemukan di: ${dataPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(dataPath, "utf-8");
  const lines = fileContent.split(/\r?\n/).filter((line) => line.trim() !== "");

  if (lines.length <= 1) {
    console.error("File CSV kosong atau hanya berisi baris header!");
    process.exit(1);
  }

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = parseCSVLine(lines[0], delimiter).map((h) => h.toLowerCase());

  const findCol = (keywords: string[]) =>
    headers.findIndex((h) => keywords.some((kw) => h.includes(kw)));

  const idIdx = findCol(["id produk", "product id", "item id"]);
  const nameIdx = findCol(["nama produk", "product name"]);
  const descIdx = findCol(["deskripsi", "description"]);
  const skuIdx = findCol(["sku induk", "sku", "parent sku"]);
  const priceIdx = findCol(["harga", "price", "asli"]);

  const products: ShopeeProduct[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i], delimiter);
    if (cols.length <= 1) continue;

    const shopeeProductId = idIdx !== -1 && cols[idIdx] ? cols[idIdx] : `shopee-row-${i}`;
    const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : `Produk ${i}`;
    const description = descIdx !== -1 && cols[descIdx] ? cols[descIdx] : "";
    
    // Jika SKU kosong atau duplikat string kosong, jadikan null
    let sku = skuIdx !== -1 && cols[skuIdx] !== "" ? cols[skuIdx] : null;
    if (sku === "") sku = null;

    const rawPrice = priceIdx !== -1 && cols[priceIdx] ? cols[priceIdx] : "0";
    const price = parseFloat(rawPrice.replace(/[^0-9.]/g, "")) || 0;

    products.push({
      shopeeProductId,
      name,
      description,
      sku,
      price,
    });
  }

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
    // Cek berdasarkan shopeeProductId terlebih dahulu
    const existing = await prisma.product.findUnique({
      where: { shopeeProductId: p.shopeeProductId },
    });

    if (existing) {
      // Check if new SKU is already used by another product
      let newSku = p.sku;
      if (newSku) {
        const skuConflict = await prisma.product.findUnique({
          where: { sku: newSku },
        });
        if (skuConflict && skuConflict.id !== existing.id) {
          newSku = null; // Set to null if SKU already used by another product
        }
      }
      
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          sku: newSku,
          price: p.price,
        },
      });
      diupdate++;
      continue;
    }

    // Cek apakah SKU sudah dipakai produk lain (jika SKU tidak null)
    if (p.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: p.sku },
      });
      if (existingSku) {
        // Jika SKU sudah ada, abaikan atau set sku jadi null agar tidak error P2002
        p.sku = null; 
      }
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
          stock: 0, 
          isActive: false, 
          categoryId: kategori.id,
        },
      });
      dibuat++;
    } catch (err) {
      console.error(`Gagal impor "${p.name}":`, err);
      dilewati++;
    }
  }

  console.log("=== Impor Laporan Shopee Selesai ===");
  console.log(`Total baris dibaca    : ${products.length}`);
  console.log(`Produk baru dibuat    : ${dibuat}`);
  console.log(`Produk di-update harga: ${diupdate}`);
  console.log(`Gagal/dilewati        : ${dilewati}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());