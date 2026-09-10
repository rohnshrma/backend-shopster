import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductImages,
  getProductThumbnail,
  updateProduct,
} from "../controllers/productController.js";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = Router();

router.route("/").get(getAllProducts);
router.route("/").post(protect, upload.array("images", 5), addProduct);
router.route("/:id/images").get(getProductImages);
router.route("/:id/thumbnail").get(getProductThumbnail);
router.route("/:id").put(protect, updateProduct);
router.route("/:id").delete(protect, deleteProduct);

export default router;
