import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const newPdfUrl =
    "https://virtualwaterelearning.s3.eu-west-1.amazonaws.com/legionella-awareness-revised.pdf";

  await prisma.courseLesson.updateMany({
    where: { typeId: { in: [1, 4] } },
    data: { file: newPdfUrl },
  });

  console.log("PDF and PPT lessons updated successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
