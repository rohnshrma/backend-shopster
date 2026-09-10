import { Router } from "express";

import {
  getStoreSettings,
  updateStoreSettings,
} from "../controllers/settingsController.js";

import protect from "../middleware/authMiddleware.js";

import settingsUpload from "../middleware/settingsUpload.js";

const router = Router();

// Public
router.get("/", getStoreSettings);

// Admin only
router.put(
  "/",
  protect,
  settingsUpload.single("logo"),
  updateStoreSettings,
);

export default router;