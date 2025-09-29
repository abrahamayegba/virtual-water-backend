"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const orders_route_1 = require("./routes/orders.route");
const courseCategories_route_1 = require("./routes/courseCategories.route");
const courseLesson_route_1 = require("./routes/courseLesson.route");
const courseObjectives_route_1 = require("./routes/courseObjectives.route");
const courses_route_1 = require("./routes/courses.route");
const lessonTypes_route_1 = require("./routes/lessonTypes.route");
const protected_route_1 = require("./routes/protected.route");
const questionOptions_route_1 = require("./routes/questionOptions.route");
const questions_route_1 = require("./routes/questions.route");
const quizzes_route_1 = require("./routes/quizzes.route");
const roles_route_1 = require("./routes/roles.route");
const userCourseLessons_route_1 = require("./routes/userCourseLessons.route");
const userCourses_route_1 = require("./routes/userCourses.route");
const users_route_1 = require("./routes/users.route");
const auth_routes_1 = require("./routes/auth.routes");
const admins_route_1 = require("./routes/admins.route");
const companies_route_1 = require("./routes/companies.route");
dotenv_1.default.config();
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
const corsOptions = {
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};
const app = (0, express_1.default)();
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (_, res) => {
    res.status(200).json({ message: "Api is healthy ..." });
});
app.use("/api/v1/auth", auth_routes_1.authRoutes);
app.use("/api/v1/orders", orders_route_1.orderRoutes);
app.use("/api/v1/users", users_route_1.userRoutes);
app.use("/api/v1/courses", courses_route_1.courseRoutes);
app.use("/api/v1/course-lessons", courseLesson_route_1.courseLessonRoutes);
app.use("/api/v1/user-courses", userCourses_route_1.userCourseRoutes);
app.use("/api/v1/course-categories", courseCategories_route_1.courseCategoryRoutes);
app.use("/api/v1/questions", questions_route_1.questionRoutes);
app.use("/api/v1/question-options", questionOptions_route_1.questionOptionRoutes);
app.use("/api/v1/quizzes", quizzes_route_1.quizRoutes);
app.use("/api/v1/course-objectives", courseObjectives_route_1.courseObjectiveRoutes);
app.use("/api/v1/user-course-lessons", userCourseLessons_route_1.userCourseLessonRoutes);
app.use("/api/v1/companies", companies_route_1.companyRoutes);
app.use("/api/v1/roles", roles_route_1.roleRoutes);
app.use("/api/v1/lesson-types", lessonTypes_route_1.lessonTypeRoutes);
app.use("/api/v1/admins", admins_route_1.adminRoutes);
app.use("/api/v1", protected_route_1.protectedRoutes);
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
});
