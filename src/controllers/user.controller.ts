import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Controller for User-related endpoints
export const userControllers = {
  getUsers: async (req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        include: {
          company: true,
          role: true,
          UserCourses: true,
        },
      });
      res.status(200).json({ success: true, users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res
        .status(500)
        .json({ message: "Internal server error while fetching users" });
    }
  },

  getUserById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          company: true,
          role: true,
          UserCourses: true,
        },
      });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res
        .status(500)
        .json({ message: "Internal server error while fetching user" });
    }
  },

  createUser: async (req: Request, res: Response) => {
    try {
      const { name, email, companyId, roleId } = req.body;
      if (!name || !email || !companyId || !roleId) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const user = await prisma.user.create({
        data: { name, email, companyId, roleId },
      });
      res.status(201).json({ success: true, message: "User created", user });
    } catch (error) {
      console.error("Error creating user:", error);
      res
        .status(500)
        .json({ message: "Internal server error while creating user" });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, email, companyId, roleId } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { name, email, companyId, roleId },
      });

      res.status(200).json({ success: true, message: "User updated", user });
    } catch (error) {
      console.error("Error updating user:", error);
      res
        .status(500)
        .json({ message: "Internal server error while updating user" });
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.session.deleteMany({
        where: { userId: id },
      });
      const user = await prisma.user.delete({ where: { id } });
      res.status(200).json({ success: true, message: "User deleted", user });
    } catch (error) {
      console.error("Error deleting user:", error);
      res
        .status(500)
        .json({ message: "Internal server error while deleting user" });
    }
  },
};
