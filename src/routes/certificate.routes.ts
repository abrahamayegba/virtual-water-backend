import { Router } from "express";
import { certificateController } from "../controllers/certificate.controller";

export const certificateRoutes = Router();

certificateRoutes.post("/", certificateController.issueCertificate);

certificateRoutes.get("/", certificateController.getCertificates);

certificateRoutes.get(
  "/user/:userId",
  certificateController.getCertificatesByUser,
);


certificateRoutes.get(
  "/course/:courseId",
  certificateController.getCertificatesByCourse,
);

certificateRoutes.get(
  "/company/:companyId",
  certificateController.getCertificatesByCompany,
);
