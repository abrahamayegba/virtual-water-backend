import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteUserDeep(userId: string) {
  try {
    // Delete UserCourseLesson progress
    await prisma.userCourseLesson.deleteMany({
      where: {
        userCourse: {
          userId: userId,
        },
      },
    });

    // Delete UserCourse certificates
    await prisma.certificate.deleteMany({
      where: {
        userId: userId,
      },
    });

    // Delete UserCourses
    await prisma.userCourse.deleteMany({
      where: {
        userId: userId,
      },
    });


    // Delete password resets
    await prisma.passwordReset.deleteMany({
      where: { userId },
    });

    // Delete sessions
    await prisma.session.deleteMany({
      where: { userId },
    });


    // Finally delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`User ${userId} and all related data deleted successfully.`);
  } catch (err) {
    console.error("Failed to delete user:", err);
  } finally {
    await prisma.$disconnect();
  }
}

// Example usage
const userId = "cmg6ij3es0005chaoszsn5rv2";
deleteUserDeep(userId);
