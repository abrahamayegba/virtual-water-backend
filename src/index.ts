import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { orderRoutes } from "./routes/orders.route.ts";
import { userRoutes } from "./routes/users.route.ts";
import { courseRoutes } from "./routes/courses.route.ts";
import { courseLessonRoutes } from "./routes/courseLesson.route.ts";
import { userCourseRoutes } from "./routes/userCourses.route.ts";
import { courseCategoryRoutes } from "./routes/courseCategories.route.ts";
import { questionRoutes } from "./routes/questions.route.ts";
import { questionOptionRoutes } from "./routes/questionOptions.route.ts";
import { quizRoutes } from "./routes/quizzes.route.ts";
import { courseObjectiveRoutes } from "./routes/courseObjectives.route.ts";
import { userCourseLessonRoutes } from "./routes/userCourseLessons.route.ts";
import { companyRoutes } from "./routes/companies.route.ts";
import { roleRoutes } from "./routes/roles.route.ts";
import cookieParser from "cookie-parser";
import { lessonTypeRoutes } from "./routes/lessonTypes.route.ts";
import { adminRoutes } from "./routes/admins.route.ts";
import { authRoutes } from "./routes/auth.routes.ts";
import { protectedRoutes } from "./routes/protected.route.ts";

dotenv.config();

const allowedOrigin = 'http://localhost:5173';

const corsOptions = {
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  res.status(200).json({ message: "Api is healthy ..." });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/course-lessons", courseLessonRoutes);
app.use("/api/v1/user-courses", userCourseRoutes);
app.use("/api/v1/course-categories", courseCategoryRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/question-options", questionOptionRoutes);
app.use("/api/v1/quizzes", quizRoutes);
app.use("/api/v1/course-objectives", courseObjectiveRoutes);
app.use("/api/v1/user-course-lessons", userCourseLessonRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/lesson-types", lessonTypeRoutes);
app.use("/api/v1/admins", adminRoutes);
app.use("/api/v1", protectedRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
