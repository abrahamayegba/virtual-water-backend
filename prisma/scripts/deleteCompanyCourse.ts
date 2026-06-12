import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const companyId = "cmf155yb30001chjgj2sz6959";

  const courseIds = [
    "cmfy41paw003ichn8owpkyhw5",
    "cmfy41paq001tchn852ue8dno",
    "cmfy41pad0004chn8jxmegvpa",
  ];

  const result = await prisma.courseCompany.deleteMany({
    where: {
      companyId,
      courseId: {
        in: courseIds,
      },
    },
  });

  console.log(`Deleted ${result.count} company course assignments`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
