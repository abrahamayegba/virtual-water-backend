import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const userIds = [
    "cmfdwv21r000rchkk5e32q56j",
    "cmg83g13t0029qu57f8l0t669",
    "cmggqir9l0001chp8ilenzl0k",
    "cmg6ij3920003chaoucnyh7ze",
    "cmg6ij3140001chaotty5mv9y",
    "id6",
  ];

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, name: true },
  });

  for (const user of users) {
    if (!user.name) continue;

    const parts = user.name.trim().split(" ");
    const first = parts[0];
    const last = parts.slice(1).join("") || "user";
    const newPassword = `${first}.${last}`.toLowerCase();

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    console.log(`✅ ${user.email}: password set to ${newPassword}`);
  }

  console.log("All done");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
