import express from "express";
import {
  assignCourseToCompany,
  getCompanyCourses,
  removeCourseAssignment,
} from "../controllers/courseCompany.controller";

const courseCompanyRoutes = express.Router();

// Assign a course to a company
courseCompanyRoutes.post("/assign", assignCourseToCompany);

// Get all courses assigned to a company
courseCompanyRoutes.get("/company/:companyId", getCompanyCourses);

// Remove a course assignment
courseCompanyRoutes.delete("/remove", removeCourseAssignment);

export default courseCompanyRoutes;
