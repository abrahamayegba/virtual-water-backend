import { Router } from "express";
import { userCourseLessonController } from "../controllers/userCourseLesson.controller";

export const userCourseLessonRoutes = Router();

userCourseLessonRoutes.post(
  "/",
  userCourseLessonController.createUserCourseLesson
);
userCourseLessonRoutes.get(
  "/",
  userCourseLessonController.getUserCourseLessons
);
userCourseLessonRoutes.get(
  "/:id",
  userCourseLessonController.getUserCourseLessonById
);

userCourseLessonRoutes.get(
  "/user-course/:userCourseId",
  userCourseLessonController.getUserCourseLessonsByUserCourseId
);

userCourseLessonRoutes.get(
  "/user-course/:userCourseId/lesson/:lessonId",
  userCourseLessonController.getUserCourseLessonByUserCourseAndLesson
);

userCourseLessonRoutes.get(
  "/user/:userId",
  userCourseLessonController.getUserCourseLessonsByUserId
);

userCourseLessonRoutes.get(
  "/user/:userId/completed-courses",
  userCourseLessonController.getCompletedCoursesByUserId
);

userCourseLessonRoutes.put(
  "/:id",
  userCourseLessonController.updateUserCourseLesson
);
userCourseLessonRoutes.delete(
  "/:id",
  userCourseLessonController.deleteUserCourseLesson
);
