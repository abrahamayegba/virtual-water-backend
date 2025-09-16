import { Router } from "express";
import { orderControllers } from "../controllers/order.controller.ts";

export const orderRoutes = Router();

orderRoutes.get("/", orderControllers.getOrders);
orderRoutes.post("/", orderControllers.createOrder);
orderRoutes.put("/:orderId", orderControllers.updateOrder);
orderRoutes.delete("/:orderId", orderControllers.deleteOrder);
