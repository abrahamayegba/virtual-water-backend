"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizController = void 0;
const prisma_1 = require("../lib/prisma");
exports.quizController = {
    // POST /api/v1/quizzes
    createQuiz: async (req, res) => {
        try {
            const { title, courseId, passingScore } = req.body;
            if (!title || !courseId || typeof passingScore !== "number") {
                return res
                    .status(400)
                    .json({ message: "title, courseId and passingScore are required" });
            }
            const quiz = await prisma_1.prisma.quiz.create({
                data: { title, courseId, passingScore },
            });
            res.status(201).json({ success: true, quiz });
        }
        catch (error) {
            console.error("Error creating quiz:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // GET /api/v1/quizzes
    getQuizzes: async (_, res) => {
        try {
            const quizzes = await prisma_1.prisma.quiz.findMany({
                include: { course: true, Questions: true },
            });
            res.status(200).json({ success: true, quizzes });
        }
        catch (error) {
            console.error("Error fetching quizzes:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // GET /api/v1/quizzes/:id
    getQuizById: async (req, res) => {
        try {
            const { id } = req.params;
            const quiz = await prisma_1.prisma.quiz.findUnique({
                where: { id },
                include: { course: true, Questions: { include: { Options: true } } },
            });
            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            res.status(200).json({ success: true, quiz });
        }
        catch (error) {
            console.error("Error fetching quiz:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // GET /api/v1/quizzes/course/:courseId
    getQuizzesByCourseId: async (req, res) => {
        try {
            const { courseId } = req.params;
            if (!courseId) {
                return res.status(400).json({ message: "courseId is required" });
            }
            const quizzes = await prisma_1.prisma.quiz.findMany({
                where: { courseId },
                include: { course: true, Questions: { include: { Options: true } } },
            });
            res.status(200).json({ success: true, quizzes });
        }
        catch (error) {
            console.error("Error fetching quizzes by courseId:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // PUT /api/v1/quizzes/:id
    updateQuiz: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, courseId, passingScore } = req.body;
            const quiz = await prisma_1.prisma.quiz.update({
                where: { id },
                data: { title, courseId, passingScore },
            });
            res.status(200).json({ success: true, quiz });
        }
        catch (error) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Quiz not found" });
            }
            console.error("Error updating quiz:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // DELETE /api/v1/quizzes/:id
    deleteQuiz: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma_1.prisma.quiz.delete({ where: { id } });
            res.status(200).json({ success: true, message: "Quiz deleted" });
        }
        catch (error) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Quiz not found" });
            }
            console.error("Error deleting quiz:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};
