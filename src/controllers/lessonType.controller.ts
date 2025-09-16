import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const lessonTypeController = {
  createLessonType: async (req: Request, res: Response) => {
    try {
      const { type } = req.body;
      if (!type) return res.status(400).json({ message: "type is required" });

      const newType = await prisma.lessonType.create({ data: { type } });
      res.status(201).json({ success: true, lessonType: newType });
    } catch (error) {
      console.error("Error creating lessonType:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getLessonTypes: async (_: Request, res: Response) => {
    try {
      const types = await prisma.lessonType.findMany({
        include: { Lessons: true },
      });
      res.status(200).json({ success: true, lessonTypes: types });
    } catch (error) {
      console.error("Error fetching lessonTypes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getLessonTypeById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const type = await prisma.lessonType.findUnique({
        where: { id: Number(id) },
        include: { Lessons: true },
      });
      if (!type)
        return res.status(404).json({ message: "LessonType not found" });
      res.status(200).json({ success: true, lessonType: type });
    } catch (error) {
      console.error("Error fetching lessonType:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateLessonType: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { type } = req.body;

      const updated = await prisma.lessonType.update({
        where: { id: Number(id) },
        data: { type },
      });

      res.status(200).json({ success: true, lessonType: updated });
    } catch (error: any) {
      if (error.code === "P2025")
        return res.status(404).json({ message: "LessonType not found" });
      console.error("Error updating lessonType:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteLessonType: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.lessonType.delete({ where: { id: Number(id) } });
      res.status(200).json({ success: true, message: "LessonType deleted" });
    } catch (error: any) {
      if (error.code === "P2025")
        return res.status(404).json({ message: "LessonType not found" });
      console.error("Error deleting lessonType:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
