import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../src/auth/utils";

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      name: "Dawn Lawrie",
      email: "dawn.lawrie@virtualservicesgroup.co.uk",
      password: "Dawn.Lawrie",
      companyId: "cmf155yb30001chjgj2sz6959",
      roleId: "cmeuae0qi0000chm032g9wp9f",
    },
    {
      name: "Calum Mclean",
      email: "calum.mclean@virtualservicesgroup.co.uk",
      password: "Calum.Mclean",
      companyId: "cmf155yb30001chjgj2sz6959",
      roleId: "cmeuae0qm0001chm0rh5gheq8",
    },
    {
      name: "Cameron Paterson",
      email: "cameron.paterson@virtualservicesgroup.co.uk",
      password: "Cameron.Paterson",
      companyId: "cmf155yb30001chjgj2sz6959",
      roleId: "cmeuae0qo0002chm0s7ojs8fi",
    },
    {
      name: "Bowzer Nintendo",
      email: "amoniussmoke@gmail.com",
      password: "Bowzer.Nintendo",
      companyId: "cmf155yb30001chjgj2sz6959",
      roleId: "cmf15el060001chpoyrpk5st2",
    },
    {
      name: "Virtual Water Admin",
      email: "virtualwatertest@virtualwatergroup.co.uk",
      password: "Virtual.Water",
      companyId: "cmf155yb30001chjgj2sz6959",
      roleId: "cmeuae0qo0002chm0s7ojs8fi",
    },
  ];

  for (const u of users) {
    const passwordHash = await hashPassword(u.password);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash }, // only update the hash
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        companyId: u.companyId,
        roleId: u.roleId,
        passwordSetAt: null, // explicitly keep null
      },
    });
    console.log(`User ${u.email} seeded`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
