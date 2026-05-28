import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const userId = "cmfdwv21r000rchkk5e32q56j";
  const newPassword = "alan.hart";

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: hashedPassword,
    },
  });

  console.log(`Password updated for user ${userId}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
