import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@geneses.example").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    create: { name: "Geneses Admin", email, passwordHash, role: "ADMIN", kycStatus: "VERIFIED" },
    update: {},
  });
  console.log(`Admin ready: ${email}`);
}

main().finally(() => prisma.$disconnect());
