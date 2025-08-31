import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME;

  if (!email || !password || !name) {
    console.error(
      "❌ ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME must be set in environment variables"
    );
    process.exit(1);
  }

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
    console.log("✅ Admin user created");
  } else {
    console.log("ℹ️ Admin already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
