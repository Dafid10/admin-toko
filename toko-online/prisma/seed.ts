import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const industri = await prisma.category.upsert({
    where: { slug: "keranjang-industri" },
    update: {},
    create: { name: "Keranjang Industri & Box", slug: "keranjang-industri" },
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Box Container / Keranjang Industri Rapat Hanata 3101",
        slug: "box-container-keranjang-industri-rapat-hanata-3101",
        description: "Ukuran lebih besar hampir 3/4 badan manusia, bagian bawah ada rodanya. Cocok untuk industri dan penyimpanan besar.",
        price: 250000, 
        stock: 50,
        imageUrl: null,
        categoryId: industri.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed data produk Hanata 3101 berhasil dimasukkan.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());