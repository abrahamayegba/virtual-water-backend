import { Router } from "express";
import { courseLessonController } from "../controllers/courseLesson.controller";
import type { Request, Response } from "express";
import { upload } from "../middleware/upload";
import { prisma } from "../lib/prisma";

export const courseLessonRoutes = Router();

courseLessonRoutes.post("/", courseLessonController.createLesson);
courseLessonRoutes.get("/", courseLessonController.getLessons);
courseLessonRoutes.get("/:id", courseLessonController.getLessonById);
courseLessonRoutes.get(
  "/:userCourseId/lessons",
  courseLessonController.getLessonsByUserCourseId,
);

courseLessonRoutes.put("/:id", courseLessonController.updateLesson);
courseLessonRoutes.delete(
  "/course/:courseId",
  courseLessonController.deleteLessonsByCourseId,
);
courseLessonRoutes.delete("/:id", courseLessonController.deleteLesson);
courseLessonRoutes.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const { lessonId } = req.body;

      if (!lessonId) {
        return res.status(400).json({ message: "lessonId is required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = (req.file as any).location; // 👈 S3 URL

      const updatedLesson = await prisma.courseLesson.update({
        where: { id: lessonId },
        data: { file: fileUrl },
      });

      res.json({ success: true, lesson: updatedLesson });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  },
);
