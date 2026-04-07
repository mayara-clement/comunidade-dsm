/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.FOUNDER_EMAIL;
  const password = process.env.FOUNDER_PASSWORD;
  const name = process.env.FOUNDER_NAME ?? "Fundador";

  if (!email || !password) {
    console.warn(
      "FOUNDER_EMAIL e FOUNDER_PASSWORD não definidos — pulando seed do fundador.",
    );
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Fundador já existe:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: "FOUNDER",
      membershipStatus: "APPROVED",
    },
  });

  console.log("Fundador criado:", email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
