import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const practiceControllers = {
  getPractices: async (req: Request, res: Response) => {
    try {
      const practices = await prisma.practice.findMany({
        include: {
          company: true,
          users: true,
        },
      });

      res.status(200).json({ success: true, practices });
    } catch (error) {
      console.error("Error fetching practices:", error);
      res
        .status(500)
        .json({ message: "Internal server error while fetching practices" });
    }
  },

  getPracticeById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const practice = await prisma.practice.findUnique({
        where: { id },
        include: {
          company: true,
          users: true,
        },
      });

      if (!practice) {
        return res.status(404).json({ message: "Practice not found" });
      }

      res.status(200).json({ success: true, practice });
    } catch (error) {
      console.error("Error fetching practice:", error);
      res
        .status(500)
        .json({ message: "Internal server error while fetching practice" });
    }
  },

  createPractice: async (req: Request, res: Response) => {
    try {
      const { practiceName, practiceNumber, companyId } = req.body;

      if (!practiceName || !companyId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const practice = await prisma.practice.create({
        data: {
          practiceName,
          practiceNumber,
          companyId,
        },
      });

      res.status(201).json({ success: true, practice });
    } catch (error) {
      console.error("Error creating practice:", error);
      res
        .status(500)
        .json({ message: "Internal server error while creating practice" });
    }
  },

  updatePractice: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { practiceName, practiceNumber } = req.body;

      const practice = await prisma.practice.update({
        where: { id },
        data: {
          practiceName,
          practiceNumber,
        },
      });

      res.status(200).json({
        success: true,
        message: "Practice updated",
        practice,
      });
    } catch (error) {
      console.error("Error updating practice:", error);
      res
        .status(500)
        .json({ message: "Internal server error while updating practice" });
    }
  },

  deletePractice: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const practice = await prisma.practice.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: "Practice deleted",
        practice,
      });
    } catch (error) {
      console.error("Error deleting practice:", error);
      res
        .status(500)
        .json({ message: "Internal server error while deleting practice" });
    }
  },
};
