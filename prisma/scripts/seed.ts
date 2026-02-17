import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  console.log("Seeding completed lessons for all completed courses...");

  // Fetch all UserCourses that are completed
  const completedCourses = await prisma.userCourse.findMany({
    where: { completed: true },
    include: { course: { include: { Lessons: true } } },
  });

  for (const uc of completedCourses) {
    const existingLessons = await prisma.userCourseLesson.findMany({
      where: { userCourseId: uc.id },
      select: { lessonId: true },
    });
    const existingLessonIds = existingLessons.map((l) => l.lessonId);

    // Only create lessons that don't already exist
    const lessonsToCreate = uc.course.Lessons.filter(
      (l) => !existingLessonIds.includes(l.id),
    );

    if (lessonsToCreate.length === 0) continue;

    const now = new Date();

    const createData = lessonsToCreate.map((lesson) => ({
      userCourseId: uc.id,
      lessonId: lesson.id,
      startedAt: now,
      completed: true,
      completedAt: uc.completedAt ?? now,
      spentTime: lesson.duration || 0,
    }));

    await prisma.userCourseLesson.createMany({
      data: createData,
      skipDuplicates: true,
    });

    console.log(
      `✅ UserCourse ${uc.id} - added ${createData.length} completed lessons`,
    );
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });