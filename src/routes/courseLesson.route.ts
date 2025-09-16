import { Router } from "express";
import { courseLessonController } from "../controllers/courseLesson.controller.ts";
import type { Request, Response } from "express";
import { upload } from "../middleware/upload.ts";
import fs from "fs";
import client from "../lib/filestack.ts";
import { prisma } from "../lib/prisma.ts";

export const courseLessonRoutes = Router();

courseLessonRoutes.post("/", courseLessonController.createLesson);
courseLessonRoutes.get("/", courseLessonController.getLessons);
courseLessonRoutes.get("/:id", courseLessonController.getLessonById);
courseLessonRoutes.get(
  "/:userCourseId/lessons",
  courseLessonController.getLessonsByUserCourseId
);

courseLessonRoutes.put("/:id", courseLessonController.updateLesson);
courseLessonRoutes.delete("/:id", courseLessonController.deleteLesson);
courseLessonRoutes.post(
  "/upload",
  upload.single("legionella-awareness-revised"),
  async (req: Request, res: Response) => {
    try {
      // Make sure lessonId is sent as a text field in form-data, not as a file field!
      const { lessonId } = req.body;

      if (!lessonId) {
        return res
          .status(400)
          .json({ message: "lessonId is required in form-data" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filePath = req.file.path;

      // Upload file from local disk to Filestack
      const result = await client.upload(filePath);
      const fileUrl = result.url;

      // Delete local temporary file
      fs.unlinkSync(filePath);

      // Update file URL in DB for lesson
      const updatedLesson = await prisma.courseLesson.update({
        where: { id: lessonId },
        data: { file: fileUrl },
      });

      res.json({ success: true, lesson: updatedLesson });
    } catch (error: any) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, error: error.message || "Upload failed" });
    }
  }
);
