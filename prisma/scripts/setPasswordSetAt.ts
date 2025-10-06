import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = [
    "cmg6ij3140001chaotty5mv9y", // Dawn Lawrie
    "cmg6ij3920003chaoucnyh7ze", // Calum Mclean
    "cmg6ij3es0005chaoszsn5rv2", // Cameron Paterson
    "cmg6ij3nc0009chaome1guqbr", // Virtual Water Admin
  ];

  const courses = [
    "cmfy41pad0004chn8jxmegvpa", // Water Hygiene Training
    "cmfy41paq001tchn852ue8dno", // Electrical Safety Training
    "cmfy41paw003ichn8owpkyhw5", // First Aid Essentials
    "cmfy41pb30057chn83gbd3lqo", // Fire Safety Awareness
    "cmfy41pb9006wchn8obmmah0l", // Workplace Hazard Training
  ];

  console.log("Seeding user courses for all users (excluding Bowzer)...");

  const userCoursesData = users.flatMap((userId) =>
    courses.map((courseId) => ({
      userId,
      courseId,
      score: 0,
      completed: false,
    }))
  );

  await prisma.userCourse.createMany({
    data: userCoursesData,
    skipDuplicates: true, // avoids duplicates if run multiple times
  });

  console.log("User courses seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
