const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Cek apakah admin sudah ada
    const existing = await prisma.admin.findUnique({
      where: { email: 'admin@toko.com' }
    });

    if (existing) {
      const updated = await prisma.admin.update({
        where: { email: 'admin@toko.com' },
        data: { passwordHash: hashedPassword }
      });
      console.log('BERHASIL! Akun admin diperbarui:', updated.email);
    } else {
      const created = await prisma.admin.create({
        data: {
          email: 'admin@toko.com',
          passwordHash: hashedPassword,
        }
      });
      console.log('BERHASIL! Akun admin dibuat:', created.email);
    }
  } catch (e) {
    console.log('Error saat seeding:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();