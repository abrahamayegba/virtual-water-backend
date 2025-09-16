import { Router } from "express";
import { companyController } from "../controllers/company.controller";

export const companyRoutes = Router();

companyRoutes.post("/", companyController.createCompany);
companyRoutes.get("/", companyController.getCompanies);
companyRoutes.get("/:id", companyController.getCompanyById);
companyRoutes.put("/:id", companyController.updateCompany);
companyRoutes.delete("/:id", companyController.deleteCompany);
