import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const questionController = {
  // POST /api/v1/questions
  createQuestion: async (req: Request, res: Response) => {
    try {
      const { question, quizId } = req.body;
      if (!question || !quizId) {
        return res
          .status(400)
          .json({ message: "question and quizId are required" });
      }

      const newQuestion = await prisma.question.create({
        data: { question, quizId },
      });

      res.status(201).json({ success: true, question: newQuestion });
    } catch (error: any) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // GET /api/v1/questions
  getQuestions: async (_: Request, res: Response) => {
    try {
      const questions = await prisma.question.findMany({
        include: { Options: true },
      });
      res.status(200).json({ success: true, questions });
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // GET /api/v1/questions/:id
  getQuestionById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const question = await prisma.question.findUnique({
        where: { id },
        include: { Options: true },
      });

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      res.status(200).json({ success: true, question });
    } catch (error) {
      console.error("Error fetching question:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // PUT /api/v1/questions/:id
  updateQuestion: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { question, quizId } = req.body;

      const updatedQuestion = await prisma.question.update({
        where: { id },
        data: { question, quizId },
      });

      res.status(200).json({ success: true, question: updatedQuestion });
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Question not found" });
      }
      console.error("Error updating question:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // DELETE /api/v1/questions/:id
  deleteQuestion: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.question.delete({ where: { id } });
      res.status(200).json({ success: true, message: "Question deleted" });
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Question not found" });
      }
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
