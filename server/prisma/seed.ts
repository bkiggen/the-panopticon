import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env"), override: false });

const prisma = new PrismaClient();

const upsertAdminUser = async (email: string, name: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword: "magic-link-auth",
        isAdmin: true,
      },
    });
    console.log(`✅ Admin user created: ${email}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${email}`);
  }
};

async function main() {
  const admins = [
    { email: process.env.ADMIN_EMAIL, name: process.env.ADMIN_NAME },
    { email: process.env.ADMIN_EMAIL_2, name: process.env.ADMIN_NAME_2 },
  ];

  for (const { email, name } of admins) {
    if (email && name) {
      await upsertAdminUser(email, name);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
