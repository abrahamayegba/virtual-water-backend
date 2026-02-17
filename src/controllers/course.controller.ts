import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const courseController = {
  // Get all courses
  getCourses: async (_req: Request, res: Response) => {
    try {
      const courses = await prisma.course.findMany({
        include: { category: true, Quizzes: true },
      });
      res.status(200).json({ success: true, courses });
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // Create a course
  createCourse: async (req: Request, res: Response) => {
    try {
      const { title, description, categoryId, duration, createdById } =
        req.body;

      if (!createdById) {
        return res.status(400).json({
          message: "createdById is required",
        });
      }

      const course = await prisma.course.create({
        data: {
          title,
          description,
          categoryId,
          duration,
          createdById,
        },
      });

      res.status(201).json({ success: true, course });
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get single course by ID
  getCourseById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          category: true,
          CourseObjectives: true,
          Lessons: { include: { type: true } },
          Quizzes: {
            include: {
              Questions: {
                include: { Options: true },
              },
            },
          },
        },
      });

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.status(200).json({ success: true, course });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // courseController.ts
  getCoursesByCreator: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const courses = await prisma.course.findMany({
        where: {
          createdById: userId,
        },
        include: {
          category: true,
          Lessons: true,
          Quizzes: {
            include: {
              Questions: true,
            },
          },
          UserCourses: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json({ success: true, courses });
    } catch (error) {
      console.error("Error fetching trainer courses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Update course
  updateCourse: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, categoryId, duration, status } = req.body;

      const course = await prisma.course.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(categoryId !== undefined && { categoryId }),
          ...(duration !== undefined && { duration }),
          ...(status !== undefined && { status }),
        },
      });

      res.status(200).json({ success: true, course });
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Delete course
  deleteCourse: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const course = await prisma.course.delete({ where: { id } });
      res
        .status(200)
        .json({ success: true, message: "Course deleted", course });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
