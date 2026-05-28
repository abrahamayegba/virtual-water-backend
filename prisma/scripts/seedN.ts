import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.company.update({
    where: {
      id: "cmpmqnn1w0000chu0i1gtt9co",
    },
    data: {
      maxUsers: 182,
    },
  });

  console.log("Company maxUsers set to 182");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
