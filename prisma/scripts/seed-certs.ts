import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // get all completed user courses with course + quiz
  const completedUserCourses = await prisma.userCourse.findMany({
    where: {
      completed: true,
    },
    include: {
      course: {
        include: {
          Quizzes: true,
        },
      },
    },
  });

  let issuedCount = 0;
  let skippedCount = 0;

  for (const uc of completedUserCourses) {
    const quiz = uc.course.Quizzes[0];
    const passingScore = quiz?.passingScore ?? 0;

    // must have passed
    if (uc.score < passingScore) {
      skippedCount++;
      continue;
    }

    // upsert to avoid duplicates
    await prisma.certificate.upsert({
      where: {
        userId_courseId: {
          userId: uc.userId,
          courseId: uc.courseId,
        },
      },
      update: {}, // do nothing if already exists
      create: {
        userId: uc.userId,
        courseId: uc.courseId,
        userCourseId: uc.id,
      },
    });

    issuedCount++;
  }

  console.log(`Certificates issued: ${issuedCount}`);
  console.log(`Skipped (did not pass): ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
