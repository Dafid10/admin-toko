const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const SOURCE_DIR = "F:\\"; 

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Folder sumber tidak ditemukan di: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const publicImagesDir = path.join(__dirname, "..", "public", "images");
  if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
  }

  // Baca folder di F:\ dan abaikan folder sistem Windows
  const entries = fs.readdirSync(SOURCE_DIR, { withFileTypes: true });
  const folders = entries.filter((e) => {
    if (!e.isDirectory()) return false;
    const name = e.name.toLowerCase();
    if (name.includes("system volume information") || name.includes("$recycle.bin")) {
      return false;
    }
    return true;
  });

  let updatedCount = 0;
  let skippedCount = 0;

  for (const folder of folders) {
    const folderName = folder.name;
    const folderPath = path.join(SOURCE_DIR, folderName);

    try {
      const files = fs.readdirSync(folderPath);
      const imageFile = files.find((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

      if (!imageFile) {
        console.log(`[Dilewati] Folder "${folderName}": Tidak ditemukan file gambar (jpg/png/webp).`);
        skippedCount++;
        continue;
      }

      const cleanQuery = folderName.trim();

      // Cari produk di database berdasarkan SKU atau nama (case-insensitive)
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { sku: { contains: cleanQuery, mode: "insensitive" } },
            { name: { contains: cleanQuery, mode: "insensitive" } }
          ]
        },
      });

      if (!product) {
        console.log(`[Dilewati] Folder "${folderName}": Tidak ada produk yang cocok di database untuk query "${cleanQuery}".`);
        skippedCount++;
        continue;
      }

      const ext = path.extname(imageFile);
      const newFileName = `img-${product.id}${ext}`;
      const destPath = path.join(publicImagesDir, newFileName);
      const srcFilePath = path.join(folderPath, imageFile);

      // Salin file fisik
      fs.copyFileSync(srcFilePath, destPath);
      const imageUrl = `/images/${newFileName}`;

      // Update database dengan path relatif
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl },
      });

      console.log(`[Berhasil] Foto dari "${srcFilePath}" disalin ke "${destPath}" dan diupdate ke database.`);

      updatedCount++;
    } catch (err) {
      console.log(`[Error] Folder "${folderName}" gagal diproses: ${err.message}`);
      skippedCount++;
    }
  }

  console.log("\n=== Sinkronisasi Selesai ===");
  console.log(`Total foto berhasil dipasang : ${updatedCount}`);
  console.log(`Folder dilewati / tak cocok  : ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
