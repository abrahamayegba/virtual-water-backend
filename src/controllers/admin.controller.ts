import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const adminController = {
  // Create admin
  createAdmin: async (req: Request, res: Response) => {
    try {
      const { name, email, roleId } = req.body;
      const admin = await prisma.admin.create({
        data: { name, email, roleId },
        include: { role: true },
      });
      res.status(201).json({ success: true, admin });
    } catch (error) {
      console.error("Error creating admin:", error);
      res
        .status(500)
        .json({ message: "Internal server error while creating admin" });
    }
  },

  // Get all admins
  getAdmins: async (_req: Request, res: Response) => {
    try {
      const admins = await prisma.admin.findMany({ include: { role: true } });
      res.status(200).json({ success: true, admins });
    } catch (error) {
      console.error("Error fetching admins:", error);
      res
        .status(500)
        .json({ message: "Internal server error while fetching admins" });
    }
  },

  // Get admin by ID
  getAdminById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const admin = await prisma.admin.findUnique({
        where: { id },
        include: { role: true },
      });
      if (!admin) return res.status(404).json({ message: "Admin not found" });
      res.status(200).json({ success: true, admin });
    } catch (error) {
      console.error("Error fetching admin:", error);
      res
        .status(500)
        .json({ message: "Internal server error while fetching admin" });
    }
  },

  // Update admin
  updateAdmin: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, email, roleId } = req.body;
      const admin = await prisma.admin.update({
        where: { id },
        data: { name, email, roleId },
        include: { role: true },
      });
      res.status(200).json({ success: true, admin });
    } catch (error) {
      console.error("Error updating admin:", error);
      res
        .status(500)
        .json({ message: "Internal server error while updating admin" });
    }
  },

  // Delete admin
  deleteAdmin: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const admin = await prisma.admin.delete({ where: { id } });
      res.status(200).json({ success: true, message: "Admin deleted", admin });
    } catch (error) {
      console.error("Error deleting admin:", error);
      res
        .status(500)
        .json({ message: "Internal server error while deleting admin" });
    }
  },
};
