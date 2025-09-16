"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderControllers = void 0;
const prisma_1 = require("../lib/prisma");
exports.orderControllers = {
    getOrders: async (req, res) => {
        try {
            const orders = await prisma_1.prisma.order.findMany({});
            res.status(200).json({ success: true, orders });
        }
        catch (error) {
            console.error("Error fetching orders:", error);
            res
                .status(500)
                .json({ message: "Internal server error while fetching orders" });
        }
    },
    createOrder: async (req, res) => {
        try {
            const { name, description, category } = req.body;
            if (!name || !description)
                return res
                    .status(400)
                    .json({ message: "Name and description are required" });
            const order = await prisma_1.prisma.order.create({
                data: {
                    name,
                    description,
                    category,
                },
            });
            res
                .status(201)
                .json({ success: true, message: "Order created successfully", order });
        }
        catch (error) {
            console.log("Internal server error while creating orders");
            res
                .status(500)
                .json({ message: "Internal server error while creating orders" });
        }
    },
    updateOrder: async (req, res) => {
        try {
            const { name, description, category, orderId } = req.body;
            const order = await prisma_1.prisma.order.updateMany({
                where: {
                    id: orderId,
                },
                data: {
                    name: name,
                    description: description,
                    category: category,
                },
            });
            if (!order)
                return res
                    .status(404)
                    .json({ success: false, message: "Order not found " });
            res
                .status(200)
                .json({ success: true, message: "Order updated successfully", order });
        }
        catch (error) {
            console.log("Internal server error while updating orders");
            res
                .status(500)
                .json({ message: "Internal server error while updating orders" });
        }
    },
    deleteOrder: async (req, res) => {
        try {
            const { orderId } = req.body;
            const order = await prisma_1.prisma.order.delete({ where: { id: orderId } });
            res.status(200).json({ message: "Order deleted successfully", order });
        }
        catch (error) {
            console.log("Internal server error while deleting orders");
            res
                .status(500)
                .json({ message: "Internal server error while deleting orders" });
        }
    },
};
