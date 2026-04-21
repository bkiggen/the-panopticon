const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@drmovietimesmd.local';
  const password = 'admin123';
  const name = 'Admin User';

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        isAdmin: true,
      },
    });
    console.log('✅ Admin user created');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
  } else {
    console.log('ℹ️ Admin already exists');
  }

  await prisma.$disconnect();
}

createAdmin().catch(console.error);
