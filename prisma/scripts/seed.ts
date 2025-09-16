import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create Roles
  const adminRole = await prisma.role.create({
    data: {
      roleName: "Admin",
      roleDescription: "Admin role with full access",
    },
  });

  const instructorRole = await prisma.role.create({
    data: {
      roleName: "Instructor",
      roleDescription: "Can create and assign courses",
    },
  });

  const studentRole = await prisma.role.create({
    data: {
      roleName: "Student",
      roleDescription: "Can enroll in courses",
    },
  });

  // Create a Company
  const company = await prisma.company.create({
    data: {
      companyName: "Tech Academy",
      companyEmail: "info@techacademy.com",
      industry: "Education",
    },
  });

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: "Alice Admin",
      email: "alice@techacademy.com",
      roleId: adminRole.id,
      companyId: company.id,
    },
  });

  const instructor = await prisma.user.create({
    data: {
      name: "Bob Instructor",
      email: "bob@techacademy.com",
      roleId: instructorRole.id,
      companyId: company.id,
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Charlie Student",
      email: "charlie@techacademy.com",
      roleId: studentRole.id,
      companyId: company.id,
    },
  });

  // Create a Course Category
  const webCategory = await prisma.courseCategory.create({
    data: {
      categoryName: "Web Development",
    },
  });

  // Create a Course
  const course = await prisma.course.create({
    data: {
      title: "Introduction to React",
      description: "Learn the basics of React.js",
      categoryId: webCategory.id,
      duration: 120,
    },
  });

  // Add Course Objectives
  await prisma.courseObjective.createMany({
    data: [
      { objective: "Understand JSX", courseId: course.id },
      { objective: "Learn components", courseId: course.id },
      { objective: "Manage state", courseId: course.id },
    ],
  });

  // Assign course to student
  await prisma.userCourse.create({
    data: {
      userId: student.id,
      courseId: course.id,
      score: 0,
      completed: false,
      startedAt: new Date(),
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
