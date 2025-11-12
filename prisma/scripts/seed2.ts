import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = "SuperMushroom1!";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Update all users
  await prisma.user.updateMany({
    data: {
      passwordHash: hashedPassword,
      passwordSetAt: null,
    },
  });

  console.log("All users' passwords reset and passwordSetAt cleared.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
