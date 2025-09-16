"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseLessonRoutes = void 0;
const express_1 = require("express");
const courseLesson_controller_1 = require("../controllers/courseLesson.controller");
const upload_1 = require("../middleware/upload");
const fs_1 = __importDefault(require("fs"));
const filestack_1 = __importDefault(require("../lib/filestack"));
const prisma_1 = require("../lib/prisma");
exports.courseLessonRoutes = (0, express_1.Router)();
exports.courseLessonRoutes.post("/", courseLesson_controller_1.courseLessonController.createLesson);
exports.courseLessonRoutes.get("/", courseLesson_controller_1.courseLessonController.getLessons);
exports.courseLessonRoutes.get("/:id", courseLesson_controller_1.courseLessonController.getLessonById);
exports.courseLessonRoutes.get("/:userCourseId/lessons", courseLesson_controller_1.courseLessonController.getLessonsByUserCourseId);
exports.courseLessonRoutes.put("/:id", courseLesson_controller_1.courseLessonController.updateLesson);
exports.courseLessonRoutes.delete("/:id", courseLesson_controller_1.courseLessonController.deleteLesson);
exports.courseLessonRoutes.post("/upload", upload_1.upload.single("legionella-awareness-revised"), async (req, res) => {
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
        const result = await filestack_1.default.upload(filePath);
        const fileUrl = result.url;
        // Delete local temporary file
        fs_1.default.unlinkSync(filePath);
        // Update file URL in DB for lesson
        const updatedLesson = await prisma_1.prisma.courseLesson.update({
            where: { id: lessonId },
            data: { file: fileUrl },
        });
        res.json({ success: true, lesson: updatedLesson });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ success: false, error: error.message || "Upload failed" });
    }
});
