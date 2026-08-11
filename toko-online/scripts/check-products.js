const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.product.updateMany({
    where: { isActive: false },
    data: { isActive: true }
  });
  console.log(`Updated ${result.count} products to isActive: true`);
  
  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, imageUrl: true, isActive: true }
  });
  console.log("Current Products in DB:");
  console.table(products);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
