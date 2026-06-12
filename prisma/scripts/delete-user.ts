import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteUser(userId: string) {
  await prisma.userCourseLesson.deleteMany({
    where: {
      userCourse: { userId },
    },
  });

  await prisma.certificate.deleteMany({
    where: { userId },
  });

  await prisma.userCourse.deleteMany({
    where: { userId },
  });

  await prisma.courseFeedback.deleteMany({
    where: { userId },
  });

  await prisma.session.deleteMany({
    where: { userId },
  });

  await prisma.passwordReset.deleteMany({
    where: { userId },
  });

  await prisma.user.delete({
    where: { id: userId },
  });
}

async function deleteUsersDeep(userIds: string[]) {
  try {
    for (const userId of userIds) {
      await deleteUser(userId);
    }

    console.log(`Deleted users: ${userIds.join(", ")}`);
  } catch (err) {
    console.error("Bulk delete failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

// run
deleteUsersDeep([
  "cmppp10fx0005chu05xebl5wt",
  "cmpppu60p0001qv5hq025bq5h",
  "cmppsnwni000tqv5hspix9238",
  "cmpqr0a1b0014qv5hopbmadj9",
  "cmpr0bn950003qv23urqdl969",
]);
