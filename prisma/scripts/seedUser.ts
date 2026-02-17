import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const courseId = "cmhvxn11i0009chvwz1rixhjv";

  const userIds = ["cmg6ij3hn0007chaov4qsf30c"];

  for (const userId of userIds) {
    const existing = await prisma.userCourse.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (existing) {
      console.log(`⏭️  UserCourse already exists for ${userId}`);
      continue;
    }

    await prisma.userCourse.create({
      data: {
        userId,
        courseId,
        score: 0,
        completed: false,
        startedAt: new Date(),
      },
    });

    console.log(`✅ UserCourse created for ${userId}`);
  }

  console.log("All done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   const courseId = "cmhvxn11i0009chvwz1rixhjv";
//   const userId = "cmg6ij3hn0007chaov4qsf30c";

//   const deleted = await prisma.userCourse.deleteMany({
//     where: {
//       userId,
//       courseId,
//     },
//   });

//   if (deleted.count === 0) {
//     console.log("⏭️  No UserCourse found to delete");
//   } else {
//     console.log(`🗑️  Deleted ${deleted.count} UserCourse record(s)`);
//   }
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
