import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = "SuperMushroom1!";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // find all users missing a password hash
  const usersWithoutPassword = await prisma.user.findMany({
    where: { passwordHash: null },
  });

  console.log(`Found ${usersWithoutPassword.length} users without password`);

  for (const user of usersWithoutPassword) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });
    console.log(`Updated user ${user.email}`);
  }
}

main()
  .then(() => {
    console.log("Done setting default passwords");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
