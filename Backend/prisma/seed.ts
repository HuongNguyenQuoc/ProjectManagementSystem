import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "huongquoc1";

async function main() {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "ADMIN" },
    create: {
      fullName: "Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`Admin user ready: ${admin.email} (role=${admin.role})`);
  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      `No ADMIN_PASSWORD env var was set — if this account was just created, its password is the default "${ADMIN_PASSWORD}". Change it after first login.`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
