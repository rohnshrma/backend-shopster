import { Router } from "express";
import {
  buyerLogin,
  buyerRegister,
  deleteBuyer,
  getProfile,
  updateBuyer,
} from "../controllers/buyerController.js";
import protectBuyer from "../middleware/buyerAuthMiddleware.js";

const router = Router();

router.post("/register", buyerRegister);
router.post("/login", buyerLogin);

router.get("/profile", protectBuyer, getProfile);
router.put("/profile/:id", protectBuyer, updateBuyer);
router.delete("/profile/:id", protectBuyer, deleteBuyer);

// router.put("/:id", protectBuyer, updateBuyer);
// router.delete("/:id", protectBuyer, deleteBuyer);

export default router;