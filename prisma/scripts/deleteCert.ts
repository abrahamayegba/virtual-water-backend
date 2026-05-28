import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const certificateId = "cml84e0lj0019chmkc13sucgu";

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
