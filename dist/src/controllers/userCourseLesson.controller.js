"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCourseLessonController = void 0;
const prisma_1 = require("../lib/prisma");
exports.userCourseLessonController = {
    // POST /api/v1/user-course-lessons
    createUserCourseLesson: async (req, res) => {
        try {
            const { userCourseId, lessonId, startedAt, spentTime, completed, completedAt, } = req.body;
            if (!userCourseId || !lessonId) {
                return res
                    .status(400)
                    .json({ message: "userCourseId and lessonId are required" });
            }
            const newUserCourseLesson = await prisma_1.prisma.userCourseLesson.create({
                data: {
                    userCourseId,
                    lessonId,
                    startedAt,
                    spentTime,
                    completed,
                    completedAt,
                },
            });
            res
                .status(201)
                .json({ success: true, userCourseLesson: newUserCourseLesson });
        }
        catch (error) {
            console.error("Error creating userCourseLesson:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // GET /api/v1/user-course-lessons
    getUserCourseLessons: async (_, res) => {
        try {
            const lessons = await prisma_1.prisma.userCourseLesson.findMany({
                include: { userCourse: true, lesson: true },
            });
            res.status(200).json({ success: true, userCourseLessons: lessons });
        }
        catch (error) {
            console.error("Error fetching userCourseLessons:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // GET /api/v1/user-course-lessons/:id
    getUserCourseLessonById: async (req, res) => {
        try {
            const { id } = req.params;
            const lesson = await prisma_1.prisma.userCourseLesson.findUnique({
                where: { id },
                include: { userCourse: true, lesson: true },
            });
            if (!lesson) {
                return res.status(404).json({ message: "UserCourseLesson not found" });
            }
            res.status(200).json({ success: true, userCourseLesson: lesson });
        }
        catch (error) {
            console.error("Error fetching userCourseLesson:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // GET /api/v1/user-course-lessons/user/:userId
    getUserCourseLessonsByUserId: async (req, res) => {
        try {
            const { userId } = req.params;
            const lessons = await prisma_1.prisma.userCourseLesson.findMany({
                where: {
                    userCourse: {
                        userId, // filter by user
                    },
                },
                include: {
                    userCourse: {
                        include: {
                            course: true, // so you can show course title etc.
                        },
                    },
                    lesson: true,
                },
            });
            res.status(200).json({ success: true, userCourseLessons: lessons });
        }
        catch (error) {
            console.error("Error fetching lessons by userId:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // GET /api/v1/user-course-lessons/user-course/:userCourseId
    getUserCourseLessonsByUserCourseId: async (req, res) => {
        try {
            const { userCourseId } = req.params;
            const lessons = await prisma_1.prisma.userCourseLesson.findMany({
                where: { userCourseId },
                include: { lesson: true }, // Include lesson details
            });
            res.status(200).json({ success: true, userCourseLessons: lessons });
        }
        catch (error) {
            console.error("Error fetching lessons by userCourseId:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // GET /api/v1/user-course-lessons/user-course/:userCourseId/lesson/:lessonId
    getUserCourseLessonByUserCourseAndLesson: async (req, res) => {
        try {
            const { userCourseId, lessonId } = req.params;
            const lesson = await prisma_1.prisma.userCourseLesson.findFirst({
                where: {
                    userCourseId,
                    lessonId,
                },
            });
            res.status(200).json({ success: true, userCourseLesson: lesson });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // GET /api/v1/user-course-lessons/user/:userId/completed-courses
    getCompletedCoursesByUserId: async (req, res) => {
        try {
            const { userId } = req.params;
            // Get all lessons for courses this user is enrolled in
            const coursesWithLessons = await prisma_1.prisma.course.findMany({
                include: {
                    Lessons: true, // all lessons in each course
                },
            });
            // Get user course lessons (progress)
            const userLessons = await prisma_1.prisma.userCourseLesson.findMany({
                where: { userCourse: { userId } },
                include: { lesson: true },
            });
            // Make a lookup of completed lessons by lessonId
            const completedLessonIds = new Set(userLessons.filter((l) => l.completed).map((l) => l.lessonId));
            // Find completed courses
            const completedCourses = coursesWithLessons.filter((course) => course.Lessons.every((lesson) => completedLessonIds.has(lesson.id)));
            res.status(200).json({ success: true, completedCourses });
        }
        catch (error) {
            console.error("Error fetching completed courses:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // PUT /api/v1/user-course-lessons/:id
    updateUserCourseLesson: async (req, res) => {
        try {
            const { id } = req.params;
            const { startedAt, spentTime, completed, completedAt } = req.body;
            const updated = await prisma_1.prisma.userCourseLesson.update({
                where: { id },
                data: { startedAt, spentTime, completed, completedAt },
            });
            res.status(200).json({ success: true, userCourseLesson: updated });
        }
        catch (error) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "UserCourseLesson not found" });
            }
            console.error("Error updating userCourseLesson:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    // DELETE /api/v1/user-course-lessons/:id
    deleteUserCourseLesson: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma_1.prisma.userCourseLesson.delete({ where: { id } });
            res
                .status(200)
                .json({ success: true, message: "UserCourseLesson deleted" });
        }
        catch (error) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "UserCourseLesson not found" });
            }
            console.error("Error deleting userCourseLesson:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};
