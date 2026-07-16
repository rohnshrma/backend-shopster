import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/productController.js";
import protect from "../middleware/authMiddleware.js";

const router = Router();

router.route("/").get(getAllProducts);
router.route("/").post(protect, addProduct);
router.route("/:id").put(protect, updateProduct);
router.route("/:id").delete(protect, deleteProduct);

export default router;
