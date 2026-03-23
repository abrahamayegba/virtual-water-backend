import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.company.update({
    where: { id: "cmkpotue00000chuoml5l4ti6" },
    data: {
      logoUrl:
        "https://virtualwaterelearning.s3.eu-west-1.amazonaws.com/company_logos/petsathome.png",
    },
  });

  await prisma.company.update({
    where: { id: "cmf155yb30001chjgj2sz6959" },
    data: {
      logoUrl:
        "https://virtualwaterelearning.s3.eu-west-1.amazonaws.com/company_logos/virtuallogo.png",
    },
  });

  console.log("logos updated");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
