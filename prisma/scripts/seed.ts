import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userCourseId = "cmhw2ae2p000hch2k5vpobyvh"; // replace with the actual userCourseId

  // update all lessons for this user course
  const updated = await prisma.userCourseLesson.updateMany({
    where: {
      userCourseId,
    },
    data: {
      completed: false,
      completedAt: null,
      startedAt: null,
      spentTime: 0,
    },
  });

  console.log(`Updated ${updated.count} lessons to completed: false`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
