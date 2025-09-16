"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseController = void 0;
const prisma_1 = require("../lib/prisma");
exports.courseController = {
    // Get all courses
    getCourses: async (_req, res) => {
        try {
            const courses = await prisma_1.prisma.course.findMany({
                include: { category: true, Quizzes: true },
            });
            res.status(200).json({ success: true, courses });
        }
        catch (error) {
            console.error("Error fetching courses:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // Create a course
    createCourse: async (req, res) => {
        try {
            const { title, description, categoryId, duration } = req.body;
            const course = await prisma_1.prisma.course.create({
                data: { title, description, categoryId, duration },
            });
            res.status(201).json({ success: true, course });
        }
        catch (error) {
            console.error("Error creating course:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // Get single course by ID
    getCourseById: async (req, res) => {
        try {
            const { id } = req.params;
            const course = await prisma_1.prisma.course.findUnique({
                where: { id },
                include: { category: true, Lessons: true, Quizzes: true },
            });
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
            res.status(200).json({ success: true, course });
        }
        catch (error) {
            console.error("Error fetching course:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // Update course
    updateCourse: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, description, categoryId, duration } = req.body;
            const course = await prisma_1.prisma.course.update({
                where: { id },
                data: { title, description, categoryId, duration },
            });
            res.status(200).json({ success: true, course });
        }
        catch (error) {
            console.error("Error updating course:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // Delete course
    deleteCourse: async (req, res) => {
        try {
            const { id } = req.params;
            const course = await prisma_1.prisma.course.delete({ where: { id } });
            res
                .status(200)
                .json({ success: true, message: "Course deleted", course });
        }
        catch (error) {
            console.error("Error deleting course:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};
