import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const certificateController = {
  // POST /api/v1/certificates
  issueCertificate: async (req: Request, res: Response) => {
    try {
      const { userId, courseId, userCourseId } = req.body;

      if (!userId || !courseId || !userCourseId) {
        return res
          .status(400)
          .json({ message: "userId, courseId and userCourseId are required" });
      }

      // prevent duplicates (extra safety beyond @@unique)
      const existing = await prisma.certificate.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      });

      if (existing) {
        return res.status(409).json({ message: "Certificate already issued" });
      }

      const certificate = await prisma.certificate.create({
        data: {
          userId,
          courseId,
          userCourseId,
        },
      });

      res.status(201).json({ success: true, certificate });
    } catch (error) {
      console.error("Error issuing certificate:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // GET /api/v1/certificates
  getCertificates: async (_: Request, res: Response) => {
    try {
      const certificates = await prisma.certificate.findMany({
        include: {
          user: { include: { company: true } },
          course: true,
        },
        orderBy: { issuedAt: "desc" },
      });

      res.json({ success: true, certificates });
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // GET /api/v1/certificates/course/:courseId
  getCertificatesByCourse: async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;

      const certificates = await prisma.certificate.findMany({
        where: { courseId },
        include: {
          user: { include: { company: true } },
        },
        orderBy: { issuedAt: "desc" },
      });

      res.json({ success: true, certificates });
    } catch (error) {
      console.error("Error fetching certificates by course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // GET /api/v1/certificates/company/:companyId
  getCertificatesByCompany: async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;

      const certificates = await prisma.certificate.findMany({
        where: {
          user: {
            companyId,
          },
        },
        include: {
          user: true,
          course: true,
        },
        orderBy: { issuedAt: "desc" },
      });

      res.json({ success: true, certificates });
    } catch (error) {
      console.error("Error fetching certificates by company:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // GET /api/v1/certificates/user/:userId
  getCertificatesByUser: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const certificates = await prisma.certificate.findMany({
        where: { userId },
        include: {
          course: true,
          userCourse: {
            select: {
              score: true,
              completedAt: true,
            },
          },
        },
        orderBy: { issuedAt: "desc" },
      });

      res.json({ success: true, certificates });
    } catch (error) {
      console.error("Error fetching certificates by user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
