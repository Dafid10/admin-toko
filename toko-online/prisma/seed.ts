import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const dapur = await prisma.category.upsert({
    where: { slug: "kebutuhan-dapur" },
    update: {},
    create: { name: "Kebutuhan Dapur", slug: "kebutuhan-dapur" },
  });
  const rumahTangga = await prisma.category.upsert({
    where: { slug: "peralatan-rumah-tangga" },
    update: {},
    create: { name: "Peralatan Rumah Tangga", slug: "peralatan-rumah-tangga" },
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Panci Set Anti Lengket 3 Ukuran",
        slug: "panci-set-anti-lengket-3-ukuran",
        description: "Set panci anti lengket 3 ukuran, cocok untuk kompor gas maupun induksi.",
        price: 285000,
        stock: 25,
        imageUrl: null,
        categoryId: dapur.id,
      },
      {
        name: "Rice Cooker Digital 1.8L",
        slug: "rice-cooker-digital-1-8l",
        description: "Rice cooker digital dengan 6 mode masak, kapasitas 1.8 liter.",
        price: 349000,
        stock: 15,
        imageUrl: null,
        categoryId: dapur.id,
      },
      {
        name: "Rak Sepatu Susun 5 Lipat",
        slug: "rak-sepatu-susun-5-lipat",
        description: "Rak sepatu 5 susun, bahan besi kokoh, mudah dilipat untuk disimpan.",
        price: 175000,
        stock: 30,
        imageUrl: null,
        categoryId: rumahTangga.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
