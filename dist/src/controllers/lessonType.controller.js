"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lessonTypeController = void 0;
const prisma_1 = require("../lib/prisma");
exports.lessonTypeController = {
    createLessonType: async (req, res) => {
        try {
            const { type } = req.body;
            if (!type)
                return res.status(400).json({ message: "type is required" });
            const newType = await prisma_1.prisma.lessonType.create({ data: { type } });
            res.status(201).json({ success: true, lessonType: newType });
        }
        catch (error) {
            console.error("Error creating lessonType:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    getLessonTypes: async (_, res) => {
        try {
            const types = await prisma_1.prisma.lessonType.findMany({
                include: { Lessons: true },
            });
            res.status(200).json({ success: true, lessonTypes: types });
        }
        catch (error) {
            console.error("Error fetching lessonTypes:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    getLessonTypeById: async (req, res) => {
        try {
            const { id } = req.params;
            const type = await prisma_1.prisma.lessonType.findUnique({
                where: { id: Number(id) },
                include: { Lessons: true },
            });
            if (!type)
                return res.status(404).json({ message: "LessonType not found" });
            res.status(200).json({ success: true, lessonType: type });
        }
        catch (error) {
            console.error("Error fetching lessonType:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    updateLessonType: async (req, res) => {
        try {
            const { id } = req.params;
            const { type } = req.body;
            const updated = await prisma_1.prisma.lessonType.update({
                where: { id: Number(id) },
                data: { type },
            });
            res.status(200).json({ success: true, lessonType: updated });
        }
        catch (error) {
            if (error.code === "P2025")
                return res.status(404).json({ message: "LessonType not found" });
            console.error("Error updating lessonType:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    deleteLessonType: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma_1.prisma.lessonType.delete({ where: { id: Number(id) } });
            res.status(200).json({ success: true, message: "LessonType deleted" });
        }
        catch (error) {
            if (error.code === "P2025")
                return res.status(404).json({ message: "LessonType not found" });
            console.error("Error deleting lessonType:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};
