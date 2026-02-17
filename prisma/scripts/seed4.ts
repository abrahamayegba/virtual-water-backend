import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = "cmg6ij3hn0007chaov4qsf30c";

  // 1️⃣ grab ANY 5 courses
  const courses = await prisma.course.findMany({
    take: 10,
    orderBy: { createdAt: "asc" }, // deterministic, but still "any 5"
    select: { id: true },
  });

  if (courses.length === 0) {
    console.log("No courses found");
    return;
  }

  // 2️⃣ update ONLY those 5
  const result = await prisma.course.updateMany({
    where: {
      id: { in: courses.map((c) => c.id) },
    },
    data: {
      createdById: userId,
    },
  });

  console.log(`Updated ${result.count} courses`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
