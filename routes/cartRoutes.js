import express from "express";

import {
  getCart,
  addToCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";

import protectBuyer from "../middleware/buyerAuthMiddleware.js";

const router = express.Router();

router.get("/", protectBuyer, getCart);
    
router.post("/", protectBuyer, addToCart);

router.put("/:productId", protectBuyer, updateCartQuantity);

router.delete("/:productId", protectBuyer, removeCartItem);

router.delete("/", protectBuyer, clearCart);

export default router;