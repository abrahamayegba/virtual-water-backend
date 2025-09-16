import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const courseCategoryController = {
  // POST /api/v1/categories
  createCategory: async (req: Request, res: Response) => {
    try {
      const { categoryName } = req.body;
      if (!categoryName) {
        return res.status(400).json({ message: "categoryName is required" });
      }

      const category = await prisma.courseCategory.create({
        data: { categoryName },
      });

      res.status(201).json({ success: true, category });
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(409).json({ message: "categoryName must be unique" });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // GET /api/v1/categories
  getCategories: async (_: Request, res: Response) => {
    try {
      const categories = await prisma.courseCategory.findMany({
        // your field is named "Courses" in the Prisma model
        include: { Courses: true },
      });
      res.status(200).json({ success: true, categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // GET /api/v1/categories/:id
  getCategoryById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const category = await prisma.courseCategory.findUnique({
        where: { id },
        include: { Courses: true },
      });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(200).json({ success: true, category });
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // PUT /api/v1/categories/:id
  updateCategory: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { categoryName } = req.body;

      const category = await prisma.courseCategory.update({
        where: { id },
        data: { categoryName },
      });

      res.status(200).json({ success: true, category });
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Category not found" });
      }
      if (error.code === "P2002") {
        return res.status(409).json({ message: "categoryName must be unique" });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // DELETE /api/v1/categories/:id
  deleteCategory: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.courseCategory.delete({ where: { id } });

      res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Category not found" });
      }
      // Block deletes when courses still reference the category
      if (error.code === "P2003") {
        return res
          .status(409)
          .json({ message: "Cannot delete: category has related courses" });
      }
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
