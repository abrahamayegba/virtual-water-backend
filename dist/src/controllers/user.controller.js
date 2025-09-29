"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userControllers = void 0;
const prisma_1 = require("../lib/prisma");
// Controller for User-related endpoints
exports.userControllers = {
    getUsers: async (req, res) => {
        try {
            const users = await prisma_1.prisma.user.findMany({
                include: {
                    company: true,
                    role: true,
                    UserCourses: true,
                },
            });
            res.status(200).json({ success: true, users });
        }
        catch (error) {
            console.error("Error fetching users:", error);
            res
                .status(500)
                .json({ message: "Internal server error while fetching users" });
        }
    },
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await prisma_1.prisma.user.findUnique({
                where: { id },
                include: {
                    company: true,
                    role: true,
                    UserCourses: true,
                },
            });
            if (!user)
                return res.status(404).json({ message: "User not found" });
            res.status(200).json({ success: true, user });
        }
        catch (error) {
            console.error("Error fetching user:", error);
            res
                .status(500)
                .json({ message: "Internal server error while fetching user" });
        }
    },
    createUser: async (req, res) => {
        try {
            const { name, email, companyId, roleId } = req.body;
            if (!name || !email || !companyId || !roleId) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const user = await prisma_1.prisma.user.create({
                data: { name, email, companyId, roleId },
            });
            res.status(201).json({ success: true, message: "User created", user });
        }
        catch (error) {
            console.error("Error creating user:", error);
            res
                .status(500)
                .json({ message: "Internal server error while creating user" });
        }
    },
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, companyId, roleId } = req.body;
            const user = await prisma_1.prisma.user.update({
                where: { id },
                data: { name, email, companyId, roleId },
            });
            res.status(200).json({ success: true, message: "User updated", user });
        }
        catch (error) {
            console.error("Error updating user:", error);
            res
                .status(500)
                .json({ message: "Internal server error while updating user" });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma_1.prisma.session.deleteMany({
                where: { userId: id },
            });
            const user = await prisma_1.prisma.user.delete({ where: { id } });
            res.status(200).json({ success: true, message: "User deleted", user });
        }
        catch (error) {
            console.error("Error deleting user:", error);
            res
                .status(500)
                .json({ message: "Internal server error while deleting user" });
        }
    },
};
