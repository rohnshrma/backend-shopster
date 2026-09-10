import { Router } from "express";

import {
  getSummary,
  getSalesOverTime,
  getTopProducts,
  getOrdersByStatus,
  getTopCustomers,
} from "../controllers/reportController.js";

import protect from "../middleware/authMiddleware.js";

const router = Router();

router.get("/summary", protect, getSummary);

router.get(
  "/sales-over-time",
  protect,
  getSalesOverTime,
);

router.get(
  "/top-products",
  protect,
  getTopProducts,
);

router.get(
  "/orders-by-status",
  protect,
  getOrdersByStatus,
);

router.get(
  "/top-customers",
  protect,
  getTopCustomers,
);

export default router;