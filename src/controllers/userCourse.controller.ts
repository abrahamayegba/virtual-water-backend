import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const userCourseController = {
  createUserCourse: async (req: Request, res: Response) => {
    try {
      const { userId, courseId, score, startedAt, completed } = req.body;

      const existingUserCourse = await prisma.userCourse.findFirst({
        where: {
          userId,
          courseId,
        },
      });

      if (existingUserCourse) {
        // Update existing user course with new data
        const updatedUserCourse = await prisma.userCourse.update({
          where: { id: existingUserCourse.id },
          data: {
            score: score || existingUserCourse.score,
            startedAt: startedAt
              ? new Date(startedAt)
              : existingUserCourse.startedAt,
            completed: completed ?? existingUserCourse.completed,
          },
        });
        return res
          .status(200)
          .json({ success: true, userCourse: updatedUserCourse });
      }

      // Create new user course if none exists
      const userCourse = await prisma.userCourse.create({
        data: {
          userId,
          courseId,
          score: score || 0,
          startedAt: startedAt ? new Date(startedAt) : undefined,
          completed: completed || false,
        },
      });
      res.status(201).json({ success: true, userCourse });
    } catch (error) {
      console.error("Error creating user course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getUserCourses: async (_req: Request, res: Response) => {
    try {
      const userCourses = await prisma.userCourse.findMany({
        include: { user: true, course: true },
      });
      res.status(200).json({ success: true, userCourses });
    } catch (error) {
      console.error("Error fetching user courses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getUserCoursesByUserId: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params; // or req.query based on your route design
      const userCourses = await prisma.userCourse.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              category: true, // include course category
            },
          },
        },
      });
      res.status(200).json({ success: true, userCourses });
    } catch (error) {
      console.error("Error fetching user courses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getUserCourseById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userCourse = await prisma.userCourse.findUnique({
        where: { id },
        include: { user: true, course: true },
      });
      res.status(200).json({ success: true, userCourse });
    } catch (error) {
      console.error("Error fetching user course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get a userCourse by userId and courseId, without needing composite unique key
  getUserCourseByCourseId: async (req: Request, res: Response) => {
    try {
      const { userId, courseId } = req.params;
      const userCourse = await prisma.userCourse.findFirst({
        where: {
          userId,
          courseId,
        },
        include: {
          course: {
            include: {
              Quizzes: true,
              Lessons: true,
            },
          },
          user: true,
        },
      });
      if (!userCourse) {
        return res.status(404).json({ message: "User course not found" });
      }
      res.status(200).json({ success: true, userCourse });
    } catch (error) {
      console.error("Error fetching user course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getLessonsWithProgressByUserCourseId: async (req: Request, res: Response) => {
    try {
      const { userCourseId } = req.params;

      // 1. Get courseId from userCourse
      const userCourse = await prisma.userCourse.findUnique({
        where: { id: userCourseId },
        select: { courseId: true },
      });

      if (!userCourse) {
        return res.status(404).json({ message: "User course not found" });
      }

      // 2. Get all lessons for that course
      const lessons = await prisma.courseLesson.findMany({
        where: { courseId: userCourse.courseId },
        include: { type: true },
      });

      // 3. Get user progress for lessons
      const userCourseLessons = await prisma.userCourseLesson.findMany({
        where: { userCourseId },
        select: {
          lessonId: true,
          completed: true,
          startedAt: true,
          spentTime: true,
          completedAt: true,
        },
      });

      // 4. Map progress data by lessonId
      const progressMap = new Map(
        userCourseLessons.map((p) => [p.lessonId, p])
      );

      // 5. Combine lessons & progress
      const lessonsWithProgress = lessons.map((lesson) => {
        const progress = progressMap.get(lesson.id);
        return {
          ...lesson,
          progress: progress || {
            completed: false,
            startedAt: null,
            spentTime: 0,
            completedAt: null,
          },
        };
      });

      res.status(200).json({ success: true, lessons: lessonsWithProgress });
    } catch (error) {
      console.error("Error fetching lessons with progress:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateUserCourse: async (req: Request, res: Response) => {
    try {
      const { id } = req.params; // userCourse id
      const { userId, courseId, score, completed, completedAt } = req.body;
      const existing = await prisma.userCourse.findFirst({
        where: {
          userId,
          courseId,
        },
      });

      if (existing && existing.id !== id) {
        return res
          .status(400)
          .json({ message: "Course already assigned to this user" });
      }
      const updated = await prisma.userCourse.update({
        where: { id },
        data: {
          userId,
          courseId,
          score,
          completed,
          completedAt: completedAt ? new Date(completedAt) : undefined,
        },
      });

      res.status(200).json({ success: true, userCourse: updated });
    } catch (error) {
      console.error("Error updating user course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateUserCourseByUserId: async (req: Request, res: Response) => {
    try {
      const { userId, id } = req.params; // userId and userCourseId
      const { courseId, score, completed, completedAt } = req.body;

      // Make sure this userCourse belongs to this user
      const userCourse = await prisma.userCourse.findFirst({
        where: { id, userId },
      });

      if (!userCourse) {
        return res
          .status(404)
          .json({ success: false, message: "UserCourse not found" });
      }

      const updated = await prisma.userCourse.update({
        where: { id },
        data: {
          ...(courseId && { courseId }), // allow changing course
          ...(score !== undefined && { score }),
          ...(completed !== undefined && { completed }),
          ...(completedAt && { completedAt: new Date(completedAt) }),
        },
      });

      res.status(200).json({ success: true, userCourse: updated });
    } catch (error) {
      console.error("Error updating user course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteUserCourse: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userCourse = await prisma.userCourse.delete({ where: { id } });
      res
        .status(200)
        .json({ success: true, message: "User course deleted", userCourse });
    } catch (error) {
      console.error("Error deleting user course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
