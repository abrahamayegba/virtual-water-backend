import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const companyController = {
  createCompany: async (req: Request, res: Response) => {
    try {
      const { companyName, companyEmail, industry, maxUsers } = req.body;

      if (!companyName || !companyEmail || !industry) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newCompany = await prisma.company.create({
        data: {
          companyName,
          companyEmail,
          industry,
          maxUsers: maxUsers ? Number(maxUsers) : null, // store as number or null
        },
      });

      res.status(201).json({ success: true, company: newCompany });
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getCompanies: async (_: Request, res: Response) => {
    try {
      const companies = await prisma.company.findMany({
        include: { Users: true },
      });
      res.status(200).json({ success: true, companies });
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getCompanyById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          Users: { include: { role: true, UserCourses: true } },
          courseCompanies: { include: { course: true } },
        },
      });

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const mappedUsers = company.Users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.roleName,
        enrolledCourses: u.UserCourses.length,
        completedCourses: u.UserCourses.filter((c) => c.completed).length,
        lastActive: u.updatedAt,
        status: u.passwordSetAt ? "active" : "inactive",
      }));

      res.status(200).json({
        success: true,
        company: {
          id: company.id,
          companyName: company.companyName,
          companyEmail: company.companyEmail,
          industry: company.industry,
          status: company.status,
          maxUsers: company.maxUsers,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
          Users: mappedUsers,
          courses: company.courseCompanies.map((cc) => cc.course),
        },
      });
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateCompany: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { companyName, companyEmail, industry } = req.body;

      const updated = await prisma.company.update({
        where: { id },
        data: { companyName, companyEmail, industry },
      });

      res.status(200).json({ success: true, company: updated });
    } catch (error: any) {
      if (error.code === "P2025")
        return res.status(404).json({ message: "Company not found" });
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteCompany: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.company.delete({ where: { id } });
      res.status(200).json({ success: true, message: "Company deleted" });
    } catch (error: any) {
      if (error.code === "P2025")
        return res.status(404).json({ message: "Company not found" });
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getCompanyFull: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          Users: {
            include: {
              role: true,
              UserCourses: {
                include: { course: true }, // <--- include course info
              },
              sessions: true,
            },
          },
          courseCompanies: {
            include: { course: true },
          },
        },
      });

      if (!company)
        return res.status(404).json({ message: "Company not found" });

      const users = company.Users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.roleName,
        enrolledCourses: u.UserCourses.length,
        completedCourses: u.UserCourses.filter((c) => c.completed).length,
        lastActive: u.sessions.length
          ? u.sessions.reduce((a, b) => (a.expiresAt > b.expiresAt ? a : b))
              .expiresAt
          : null,
        status: u.passwordSetAt ? "active" : "inactive",
        courses: u.UserCourses.map((uc) => ({
          id: uc.course.id,
          title: uc.course.title,
          completed: uc.completed,
          score: uc.score,
          startedAt: uc.startedAt,
          completedAt: uc.completedAt,
        })),
      }));

      const admins = users.filter((u) => u.role.toLowerCase() === "admin");

      const courses = company.courseCompanies.map((cc) => ({
        id: cc.course.id,
        title: cc.course.title,
        description: cc.course.description,
        duration: cc.course.duration,
        assignedUsers: company.Users.filter((u) =>
          u.UserCourses.some((uc) => uc.courseId === cc.course.id),
        ).length,
      }));

      res.status(200).json({
        success: true,
        company: {
          id: company.id,
          companyName: company.companyName,
          companyEmail: company.companyEmail,
          industry: company.industry,
          status: company.status,
          maxUsers: company.maxUsers,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
          users,
          admins,
          courses,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
