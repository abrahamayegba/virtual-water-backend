import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userCourseId = "cmg7toqzx0025qu57u5xh0t2p";

  // 1. Mark all lessons as completed
  const lessonsUpdate = await prisma.userCourseLesson.updateMany({
    where: {
      userCourseId,
    },
    data: {
      completed: false,
      startedAt: null,
      completedAt: null,
      spentTime: 0,
    },
  });

  //   // 2. Mark the course as completed
  await prisma.userCourse.update({
    where: { id: userCourseId },
    data: {
      completed: false,
      score: 0,
      completedAt: null,
    },
  });

  console.log(`Updated ${lessonsUpdate.count} lessons to completed: false`);
  console.log(`User course marked as completed`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
