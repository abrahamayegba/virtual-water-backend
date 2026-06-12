import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.company.update({
    where: { id: "cmkpotue00000chuoml5l4ti6" },
    data: {
      maxUsers: 7,
    },
  });

  console.log("Company updated");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
