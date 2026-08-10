import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("Memulai migrasi data imageUrl ke ProductMedia...");

  const products = await prisma.product.findMany({
    where: {
      imageUrl: {
        not: null,
      },
    },
    include: {
      media: true,
    },
  });

  console.log(`Ditemukan ${products.length} produk dengan imageUrl.`);

  let migratedCount = 0;

  for (const product of (products as any[])) {
    // Cek apakah imageUrl sudah ada di ProductMedia
    const alreadyExists = product.media.some((m: any) => m.url === product.imageUrl);

    if (!alreadyExists && product.imageUrl) {
      await (prisma as any).productMedia.create({
        data: {
          url: product.imageUrl,
          type: "IMAGE",
          order: 0, // Order 0 agar jadi yang utama
          productId: product.id,
        },
      });
      migratedCount++;
    }
  }

  console.log(`Migrasi selesai. ${migratedCount} media baru ditambahkan.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
