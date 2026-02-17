import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userCourseId = "cmhw089te0003chg44wy18qhr";

  // 1. Mark all lessons as completed
  const lessonsUpdate = await prisma.userCourseLesson.updateMany({
    where: {
      userCourseId,
    },
    data: {
      completed: true,
      startedAt: new Date(),
      completedAt: new Date(),
      spentTime: 60,
    },
  });

  //   // 2. Mark the course as completed
  await prisma.userCourse.update({
    where: { id: userCourseId },
    data: {
      completed: false,
      completedAt: null,
    },
  });

  console.log(`Updated ${lessonsUpdate.count} lessons to completed: true`);
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
