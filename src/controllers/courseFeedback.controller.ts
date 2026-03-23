import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const feedbackController = {
  // POST /api/v1/feedback
  submit: async (req: Request, res: Response) => {
    try {
      const { courseId, message, userId } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      if (!courseId || !message?.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      // make sure the user is actually enrolled in this course
      const enrolled = await prisma.userCourse.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });

      if (!enrolled) {
        return res.status(403).json({
          success: false,
          message: "You are not enrolled in this course",
        });
      }

      const feedback = await prisma.courseFeedback.create({
        data: { userId, courseId, message: message.trim() },
      });

      return res.status(201).json({ success: true, feedback });
    } catch (error) {
      console.error("Feedback submit error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  // GET /api/v1/feedback/:courseId  (admin use)
  getByCourse: async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;

      const feedback = await prisma.courseFeedback.findMany({
        where: { courseId },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({ success: true, feedback });
    } catch (error) {
      console.error("Feedback fetch error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};
