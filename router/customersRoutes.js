import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getAllCustomers,
  getCustomerById,
  getCustomerOrders,
  updateCustomerStatus,
  deleteCustomer,
} from "../controllers/customerController.js";

const router = express.Router();

// Get all customers
// GET /api/customers
router.get("/", protect, getAllCustomers);

// Get single customer
// GET /api/customers/:id
router.get("/:id", protect, getCustomerById);

// Get customer's orders
// GET /api/customers/:id/orders
router.get("/:id/orders", protect, getCustomerOrders);

// Block / Unblock customer
// PUT /api/customers/:id/status
router.put("/:id/status", protect, updateCustomerStatus);

// Delete customer
// DELETE /api/customers/:id
router.delete("/:id", protect, deleteCustomer);

export default router;