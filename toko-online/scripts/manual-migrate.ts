import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai migrasi manual...");
  
  // 1. Tambah kolom media ke tabel Product (jika PostgreSQL, Prisma Client biasanya handle ini tapi migrasi SQL lebih pasti)
  // Tapi di PostgreSQL, relasi ditangani lewat tabel ProductMedia.
  
  // 2. Buat tabel ProductMedia secara manual via SQL jika migrate dev gagal
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProductMedia" (
          "id" TEXT NOT NULL,
          "url" TEXT NOT NULL,
          "type" TEXT NOT NULL DEFAULT 'IMAGE',
          "productId" TEXT NOT NULL,
          "order" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("Tabel ProductMedia berhasil dibuat atau sudah ada.");

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_productId_fkey" 
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);
    console.log("Constraint foreign key berhasil ditambahkan.");
  } catch (e: any) {
    console.log("Info/Error saat buat tabel:", e.message);
  }

  console.log("Migrasi manual selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
