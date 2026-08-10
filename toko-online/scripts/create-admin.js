const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@toko.com';
  const password = 'admin123';
  
  console.log(`Checking if admin with email ${email} exists...`);
  
  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('Admin already exists. Updating password...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    await prisma.admin.update({
      where: { email },
      data: { passwordHash },
    });
    console.log('Admin password updated successfully.');
  } else {
    console.log('Creating new admin...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    await prisma.admin.create({
      data: {
        email,
        passwordHash,
      },
    });
    console.log('Admin created successfully.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
