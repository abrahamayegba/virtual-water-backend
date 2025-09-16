import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const roleController = {
  createRole: async (req: Request, res: Response) => {
    try {
      const { roleName, roleDescription } = req.body;
      if (!roleName)
        return res.status(400).json({ message: "roleName is required" });

      const newRole = await prisma.role.create({
        data: { roleName, roleDescription },
      });
      res.status(201).json({ success: true, role: newRole });
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getRoles: async (_: Request, res: Response) => {
    try {
      const roles = await prisma.role.findMany({
        include: { Users: true, Admins: true },
      });
      res.status(200).json({ success: true, roles });
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getRoleById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const role = await prisma.role.findUnique({
        where: { id },
        include: { Users: true, Admins: true },
      });
      if (!role) return res.status(404).json({ message: "Role not found" });
      res.status(200).json({ success: true, role });
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateRole: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { roleName, roleDescription } = req.body;

      const updated = await prisma.role.update({
        where: { id },
        data: { roleName, roleDescription },
      });
      res.status(200).json({ success: true, role: updated });
    } catch (error: any) {
      if (error.code === "P2025")
        return res.status(404).json({ message: "Role not found" });
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteRole: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.role.delete({ where: { id } });
      res.status(200).json({ success: true, message: "Role deleted" });
    } catch (error: any) {
      if (error.code === "P2025")
        return res.status(404).json({ message: "Role not found" });
      console.error("Error deleting role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
