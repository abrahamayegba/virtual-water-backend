import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";

export const courseLessonController = {
  // create lesson
  createLesson: async (req: Request, res: Response) => {
    try {
      const { title, content, typeId, duration, file, courseId } = req.body;
      if (!title || !content || !typeId || !duration || !courseId) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) return res.status(404).json({ message: "Course not found" });

      const lessonType = await prisma.lessonType.findUnique({
        where: { id: Number(typeId) },
      });
      if (!lessonType)
        return res.status(404).json({ message: "Lesson type not found" });

      const lesson = await prisma.courseLesson.create({
        data: {
          title,
          content,
          typeId: Number(typeId),
          duration: Number(duration),
          file: file ?? null,
          courseId,
        },
      });

      res.status(201).json({ success: true, lesson });
    } catch (error) {
      console.error("Error creating lesson:", error);
      res
        .status(500)
        .json({ message: "Internal server error while creating lesson" });
    }
  },

  // get all lessons (optionally by course)
  getLessons: async (req: Request, res: Response) => {
    try {
      const { courseId } = req.query;

      const where = courseId ? { courseId: String(courseId) } : {};
      const lessons = await prisma.courseLesson.findMany({
        where,
        include: { type: true, course: true },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json({ success: true, lessons });
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res
        .status(500)
        .json({ message: "Internal server error while fetching lessons" });
    }
  },

  // get single lesson
  getLessonById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const lesson = await prisma.courseLesson.findUnique({
        where: { id },
        include: { type: true, course: true },
      });
      if (!lesson) return res.status(404).json({ message: "Lesson not found" });
      res.status(200).json({ success: true, lesson });
    } catch (error) {
      console.error("Error fetching lesson:", error);
      res
        .status(500)
        .json({ message: "Internal server error while fetching lesson" });
    }
  },

  getLessonsByUserCourseId: async (req: Request, res: Response) => {
    const { userCourseId } = req.params;
    const userCourse = await prisma.userCourse.findUnique({
      where: { id: userCourseId },
    });
    if (!userCourse)
      return res.status(404).json({ error: "UserCourse not found" });

    const lessons = await prisma.courseLesson.findMany({
      where: { courseId: userCourse.courseId },
      include: { type: true, course: true },
    });

    res.json({ success: true, lessons });
  },

  updateLesson: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, content, typeId, duration, file, courseId } = req.body;

      const lesson = await prisma.courseLesson.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content }),
          ...(typeId !== undefined && { typeId: Number(typeId) }),
          ...(duration !== undefined && { duration: Number(duration) }),
          ...(file && { file }),
          ...(courseId && { courseId }),
        },
      });

      res.status(200).json({ success: true, lesson });
    } catch (error) {
      console.error("Error updating lesson:", error);
      res
        .status(500)
        .json({ message: "Internal server error while updating lesson" });
    }
  },

  // delete lesson
  deleteLesson: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.courseLesson.delete({ where: { id } });
      res.status(200).json({ success: true, message: "Lesson deleted" });
    } catch (error) {
      console.error("Error deleting lesson:", error);
      res
        .status(500)
        .json({ message: "Internal server error while deleting lesson" });
    }
  },
};
