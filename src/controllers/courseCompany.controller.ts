import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Assign a course to a company
export async function assignCourseToCompany(req: Request, res: Response) {
  try {
    const { courseId, companyId, assignedById } = req.body;

    if (!courseId || !companyId || !assignedById) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if this course is already assigned to this company
    const existing = await prisma.courseCompany.findUnique({
      where: { courseId_companyId: { courseId, companyId } },
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Course already assigned to this company" });
    }

    // Create CourseCompany assignment
    const assignment = await prisma.courseCompany.create({
      data: {
        courseId,
        companyId,
        assignedById,
      },
    });

    return res.status(201).json({ assignment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to assign course" });
  }
}

// Get all course assignments for a company
export async function getCompanyCourses(req: Request, res: Response) {
  try {
    const { companyId } = req.params;
    if (!companyId)
      return res.status(400).json({ error: "companyId is required" });

    const assignments = await prisma.courseCompany.findMany({
      where: { companyId },
      include: { course: true, assignedBy: true },
    });

    return res.json({ assignments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch company courses" });
  }
}

// Optional: remove assignment
export async function removeCourseAssignment(req: Request, res: Response) {
  try {
    const { courseId, companyId } = req.body;
    if (!courseId || !companyId)
      return res.status(400).json({ error: "courseId and companyId required" });

    // Delete CourseCompany record
    await prisma.courseCompany.delete({
      where: { courseId_companyId: { courseId, companyId } },
    });

    // Optionally delete all related UserCourse records
    await prisma.userCourse.deleteMany({
      where: { courseId, user: { companyId } },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to remove course assignment" });
  }
}
