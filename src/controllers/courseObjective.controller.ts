import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";

export const courseObjectiveController = {
  // POST /api/v1/course-objectives
  createObjective: async (req: Request, res: Response) => {
    try {
      const { objective, courseId } = req.body;
      if (!objective || !courseId) {
        return res
          .status(400)
          .json({ message: "objective and courseId are required" });
      }

      const newObjective = await prisma.courseObjective.create({
        data: { objective, courseId },
      });

      res.status(201).json({ success: true, objective: newObjective });
    } catch (error) {
      console.error("Error creating objective:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // GET /api/v1/course-objectives
  getObjectives: async (_: Request, res: Response) => {
    try {
      const objectives = await prisma.courseObjective.findMany({
        include: { course: true },
      });
      res.status(200).json({ success: true, objectives });
    } catch (error) {
      console.error("Error fetching objectives:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // GET /api/v1/course-objectives/:id
  getObjectiveById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objective = await prisma.courseObjective.findUnique({
        where: { id },
        include: { course: true },
      });

      if (!objective) {
        return res.status(404).json({ message: "Objective not found" });
      }

      res.status(200).json({ success: true, objective });
    } catch (error) {
      console.error("Error fetching objective:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // PUT /api/v1/course-objectives/:id
  updateObjective: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { objective, courseId } = req.body;

      const updated = await prisma.courseObjective.update({
        where: { id },
        data: { objective, courseId },
      });

      res.status(200).json({ success: true, objective: updated });
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Objective not found" });
      }
      console.error("Error updating objective:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // DELETE /api/v1/course-objectives/:id
  deleteObjective: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.courseObjective.delete({ where: { id } });
      res.status(200).json({ success: true, message: "Objective deleted" });
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Objective not found" });
      }
      console.error("Error deleting objective:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
