import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from parent directory (don't override existing ones)
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: false });

const prisma = new PrismaClient();

const createAdminUser = async (
  email?: string,
  password?: string,
  name?: string
) => {
  const saltRounds = 12;

  if (!email || !password || !name) {
    console.error(
      "❌ ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME must be set in environment variables"
    );
    process.exit(1);
  }

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
};

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME;
  const email2 = process.env.ADMIN_EMAIL_2;
  const password2 = process.env.ADMIN_PASSWORD_2;
  const name2 = process.env.ADMIN_NAME_2;
  const usersToSeed = [
    { email, password, name },
    { email: email2, password: password2, name: name2 },
  ];

  usersToSeed.forEach(async (user) => {
    await createAdminUser(user.email, user.password, user.name);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
