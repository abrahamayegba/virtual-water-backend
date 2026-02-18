// prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const courseId = "cmhvxn11i0009chvwz1rixhjv";

  await prisma.courseLesson.updateMany({
    where: {
      courseId,
    },
    data: {
      lessonNumber: null,
    },
  });

  await prisma.courseLesson.update({
    where: { id: "cml835ltt006tch80shj738ag" }, // Part 1
    data: {
      title: "Background to Legionnaires Disease",
      lessonNumber: 1,
    },
  });

  await prisma.courseLesson.update({
    where: { id: "cml835q4h006vch80l0ybks51" }, // Part 2
    data: {
      title: "Legislation - Health and Safety Law",
      lessonNumber: 2,
    },
  });

  await prisma.courseLesson.update({
    where: { id: "cml835sp0006xch80o8844kn8" }, // Part 3
    data: {
      title: "Medical Aspects",
      lessonNumber: 3,
    },
  });

  await prisma.courseLesson.update({
    where: { id: "cml835vxe006zch80tcjnutac" }, // Part 4
    data: {
      title: "Managing Water Systems",
      lessonNumber: 4,
    },
  });

  await prisma.courseLesson.update({
    where: { id: "cml835zfa0071ch80qj4eyczw" }, // Part 5
    data: {
      title: "Sampling and Biofilms",
      lessonNumber: 5,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
