import { Router } from "express";
import { userCourseController } from "../controllers/userCourse.controller";

export const userCourseRoutes = Router();

userCourseRoutes.post("/", userCourseController.createUserCourse);
userCourseRoutes.get(
  "/user/:userId/course/:courseId",
  userCourseController.getUserCourseByCourseId
);
userCourseRoutes.get("/", userCourseController.getUserCourses);
userCourseRoutes.get(
  "/user/:userId",
  userCourseController.getUserCoursesByUserId
);
userCourseRoutes.get("/:id", userCourseController.getUserCourseById);
userCourseRoutes.get(
  "/:userCourseId/lessons-with-progress",
  userCourseController.getLessonsWithProgressByUserCourseId
);
userCourseRoutes.put(
  "/user/:userId/:id",
  userCourseController.updateUserCourseByUserId
);
userCourseRoutes.put("/:id", userCourseController.updateUserCourse);

userCourseRoutes.delete("/:id", userCourseController.deleteUserCourse);
