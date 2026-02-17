import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const adminDashboardController = {
  getDashboardData: async (_req: Request, res: Response) => {
    try {
      const companies = await prisma.company.findMany({
        include: {
          Users: {
            include: {
              sessions: true,
              UserCourses: {
                include: { certificates: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      let totalUsers = 0;
      let totalActiveUsers = 0;
      let totalCompletedCourses = 0;

      const formattedCompanies = companies.map((company) => {
        const users = company.Users;
        const usersCount = users.length;
        totalUsers += usersCount;

        const activeUsers = users.filter(
          (u) => u.UserCourses.length > 0,
        ).length;
        totalActiveUsers += activeUsers;

        const completedCourses = users.reduce(
          (sum, u) =>
            sum +
            u.UserCourses.reduce(
              (cSum, uc) => cSum + uc.certificates.length,
              0,
            ),
          0,
        );
        totalCompletedCourses += completedCourses;

        return {
          id: company.id,
          name: company.companyName,
          email: company.companyEmail,
          industry: company.industry,
          usersCount,
          activeUsers,
          completedCourses,
          status: company.status, // use the DB value directly
          createdAt: company.createdAt,
        };
      });

      const engagementRate =
        totalUsers > 0 ? Math.round((totalActiveUsers / totalUsers) * 100) : 0;

      res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          totalActiveUsers,
          totalCompletedCourses,
          activeCompanies: companies.filter((c) => c.status === "ACTIVE")
            .length,
          totalCompanies: companies.length,
          engagementRate,
        },
        companies: formattedCompanies,
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({ message: "Failed to load dashboard data" });
    }
  },
};
