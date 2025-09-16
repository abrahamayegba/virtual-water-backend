"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyController = void 0;
const prisma_1 = require("../lib/prisma");
exports.companyController = {
    createCompany: async (req, res) => {
        try {
            const { companyName, companyEmail, industry } = req.body;
            if (!companyName || !companyEmail || !industry) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const newCompany = await prisma_1.prisma.company.create({
                data: { companyName, companyEmail, industry },
            });
            res.status(201).json({ success: true, company: newCompany });
        }
        catch (error) {
            console.error("Error creating company:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    getCompanies: async (_, res) => {
        try {
            const companies = await prisma_1.prisma.company.findMany({
                include: { Users: true },
            });
            res.status(200).json({ success: true, companies });
        }
        catch (error) {
            console.error("Error fetching companies:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    getCompanyById: async (req, res) => {
        try {
            const { id } = req.params;
            const company = await prisma_1.prisma.company.findUnique({
                where: { id },
                include: { Users: true },
            });
            if (!company)
                return res.status(404).json({ message: "Company not found" });
            res.status(200).json({ success: true, company });
        }
        catch (error) {
            console.error("Error fetching company:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    updateCompany: async (req, res) => {
        try {
            const { id } = req.params;
            const { companyName, companyEmail, industry } = req.body;
            const updated = await prisma_1.prisma.company.update({
                where: { id },
                data: { companyName, companyEmail, industry },
            });
            res.status(200).json({ success: true, company: updated });
        }
        catch (error) {
            if (error.code === "P2025")
                return res.status(404).json({ message: "Company not found" });
            console.error("Error updating company:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    deleteCompany: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma_1.prisma.company.delete({ where: { id } });
            res.status(200).json({ success: true, message: "Company deleted" });
        }
        catch (error) {
            if (error.code === "P2025")
                return res.status(404).json({ message: "Company not found" });
            console.error("Error deleting company:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};
