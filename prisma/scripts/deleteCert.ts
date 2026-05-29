import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const certificateId = "cmpqzhx2y0003chboskgr8gs3";

  await prisma.certificate.delete({
    where: {
      id: certificateId,
    },
  });

  console.log(`Certificate deleted: ${certificateId}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
