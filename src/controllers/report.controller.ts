import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyAccessToken } from "../auth/utils";

// The second company this admin has access to.
// Replace this with the real company ID.
const ADMIN_EXTRA_COMPANY_ID = "cmpmqnn1w0000chu0i1gtt9co";

/**
 * Returns the array of company IDs a non-Super Admin can see.
 * Admin role: their own companyId + the hardcoded extra company.
 * All other non-super-admin roles: only their own companyId.
 */
function getAllowedCompanyIds(role: string, companyId: string): string[] {
  if (role === "Admin") {
    return [companyId, ADMIN_EXTRA_COMPANY_ID];
  }
  return [companyId];
}

export const reportController = {
  // =============================
  // OVERVIEW
  // =============================
  getOverview: async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.accessToken;
      if (!token) return res.status(401).json({ message: "Unauthorized" });

      const payload = verifyAccessToken(token);
      const isSuperAdmin = payload.role === "Super Admin";
      const allowedIds = isSuperAdmin
        ? null
        : getAllowedCompanyIds(payload.role, payload.companyId);

      const userCompanyFilter = isSuperAdmin
        ? {}
        : { companyId: { in: allowedIds! } };

      const [
        totalUsers,
        totalCourses,
        completedCourses,
        certificatesIssued,
        activeUsers,
        avgScore,
      ] = await Promise.all([
        prisma.user.count({ where: userCompanyFilter }),
        prisma.course.count({ where: { status: "PUBLISHED" } }),
        prisma.userCourse.count({
          where: {
            completed: true,
            ...(!isSuperAdmin && {
              user: { companyId: { in: allowedIds! } },
            }),
          },
        }),
        prisma.certificate.count({
          where: isSuperAdmin
            ? {}
            : { user: { companyId: { in: allowedIds! } } },
        }),
        prisma.userCourse.groupBy({
          by: ["userId"],
          ...(!isSuperAdmin && {
            where: { user: { companyId: { in: allowedIds! } } },
          }),
        }),
        prisma.userCourse.aggregate({
          _avg: { score: true },
          where: {
            completed: true,
            ...(!isSuperAdmin && {
              user: { companyId: { in: allowedIds! } },
            }),
          },
        }),
      ]);

      res.json({
        totalUsers,
        activeUsers: activeUsers.length,
        totalCourses,
        completedCourses,
        certificatesIssued,
        averageScore: Math.round(avgScore._avg.score || 0),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load overview" });
    }
  },

  // =============================
  // BY COMPANY
  // =============================
  getByCompany: async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.accessToken;
      if (!token) return res.status(401).json({ message: "Unauthorized" });

      const payload = verifyAccessToken(token);
      const isSuperAdmin = payload.role === "Super Admin";
      const allowedIds = isSuperAdmin
        ? null
        : getAllowedCompanyIds(payload.role, payload.companyId);

      const companyFilter = isSuperAdmin ? {} : { id: { in: allowedIds! } };

      const companies = await prisma.company.findMany({
        where: companyFilter,
        include: {
          Users: {
            where: isSuperAdmin ? {} : { companyId: { in: allowedIds! } },
            include: {
              UserCourses: {
                where: isSuperAdmin
                  ? {}
                  : { user: { companyId: { in: allowedIds! } } },
              },
              certificates: true,
            },
          },
        },
      });

      const data = companies.map((c) => {
        const users = c.Users.length;
        const completedCourses = c.Users.flatMap((u) =>
          u.UserCourses.filter((uc) => uc.completed),
        );
        const completions = completedCourses.length;
        const scores = completedCourses.map((uc) => uc.score);
        const avgScore = scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;
        const certificates = c.Users.reduce(
          (sum, u) => sum + u.certificates.length,
          0,
        );

        return {
          name: c.companyName,
          users,
          completions,
          avgScore,
          certificates,
        };
      });

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load company report" });
    }
  },

  // =============================
  // BY COURSE
  // =============================
  getByCourse: async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.accessToken;
      if (!token) return res.status(401).json({ message: "Unauthorized" });

      const payload = verifyAccessToken(token);
      const isSuperAdmin = payload.role === "Super Admin";
      const allowedIds = isSuperAdmin
        ? null
        : getAllowedCompanyIds(payload.role, payload.companyId);

      const courses = await prisma.course.findMany({
        where: {
          status: "PUBLISHED",
          ...(!isSuperAdmin && {
            CourseCompanies: {
              some: { companyId: { in: allowedIds! } },
            },
          }),
        },
        include: {
          UserCourses: {
            where: isSuperAdmin
              ? {}
              : { user: { companyId: { in: allowedIds! } } },
            include: { certificates: true },
          },
        },
      });

      const data = courses.map((c) => {
        const completedCourses = c.UserCourses.filter((uc) => uc.completed);
        const passedCourses = completedCourses.filter(
          (uc) => uc.certificates.length > 0,
        );
        const enrolled = c.UserCourses.length;
        const completed = completedCourses.length;
        const avgScore =
          completed > 0
            ? Math.round(
                completedCourses.reduce((sum, uc) => sum + uc.score, 0) /
                  completed,
              )
            : 0;
        const passRate =
          completed > 0
            ? Math.round((passedCourses.length / completed) * 100)
            : 0;

        return { title: c.title, enrolled, completed, avgScore, passRate };
      });

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load course report" });
    }
  },

  // =============================
  // RECENT COMPLETIONS
  // =============================
  getRecent: async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.accessToken;
      if (!token) return res.status(401).json({ message: "Unauthorized" });

      const payload = verifyAccessToken(token);
      const isSuperAdmin = payload.role === "Super Admin";
      const allowedIds = isSuperAdmin
        ? null
        : getAllowedCompanyIds(payload.role, payload.companyId);

      const recent = await prisma.userCourse.findMany({
        where: {
          completed: true,
          ...(!isSuperAdmin && {
            user: { companyId: { in: allowedIds! } },
          }),
        },
        orderBy: { completedAt: "desc" },
        take: 5,
        include: {
          user: { include: { company: true } },
          course: true,
        },
      });

      const data = recent.map((r) => ({
        id: r.id,
        user: r.user.name,
        company: r.user.company.companyName,
        course: r.course.title,
        score: r.score,
        completedAt: r.completedAt,
      }));

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load recent completions" });
    }
  },

  // =============================
  // USER TRAINING RECORDS
  // =============================
  getUserTrainingRecords: async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.accessToken;
      if (!token) return res.status(401).json({ message: "Unauthorized" });

      const payload = verifyAccessToken(token);
      const isSuperAdmin = payload.role === "Super Admin";
      const allowedIds = isSuperAdmin
        ? null
        : getAllowedCompanyIds(payload.role, payload.companyId);

      const userFilter = isSuperAdmin ? {} : { companyId: { in: allowedIds! } };

      const users = await prisma.user.findMany({
        where: userFilter,
        include: {
          company: true,
          UserCourses: {
            include: {
              course: true,
              UserCourseLessons: true,
              certificates: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      const data = users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        company: u.company.companyName,
        courses: u.UserCourses.map((uc) => {
          const certificate = uc.certificates[0];
          const hasCompletedLesson = uc.UserCourseLessons?.some(
            (l) => l.completed,
          );

          let status: "not started" | "in-progress" | "completed" =
            "not started";
          if (certificate) status = "completed";
          else if (hasCompletedLesson || uc.completed) status = "in-progress";

          return {
            courseId: uc.courseId,
            courseTitle: uc.course.title,
            status,
            score: uc.completed ? (uc.score ?? null) : null,
            completedAt: uc.completedAt,
            certificateId: certificate?.id ?? null,
            certificateExpiry: certificate?.issuedAt
              ? new Date(
                  new Date(certificate.issuedAt).setFullYear(
                    new Date(certificate.issuedAt).getFullYear() + 1,
                  ),
                )
              : null,
          };
        }),
      }));

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load user training records" });
    }
  },
};
