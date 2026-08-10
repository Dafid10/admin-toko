const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const publicImagesDir = path.join(__dirname, "..", "public", "images");

  if (!fs.existsSync(publicImagesDir)) {
    console.error(`Folder public/images tidak ditemukan di: ${publicImagesDir}`);
    process.exit(1);
  }

  // Baca semua file gambar di folder public/images
  const files = fs.readdirSync(publicImagesDir);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

  console.log(`Ditemukan ${imageFiles.length} file gambar di public/images\n`);

  let updatedCount = 0;
  let notFoundCount = 0;
  let alreadyCorrectCount = 0;

  for (const fileName of imageFiles) {
    // Ekstrak product_id dari nama file (format: img-{product_id}.{ext})
    const match = fileName.match(/^img-(.+)\.(jpg|jpeg|png|webp)$/i);

    if (!match) {
      console.log(`[Dilewati] File "${fileName}": Format nama tidak sesuai`);
      continue;
    }

    const productId = match[1];
    const imageUrl = `/images/${fileName}`;

    try {
      // Cek produk di database
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        console.log(`[Tidak Ditemukan] Product ID "${productId}" tidak ada di database`);
        notFoundCount++;
        continue;
      }

      // Cek apakah imageUrl sudah benar
      if (product.imageUrl === imageUrl) {
        console.log(`[Sudah Benar] Product "${product.name}" (ID: ${productId}) - imageUrl sudah up-to-date`);
        alreadyCorrectCount++;
        continue;
      }

      // Update database
      await prisma.product.update({
        where: { id: productId },
        data: { imageUrl }
      });

      console.log(`[Berhasil] Update "${product.name}" (ID: ${productId}) - ${product.imageUrl} -> ${imageUrl}`);
      updatedCount++;
    } catch (err) {
      console.log(`[Error] Gagal update product "${productId}": ${err.message}`);
    }
  }

  console.log("\n=== Sinkronisasi Selesai ===");
  console.log(`Berhasil diupdate       : ${updatedCount}`);
  console.log(`Sudah benar             : ${alreadyCorrectCount}`);
  console.log(`Tidak ditemukan di DB   : ${notFoundCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());