"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleController = void 0;
const prisma_1 = require("../lib/prisma");
exports.roleController = {
    createRole: async (req, res) => {
        try {
            const { roleName, roleDescription } = req.body;
            if (!roleName)
                return res.status(400).json({ message: "roleName is required" });
            const newRole = await prisma_1.prisma.role.create({
                data: { roleName, roleDescription },
            });
            res.status(201).json({ success: true, role: newRole });
        }
        catch (error) {
            console.error("Error creating role:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    getRoles: async (_, res) => {
        try {
            const roles = await prisma_1.prisma.role.findMany({
                include: { Users: true, Admins: true },
            });
            res.status(200).json({ success: true, roles });
        }
        catch (error) {
            console.error("Error fetching roles:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    getRoleById: async (req, res) => {
        try {
            const { id } = req.params;
            const role = await prisma_1.prisma.role.findUnique({
                where: { id },
                include: { Users: true, Admins: true },
            });
            if (!role)
                return res.status(404).json({ message: "Role not found" });
            res.status(200).json({ success: true, role });
        }
        catch (error) {
            console.error("Error fetching role:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    updateRole: async (req, res) => {
        try {
            const { id } = req.params;
            const { roleName, roleDescription } = req.body;
            const updated = await prisma_1.prisma.role.update({
                where: { id },
                data: { roleName, roleDescription },
            });
            res.status(200).json({ success: true, role: updated });
        }
        catch (error) {
            if (error.code === "P2025")
                return res.status(404).json({ message: "Role not found" });
            console.error("Error updating role:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    deleteRole: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma_1.prisma.role.delete({ where: { id } });
            res.status(200).json({ success: true, message: "Role deleted" });
        }
        catch (error) {
            if (error.code === "P2025")
                return res.status(404).json({ message: "Role not found" });
            console.error("Error deleting role:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};
