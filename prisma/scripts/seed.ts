import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  // Map of lesson IDs to their lesson numbers
  const lessonNumbers: Record<string, number> = {
    cmhvzev3m000jchvw6tgx1vqp: 1,
    cmhvzhdix000lchvwws5nr27c: 2,
    cmhvzkc3p000nchvw1dsdomqh: 3,
    cmhvzmze4000pchvwdlm38luo: 4,
    cmhvzp0yb000rchvw252xzq4p: 5,
    // add more as needed
  };

  for (const [lessonId, number] of Object.entries(lessonNumbers)) {
    await prisma.courseLesson.update({
      where: { id: lessonId },
      data: { lessonNumber: number },
    });
    console.log(`Updated lesson ${lessonId} to number ${number}`);
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
