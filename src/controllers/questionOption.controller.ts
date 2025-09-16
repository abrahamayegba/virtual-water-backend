import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const questionOptionController = {
  // POST /api/v1/question-options
  createOption: async (req: Request, res: Response) => {
    try {
      const { option, isCorrect, questionId } = req.body;
      if (!option || typeof isCorrect !== "boolean" || !questionId) {
        return res
          .status(400)
          .json({ message: "option, isCorrect, and questionId are required" });
      }

      const newOption = await prisma.questionOption.create({
        data: { option, isCorrect, questionId },
      });

      res.status(201).json({ success: true, option: newOption });
    } catch (error: any) {
      console.error("Error creating option:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // GET /api/v1/question-options
  getOptions: async (_: Request, res: Response) => {
    try {
      const options = await prisma.questionOption.findMany({
        include: { question: true },
      });
      res.status(200).json({ success: true, options });
    } catch (error) {
      console.error("Error fetching options:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // GET /api/v1/question-options/:id
  getOptionById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const option = await prisma.questionOption.findUnique({
        where: { id },
        include: { question: true },
      });

      if (!option) {
        return res.status(404).json({ message: "Option not found" });
      }

      res.status(200).json({ success: true, option });
    } catch (error) {
      console.error("Error fetching option:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // PUT /api/v1/question-options/:id
  updateOption: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { option, isCorrect, questionId } = req.body;

      const updatedOption = await prisma.questionOption.update({
        where: { id },
        data: { option, isCorrect, questionId },
      });

      res.status(200).json({ success: true, option: updatedOption });
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Option not found" });
      }
      console.error("Error updating option:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // DELETE /api/v1/question-options/:id
  deleteOption: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.questionOption.delete({ where: { id } });
      res.status(200).json({ success: true, message: "Option deleted" });
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Option not found" });
      }
      console.error("Error deleting option:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
