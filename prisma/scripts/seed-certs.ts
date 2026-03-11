import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { email: "dawn.lawrie@virtualservicesgroup.co.uk" },
    data: { roleId: "cmf15el060001chpoyrpk5st2" },
  });

  console.log("Dawn Lawrie has been updated to Super Admin using role ID");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
