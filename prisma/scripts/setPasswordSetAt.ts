import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating all users to set passwordSetAt = null...");

  const updated = await prisma.user.updateMany({
    data: { passwordSetAt: null },
  });

  console.log(`Updated ${updated.count} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
