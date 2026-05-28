import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.company.update({
    where: { id: "cmpmqnn1w0000chu0i1gtt9co" },
    data: {
      logoUrl:
        "https://virtualwaterelearning.s3.eu-west-1.amazonaws.com/company_logos/vets-for-pets_logo_core-green-and-dark-teal_rgb-1.png",
    },
  });

  // await prisma.company.update({
  //   where: { id: "cmf155yb30001chjgj2sz6959" },
  //   data: {
  //     logoUrl:
  //       "https://virtualwaterelearning.s3.eu-west-1.amazonaws.com/company_logos/virtuallogo.png",
  //   },
  // });

  console.log("logos updated");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
